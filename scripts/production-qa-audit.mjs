import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';

async function request(urlPath, options = {}) {
  const url = `${BASE_URL}${urlPath}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    redirect: 'manual'
  });
  
  const status = res.status;
  const setCookie = res.headers.get('set-cookie');
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  
  return { status, data, setCookie, headers: res.headers };
}

async function runAudit() {
  console.log('====================================================');
  console.log('MEDHA PRODUCTION SERVER COMPREHENSIVE QA AUDIT');
  console.log('====================================================\n');
  
  const results = {
    phase1: {},
    phase2: {},
    phase3: {},
    phase4: {},
    phase5: {},
    phase7: {}
  };

  // ----------------------------------------------------
  // PHASE 1: Production Server Verification
  // ----------------------------------------------------
  console.log('[PHASE 1] Server Infrastructure & Route Handlers:');
  
  // 1.1 Status API
  const statusRes = await request('/api/status');
  console.log(`  1.1 GET /api/status -> ${statusRes.status} (mode: ${statusRes.data?.mode})`);
  assert.strictEqual(statusRes.status, 200);
  assert.strictEqual(statusRes.data.status, 'ok');
  results.phase1.statusApi = { status: statusRes.status, mode: statusRes.data.mode, pass: true };

  // 1.2 Landing Page
  const landingRes = await request('/');
  console.log(`  1.2 GET / -> ${landingRes.status} (${landingRes.data.length} bytes HTML)`);
  assert.strictEqual(landingRes.status, 200);
  assert.ok(landingRes.data.includes('Meet Medha') || landingRes.data.includes('MEDHA'));
  results.phase1.landingPage = { status: landingRes.status, pass: true };

  // 1.3 Login Page
  const loginRes = await request('/login');
  console.log(`  1.3 GET /login -> ${loginRes.status} (${loginRes.data.length} bytes HTML)`);
  assert.strictEqual(loginRes.status, 200);
  assert.ok(loginRes.data.includes('medha') || loginRes.data.includes('priya') || loginRes.data.includes('login') || loginRes.data.length > 5000);
  results.phase1.loginPage = { status: loginRes.status, pass: true };

  // 1.4 Unauthenticated Route Protections
  const unauthStudent = await request('/student');
  console.log(`  1.4 GET /student (unauth) -> ${unauthStudent.status} (redirect to login)`);
  assert.ok(unauthStudent.status === 307 || unauthStudent.status === 302);
  results.phase1.unauthStudent = { status: unauthStudent.status, pass: true };

  const unauthTeacher = await request('/teacher');
  console.log(`  1.5 GET /teacher (unauth) -> ${unauthTeacher.status} (redirect to login)`);
  assert.ok(unauthTeacher.status === 307 || unauthTeacher.status === 302);
  results.phase1.unauthTeacher = { status: unauthTeacher.status, pass: true };

  const unauthAdmin = await request('/admin');
  console.log(`  1.6 GET /admin (unauth) -> ${unauthAdmin.status} (redirect to login)`);
  assert.ok(unauthAdmin.status === 307 || unauthAdmin.status === 302);
  results.phase1.unauthAdmin = { status: unauthAdmin.status, pass: true };

  console.log('✓ PHASE 1 COMPLETED: Server routes, middleware guards, and HTML rendering verified.\n');

  // ----------------------------------------------------
  // PHASE 2: Student Journey
  // ----------------------------------------------------
  console.log('[PHASE 2] Student Journey & Learning Engine:');

  // 2.1 Student Login
  const studentLoginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@student.medha.edu', password: 'Medha@2026!' })
  });
  console.log(`  2.1 POST /api/auth/login (Priya) -> ${studentLoginRes.status} (Role: ${studentLoginRes.data?.user?.role})`);
  assert.strictEqual(studentLoginRes.status, 200);
  assert.strictEqual(studentLoginRes.data.user.role, 'student');
  const studentCookie = studentLoginRes.setCookie ? studentLoginRes.setCookie.split(';')[0] : '';
  assert.ok(studentCookie.includes('medha_session='));

  // 2.2 Student Profile & Learner Progress
  const profileRes = await request('/api/student/profile', {
    headers: { Cookie: studentCookie }
  });
  console.log(`  2.2 GET /api/student/profile -> ${profileRes.status} (Diagnostic: ${profileRes.data?.profile?.diagnosticCompleted})`);
  assert.strictEqual(profileRes.status, 200);
  assert.strictEqual(profileRes.data.profile.diagnosticCompleted, true);
  const initialAttemptsCount = profileRes.data.profile.attempts.length;
  console.log(`      Initial recorded attempts: ${initialAttemptsCount}`);

  // 2.3 Diagnostic Reasoning Analysis API
  const soundReasoningRes = await request('/api/diagnose-reasoning', {
    method: 'POST',
    headers: { Cookie: studentCookie },
    body: JSON.stringify({
      questionPrompt: 'A current of 5 A flows through a conductor for 2 seconds. What is the amount of charge that passes through the cross-section?',
      expectedAnswer: 'B',
      studentAnswer: 'B',
      studentReasoning: 'Current is the rate of flow of charge, defined as I = Q/t. In 2 seconds, with 5 Amperes, Q = I * t = 5 * 2 = 10 Coulombs.',
      targetConceptIds: ['C01']
    })
  });
  console.log(`  2.3 POST /api/diagnose-reasoning (Sound Reasoning) -> ${soundReasoningRes.status} (is_correct: ${soundReasoningRes.data?.analysis?.is_correct}, misconception: ${soundReasoningRes.data?.analysis?.misconception_detected})`);
  assert.strictEqual(soundReasoningRes.status, 200);
  assert.strictEqual(soundReasoningRes.data.analysis.is_correct, true);
  assert.strictEqual(soundReasoningRes.data.analysis.misconception_detected, false);

  // 2.4 Diagnostic Misconception Detection
  const flawedReasoningRes = await request('/api/diagnose-reasoning', {
    method: 'POST',
    headers: { Cookie: studentCookie },
    body: JSON.stringify({
      questionPrompt: 'Two identical bulbs are connected in series to a battery. Compare the brightness of the first and second bulb.',
      expectedAnswer: 'A',
      studentAnswer: 'B',
      studentReasoning: 'The first bulb uses up most of the current so less current is left for the second bulb in series.',
      targetConceptIds: ['C03']
    })
  });
  console.log(`  2.4 POST /api/diagnose-reasoning (Flawed Reasoning) -> ${flawedReasoningRes.status} (Misconception: ${flawedReasoningRes.data?.analysis?.misconception_title})`);
  assert.strictEqual(flawedReasoningRes.status, 200);
  assert.strictEqual(flawedReasoningRes.data.analysis.misconception_detected, true);
  assert.strictEqual(flawedReasoningRes.data.analysis.misconception_code, 'SERIES_CURRENT_DECAY');

  // 2.5 Submit Practice Attempt & Engine Update
  const attemptSubmitRes = await request('/api/student/attempts', {
    method: 'POST',
    headers: { Cookie: studentCookie },
    body: JSON.stringify({
      questionId: 'P_TEST_01',
      selectedAnswer: 'A',
      writtenReasoning: 'According to Ohm law, V = IR, so R = V/I. With 12V and 2A, resistance is 6 ohms.',
      isCorrect: true,
      targetConceptIds: ['C04'],
      difficulty: 2,
      reasoningQuality: 'sound'
    })
  });
  console.log(`  2.5 POST /api/student/attempts -> ${attemptSubmitRes.status} (New Mastery C04: ${attemptSubmitRes.data?.profile?.masteryMap?.C04?.score}%)`);
  assert.strictEqual(attemptSubmitRes.status, 200);
  assert.strictEqual(attemptSubmitRes.data.success, true);
  assert.ok(typeof attemptSubmitRes.data.profile.masteryMap.C04.score === 'number');

  // 2.6 Persistence Verification: Verify attempt is saved in profile
  const profileAfterAttempt = await request('/api/student/profile', {
    headers: { Cookie: studentCookie }
  });
  assert.strictEqual(profileAfterAttempt.data.profile.attempts.length, initialAttemptsCount + 1);
  console.log(`  2.6 Persistence check: Attempts count increased to ${profileAfterAttempt.data.profile.attempts.length}`);

  // 2.7 Logout Verification
  const logoutRes = await request('/api/auth/logout', {
    method: 'POST',
    headers: { Cookie: studentCookie }
  });
  console.log(`  2.7 POST /api/auth/logout -> ${logoutRes.status}`);
  assert.strictEqual(logoutRes.status, 200);

  const profileAfterLogout = await request('/api/student/profile', {
    headers: { Cookie: studentCookie }
  });
  console.log(`      Post-logout /api/student/profile -> ${profileAfterLogout.status} (Expected: 401)`);
  assert.strictEqual(profileAfterLogout.status, 401);

  console.log('✓ PHASE 2 COMPLETED: Student authentication, diagnosis, practice attempt, persistence, and logout verified.\n');

  // ----------------------------------------------------
  // PHASE 3: Teacher Journey
  // ----------------------------------------------------
  console.log('[PHASE 3] Teacher Journey & Class Analytics:');

  // 3.1 Teacher Login
  const teacherLoginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'sharma@teacher.medha.edu', password: 'Medha@2026!' })
  });
  console.log(`  3.1 POST /api/auth/login (Teacher) -> ${teacherLoginRes.status} (Role: ${teacherLoginRes.data?.user?.role})`);
  assert.strictEqual(teacherLoginRes.status, 200);
  assert.strictEqual(teacherLoginRes.data.user.role, 'teacher');
  const teacherCookie = teacherLoginRes.setCookie ? teacherLoginRes.setCookie.split(';')[0] : '';

  // 3.2 Assigned Classes
  const classesRes = await request('/api/teacher/classes', {
    headers: { Cookie: teacherCookie }
  });
  console.log(`  3.2 GET /api/teacher/classes -> ${classesRes.status} (Classes count: ${classesRes.data?.classes?.length})`);
  assert.strictEqual(classesRes.status, 200);
  assert.strictEqual(classesRes.data.classes.length, 1);
  assert.strictEqual(classesRes.data.classes[0].id, 'CLASS-10A');

  // 3.3 Class Analytics for Assigned Class
  const classAnalyticsRes = await request('/api/teacher/analytics?classId=CLASS-10A', {
    headers: { Cookie: teacherCookie }
  });
  console.log(`  3.3 GET /api/teacher/analytics?classId=CLASS-10A -> ${classAnalyticsRes.status} (Students: ${classAnalyticsRes.data?.summary?.enrolledStudents}, Avg: ${classAnalyticsRes.data?.summary?.classAverageMastery}%)`);
  assert.strictEqual(classAnalyticsRes.status, 200);
  assert.strictEqual(classAnalyticsRes.data.success, true);
  assert.ok(classAnalyticsRes.data.summary.enrolledStudents >= 2);
  assert.ok(Array.isArray(classAnalyticsRes.data.misconceptionFrequencies));

  // 3.4 Student Drilldown
  const studentDrilldownRes = await request('/api/teacher/students/usr_student_priya', {
    headers: { Cookie: teacherCookie }
  });
  console.log(`  3.4 GET /api/teacher/students/usr_student_priya -> ${studentDrilldownRes.status} (Student: ${studentDrilldownRes.data?.student?.name})`);
  assert.strictEqual(studentDrilldownRes.status, 200);
  assert.strictEqual(studentDrilldownRes.data.student.email, 'priya@student.medha.edu');

  // 3.5 Security: Teacher Accessing Unassigned Class (CLASS-10B)
  const unassignedClassRes = await request('/api/teacher/analytics?classId=CLASS-10B', {
    headers: { Cookie: teacherCookie }
  });
  console.log(`  3.5 Security Check: GET /api/teacher/analytics?classId=CLASS-10B -> ${unassignedClassRes.status} (Expected: 403 Forbidden)`);
  assert.strictEqual(unassignedClassRes.status, 403);

  // 3.6 Security: Teacher Accessing Student in Unassigned Class (Rohit in Class 10B)
  const unassignedStudentRes = await request('/api/teacher/students/usr_student_rohit', {
    headers: { Cookie: teacherCookie }
  });
  console.log(`  3.6 Security Check: GET /api/teacher/students/usr_student_rohit -> ${unassignedStudentRes.status} (Expected: 403 Forbidden)`);
  assert.strictEqual(unassignedStudentRes.status, 403);

  console.log('✓ PHASE 3 COMPLETED: Teacher scoped access, analytics, drilldown, and cross-class security isolation verified.\n');

  // ----------------------------------------------------
  // PHASE 4: Admin Journey
  // ----------------------------------------------------
  console.log('[PHASE 4] Administrator Governance & Security:');

  // 4.1 Admin Login
  const adminLoginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@medha.edu', password: 'Medha@2026!' })
  });
  console.log(`  4.1 POST /api/auth/login (Admin) -> ${adminLoginRes.status} (Role: ${adminLoginRes.data?.user?.role})`);
  assert.strictEqual(adminLoginRes.status, 200);
  assert.strictEqual(adminLoginRes.data.user.role, 'admin');
  const adminCookie = adminLoginRes.setCookie ? adminLoginRes.setCookie.split(';')[0] : '';

  // 4.2 Users List (Verify no password hash leakage)
  const usersRes = await request('/api/admin/users', {
    headers: { Cookie: adminCookie }
  });
  console.log(`  4.2 GET /api/admin/users -> ${usersRes.status} (Users count: ${usersRes.data?.users?.length})`);
  assert.strictEqual(usersRes.status, 200);
  assert.ok(usersRes.data.users.length >= 3);
  usersRes.data.users.forEach(u => {
    assert.strictEqual(u.passwordHash, undefined, `User ${u.email} must not expose passwordHash!`);
  });
  console.log('      Verified: Zero password hash leakage across all returned user objects.');

  // 4.3 Class Management
  const adminClassesRes = await request('/api/admin/classes', {
    headers: { Cookie: adminCookie }
  });
  console.log(`  4.3 GET /api/admin/classes -> ${adminClassesRes.status} (Classes count: ${adminClassesRes.data?.classes?.length})`);
  assert.strictEqual(adminClassesRes.status, 200);
  assert.ok(adminClassesRes.data.classes.length >= 2);

  // 4.4 Audit Logs
  const auditLogsRes = await request('/api/admin/audit-logs', {
    headers: { Cookie: adminCookie }
  });
  console.log(`  4.4 GET /api/admin/audit-logs -> ${auditLogsRes.status} (Logs retrieved: ${auditLogsRes.data?.logs?.length})`);
  assert.strictEqual(auditLogsRes.status, 200);
  assert.ok(auditLogsRes.data.logs.length > 0);

  // 4.5 Security: Student Attempting Admin Endpoint
  const studentAttemptAdminRes = await request('/api/admin/audit-logs', {
    headers: { Cookie: studentCookie }
  });
  console.log(`  4.5 Security Check: Student calling /api/admin/audit-logs -> ${studentAttemptAdminRes.status} (Expected: 401/403)`);
  assert.ok(studentAttemptAdminRes.status === 401 || studentAttemptAdminRes.status === 403);

  console.log('✓ PHASE 4 COMPLETED: Admin governance, zero hash leakage, audit logs, and student restriction verified.\n');

  // ----------------------------------------------------
  // PHASE 5: AI Functionality Verification
  // ----------------------------------------------------
  console.log('[PHASE 5] AI Integration & Question Generation:');

  // Re-login student to test AI question generation
  const studentLoginRes2 = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@student.medha.edu', password: 'Medha@2026!' })
  });
  const activeStudentCookie = studentLoginRes2.setCookie.split(';')[0];

  const genQuestionRes = await request('/api/generate-question', {
    method: 'POST',
    headers: { Cookie: activeStudentCookie },
    body: JSON.stringify({ conceptId: 'C04', requestedDifficulty: 2, currentMastery: 50 })
  });
  console.log(`  5.1 POST /api/generate-question (C04, diff 2) -> ${genQuestionRes.status}`);
  assert.strictEqual(genQuestionRes.status, 200);
  assert.strictEqual(genQuestionRes.data.success, true);
  const q = genQuestionRes.data.question;
  assert.ok(q.question && q.question.length > 10);
  assert.ok(Array.isArray(q.options) && q.options.length >= 2);
  assert.ok(q.options.includes(q.correct_answer) || ['A', 'B', 'C', 'D'].includes(q.correct_answer));
  console.log(`      Question generated: "${q.question.substring(0, 50)}..."`);
  console.log(`      Correct answer: "${q.correct_answer}"`);
  console.log(`      Mode indicator is_offline_fallback: ${q.is_offline_fallback === true ? 'true (offline heuristic)' : 'false (Live Gemini AI)'}`);

  // Empty reasoning diagnostic fallback
  const emptyReasoningRes = await request('/api/diagnose-reasoning', {
    method: 'POST',
    headers: { Cookie: activeStudentCookie },
    body: JSON.stringify({
      questionPrompt: 'A current of 5 A flows through a conductor for 2 seconds. What is the amount of charge that passes through the cross-section?',
      expectedAnswer: 'B',
      studentAnswer: 'B',
      studentReasoning: 'idk',
      targetConceptIds: ['C01']
    })
  });
  console.log(`  5.2 POST /api/diagnose-reasoning (Short reasoning: 'idk') -> ${emptyReasoningRes.status} (Quality: ${emptyReasoningRes.data?.analysis?.reasoning_quality})`);
  assert.strictEqual(emptyReasoningRes.status, 200);
  assert.strictEqual(emptyReasoningRes.data.analysis.reasoning_quality, 'insufficient_evidence');

  console.log('✓ PHASE 5 COMPLETED: AI question generation schema and reasoning analysis verified.\n');

  console.log('====================================================');
  console.log('ALL API & E2E PROTOCOL AUDIT TESTS PASSED (100%)');
  console.log('====================================================');
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
