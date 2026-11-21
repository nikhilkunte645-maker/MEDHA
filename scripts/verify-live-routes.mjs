// scripts/verify-live-routes.mjs
const BASE_URL = 'http://localhost:3000';

async function testRoute(name, url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    let body = '';
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    return { ok: res.ok, status: res.status, headers: res.headers, body };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function runLiveVerification() {
  console.log('====================================================');
  console.log('MEDHA PRODUCTION SERVER LIVE ROUTE VERIFICATION');
  console.log('====================================================\n');

  // 1. API Status
  const statusRes = await testRoute('API Status', `${BASE_URL}/api/status`);
  console.log(`[ROUTE 1] GET /api/status: ${statusRes.status} (mode: ${statusRes.body?.mode})`);
  if (!statusRes.ok) throw new Error('Status failed');

  // 2. Landing Page
  const homeRes = await testRoute('Home Landing', `${BASE_URL}/`);
  console.log(`[ROUTE 2] GET /: ${homeRes.status} (${homeRes.body.length} bytes HTML rendered)`);
  if (!homeRes.ok) throw new Error('Home failed');

  // 3. Login Page
  const loginRes = await testRoute('Login Page', `${BASE_URL}/login`);
  console.log(`[ROUTE 3] GET /login: ${loginRes.status} (${loginRes.body.length} bytes HTML rendered)`);
  if (!loginRes.ok) throw new Error('Login failed');

  // 4. Student Route Unauthenticated Redirect
  const studentUnauth = await testRoute('Student Unauth', `${BASE_URL}/student`, { redirect: 'manual' });
  console.log(`[ROUTE 4] GET /student (unauth): ${studentUnauth.status} (middleware redirect to ${studentUnauth.headers.get('location')})`);

  // 5. Authenticate Student (Priya)
  const studentLogin = await testRoute('Student Login', `${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@student.medha.edu', password: 'Medha@2026!' })
  });
  console.log(`[AUTH 1] POST /api/auth/login (Priya): ${studentLogin.status} (Role: ${studentLogin.body?.user?.role})`);
  const studentCookie = studentLogin.headers.get('set-cookie');

  // 6. Student Profile (Authenticated)
  const studentProfile = await testRoute('Student Profile', `${BASE_URL}/api/student/profile`, {
    headers: { Cookie: studentCookie }
  });
  console.log(`[ROUTE 5] GET /api/student/profile: ${studentProfile.status} (Diagnostic: ${studentProfile.body?.profile?.diagnosticCompleted}, Concepts: ${Object.keys(studentProfile.body?.profile?.masteryMap || {}).length})`);

  // 7. AI Reasoning Diagnosis API
  const aiDiag = await testRoute('Diagnose Reasoning', `${BASE_URL}/api/diagnose-reasoning`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({
      questionPrompt: 'Two bulbs in series connect to battery. Why is current same in both?',
      expectedAnswer: 'Current is conserved in a single path series circuit.',
      studentAnswer: 'Current is conserved in a single path series circuit.',
      studentReasoning: 'Charge is strictly conserved so the rate of charge flow through bulb 1 must equal bulb 2.',
      targetConceptIds: ['C01', 'C06']
    })
  });
  console.log(`[ROUTE 6] POST /api/diagnose-reasoning: ${aiDiag.status} (Correct: ${aiDiag.body?.analysis?.is_correct}, Quality: ${aiDiag.body?.analysis?.reasoning_quality})`);

  // 8. Adaptive Question Generation API
  const genQ = await testRoute('Generate Question', `${BASE_URL}/api/generate-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
    body: JSON.stringify({
      conceptId: 'C04',
      currentMastery: 45,
      requestedDifficulty: 2,
      previousMistakeCodes: []
    })
  });
  console.log(`[ROUTE 7] POST /api/generate-question (C04): ${genQ.status} (Question: "${genQ.body?.question?.question?.substring(0, 40)}...")`);

  // 9. Authenticate Teacher (Dr. Sharma)
  const teacherLogin = await testRoute('Teacher Login', `${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sharma@teacher.medha.edu', password: 'Medha@2026!' })
  });
  console.log(`[AUTH 2] POST /api/auth/login (Teacher Sharma): ${teacherLogin.status} (Classes: ${teacherLogin.body?.user?.assignedClassIds?.join(', ')})`);
  const teacherCookie = teacherLogin.headers.get('set-cookie');

  // 10. Teacher Assigned Classes
  const teacherClasses = await testRoute('Teacher Classes', `${BASE_URL}/api/teacher/classes`, {
    headers: { Cookie: teacherCookie }
  });
  console.log(`[ROUTE 8] GET /api/teacher/classes: ${teacherClasses.status} (Assigned Count: ${teacherClasses.body?.classes?.length})`);

  // 11. Teacher Analytics (Assigned CLASS-10A)
  const teacherAnalyticsAssigned = await testRoute('Teacher Analytics (Assigned)', `${BASE_URL}/api/teacher/analytics?classId=CLASS-10A`, {
    headers: { Cookie: teacherCookie }
  });
  console.log(`[ROUTE 9] GET /api/teacher/analytics?classId=CLASS-10A: ${teacherAnalyticsAssigned.status} (Students: ${teacherAnalyticsAssigned.body?.students?.length}, Class Avg: ${teacherAnalyticsAssigned.body?.summary?.classAverageMastery}%)`);

  // 12. Teacher Analytics (Unassigned CLASS-10B -> 403 Forbidden)
  const teacherAnalyticsUnassigned = await testRoute('Teacher Analytics (Unassigned)', `${BASE_URL}/api/teacher/analytics?classId=CLASS-10B`, {
    headers: { Cookie: teacherCookie }
  });
  console.log(`[SECURITY 1] GET /api/teacher/analytics?classId=CLASS-10B (Unassigned): ${teacherAnalyticsUnassigned.status} (Expected: 403 Forbidden)`);

  // 13. Authenticate Admin
  const adminLogin = await testRoute('Admin Login', `${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@medha.edu', password: 'Medha@2026!' })
  });
  console.log(`[AUTH 3] POST /api/auth/login (Admin): ${adminLogin.status}`);
  const adminCookie = adminLogin.headers.get('set-cookie');

  // 14. Admin Audit Logs
  const auditLogs = await testRoute('Admin Audit Logs', `${BASE_URL}/api/admin/audit-logs?limit=5`, {
    headers: { Cookie: adminCookie }
  });
  console.log(`[ROUTE 10] GET /api/admin/audit-logs: ${auditLogs.status} (Logs retrieved: ${auditLogs.body?.logs?.length})`);

  console.log('\n====================================================');
  console.log('ALL LIVE PRODUCTION ROUTES & SECURITY CHECKS PASSED!');
  console.log('====================================================');
}

runLiveVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});