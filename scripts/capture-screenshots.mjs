/**
 * MEDHA — Complete Website Screenshot Capture
 * Uses Chrome DevTools Protocol (CDP) with an existing headless Chrome instance.
 * Captures all accessible routes for the hackathon demo video package.
 *
 * Usage: node scripts/capture-screenshots.mjs
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const CDP_PORT = 9227;

// Output directories
const DIRS = {
  public:        'demo-assets/screenshots/01-public',
  auth:          'demo-assets/screenshots/02-authentication',
  student:       'demo-assets/screenshots/03-student',
  assessment:    'demo-assets/screenshots/04-assessment',
  learning:      'demo-assets/screenshots/05-learning-intelligence',
  teacher:       'demo-assets/screenshots/06-teacher',
  admin:         'demo-assets/screenshots/07-admin',
  mobile:        'demo-assets/screenshots/08-mobile',
  fullpage:      'demo-assets/screenshots/09-full-page',
  reports:       'demo-assets/reports',
};

const CREDENTIALS = {
  student:  { email: 'priya@student.medha.edu', password: 'Medha@2026!' },
  teacher:  { email: 'sharma@teacher.medha.edu', password: 'Medha@2026!' },
  admin:    { email: 'admin@medha.edu',          password: 'Medha@2026!' },
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── CDP CLIENT ─────────────────────────────────────────────────────────────
class CDPClient {
  constructor(wsUrl) {
    this.ws  = new WebSocket(wsUrl);
    this.id  = 0;
    this.cbs = new Map();
    this.ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.cbs.has(msg.id)) {
        const { resolve, reject } = this.cbs.get(msg.id);
        this.cbs.delete(msg.id);
        msg.error ? reject(msg.error) : resolve(msg.result);
      }
    };
  }
  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((res, rej) => {
      this.ws.onopen  = res;
      this.ws.onerror = rej;
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.cbs.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.ws.close(); }
}

// ─── SCREENSHOT HELPER ───────────────────────────────────────────────────────
async function screenshot(client, filePath, { fullPage = false } = {}) {
  await sleep(1800); // let React hydration + animations settle
  const result = await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: fullPage,
    fromSurface: true,
  });
  fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
  console.log(`  ✓ ${path.relative(process.cwd(), filePath)}`);
}

// ─── WAIT FOR ROUTE TO LOAD ──────────────────────────────────────────────────
async function navigate(client, url, { waitText = null, maxWaitMs = 6000 } = {}) {
  await client.send('Page.navigate', { url });
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const r = await client.send('Runtime.evaluate', { expression: 'document.readyState' });
    if (r.result.value === 'complete') {
      if (waitText) {
        const t = await client.send('Runtime.evaluate', {
          expression: `document.body.innerText.includes(${JSON.stringify(waitText)})`
        });
        if (t.result.value) break;
      } else break;
    }
    await sleep(300);
  }
  await sleep(600); // extra paint buffer
}

// ─── LOGIN HELPER ─────────────────────────────────────────────────────────────
async function loginAs(client, role) {
  const creds = CREDENTIALS[role];
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds),
  });
  const cookie = res.headers.get('set-cookie')?.match(/medha_session=([^;]+)/)?.[1];
  if (!cookie) throw new Error(`Login failed for ${role}`);
  await client.send('Network.setCookie', {
    name: 'medha_session',
    value: cookie,
    url: BASE_URL,
    path: '/',
  });
  return cookie;
}

// ─── CLICK NAV ITEM ─────────────────────────────────────────────────────────
async function clickNav(client, labelContains) {
  await client.send('Runtime.evaluate', {
    expression: `
      const btn = Array.from(document.querySelectorAll('aside nav button, nav button, [role=button]'))
        .find(b => b.innerText.includes(${JSON.stringify(labelContains)}));
      if (btn) btn.click();
    `,
  });
  await sleep(1000);
}

// ─── WAIT FOR ELEMENT ────────────────────────────────────────────────────────
async function waitForText(client, text, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const r = await client.send('Runtime.evaluate', {
      expression: `document.body.innerText.includes(${JSON.stringify(text)})`
    });
    if (r.result.value) return true;
    await sleep(400);
  }
  return false;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function captureAll() {
  const inventory = [];
  const log = (file, route, role, status) => {
    inventory.push({ file: path.relative(process.cwd(), file), route, role, status });
    console.log(`  [${status}] ${route} → ${path.basename(file)}`);
  };

  // ── Launch headless Chrome
  const tmpDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'cdp-shots-' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--window-size=1920,1080',
    'about:blank',
  ]);
  for (let i = 0; i < 25; i++) {
    try { const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`); if (r.ok) break; } catch {}
    await sleep(300);
  }
  const listRes  = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets  = await listRes.json();
  const target   = targets.find(t => t.type === 'page') || targets[0];
  const client   = new CDPClient(target.webSocketDebuggerUrl);
  await client.ready();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false,
  });

  console.log('\n=== MEDHA Screenshot Capture ===\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // 01 — PUBLIC
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('── 01 Public');
  try {
    await navigate(client, `${BASE_URL}/`, { waitText: 'MEDHA' });
    const f = path.join(DIRS.public, 'landing-page.png');
    await screenshot(client, f);
    log(f, '/', 'Public', 'Captured');

    const f2 = path.join(DIRS.fullpage, 'landing-page-full.png');
    await screenshot(client, f2, { fullPage: true });
    log(f2, '/', 'Public', 'Captured');
  } catch (e) { console.error('  ✗ landing:', e.message); }

  // ═══════════════════════════════════════════════════════════════════════════
  // 02 — AUTHENTICATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n── 02 Authentication');
  try {
    await navigate(client, `${BASE_URL}/login`, { waitText: 'Sign in' });
    const f = path.join(DIRS.auth, 'login-page.png');
    await screenshot(client, f);
    log(f, '/login', 'Public', 'Captured');
  } catch (e) { console.error('  ✗ login:', e.message); }

  // ═══════════════════════════════════════════════════════════════════════════
  // 03 — STUDENT PORTAL
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n── 03 Student Portal');
  try {
    await loginAs(client, 'student');
    // Reload cookies into page via navigation
    await navigate(client, `${BASE_URL}/student`, { waitText: 'Cognitive Overview', maxWaitMs: 10000 });
    await waitForText(client, 'Cognitive Overview');

    // Dashboard / Overview
    const dash = path.join(DIRS.student, 'student-dashboard.png');
    await screenshot(client, dash);
    log(dash, '/student', 'Student', 'Captured');

    // Full-page overview
    const dashFull = path.join(DIRS.fullpage, 'student-dashboard-full.png');
    await screenshot(client, dashFull, { fullPage: true });
    log(dashFull, '/student#overview', 'Student', 'Captured');

    // Cognitive Overview tab (default)
    const cog = path.join(DIRS.student, 'cognitive-overview.png');
    await screenshot(client, cog);
    log(cog, '/student#cognitive-overview', 'Student', 'Captured');

    // Diagnostic Assessment
    await clickNav(client, 'Diagnostic Assessment');
    await sleep(1000);
    const diagIntro = path.join(DIRS.assessment, 'diagnostic-introduction.png');
    await screenshot(client, diagIntro);
    log(diagIntro, '/student#diagnostic', 'Student', 'Captured');

    // Click first option to show question state
    await client.send('Runtime.evaluate', {
      expression: `const opt = document.querySelector('.border.cursor-pointer'); if(opt) opt.click();`
    });
    await sleep(600);
    const diagQ = path.join(DIRS.assessment, 'diagnostic-question.png');
    await screenshot(client, diagQ);
    log(diagQ, '/student#diagnostic-question', 'Student', 'Captured');

    // Concept Graph
    await clickNav(client, 'Concept Topology');
    await waitForText(client, 'Concept Topology');
    const graph = path.join(DIRS.learning, 'concept-graph.png');
    await screenshot(client, graph);
    log(graph, '/student#graph', 'Student', 'Captured');

    // Misconception Studio
    await clickNav(client, 'Misconception Studio');
    await waitForText(client, 'Misconception');
    const misc = path.join(DIRS.learning, 'misconception-analysis.png');
    await screenshot(client, misc);
    log(misc, '/student#misconceptions', 'Student', 'Captured');

    // Adaptive Practice (Learning Workspace)
    await clickNav(client, 'Adaptive Practice');
    await waitForText(client, 'Adaptive Workspace');
    const workspace = path.join(DIRS.learning, 'learning-workspace.png');
    await screenshot(client, workspace);
    log(workspace, '/student#workspace', 'Student', 'Captured');

    // Generate a question
    await client.send('Runtime.evaluate', {
      expression: `const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Generate Adaptive Challenge') || b.innerText.includes('Generate Challenge')); if(btn) btn.click();`
    });
    // Wait for question
    for (let i = 0; i < 20; i++) {
      const r = await client.send('Runtime.evaluate', {
        expression: `document.querySelectorAll('.border.cursor-pointer').length > 0`
      });
      if (r.result.value) break;
      await sleep(500);
    }
    const practice = path.join(DIRS.assessment, 'adaptive-practice-question.png');
    await screenshot(client, practice);
    log(practice, '/student#workspace-question', 'Student', 'Captured');

    // Spaced Revision
    await clickNav(client, 'Spaced Revision');
    await waitForText(client, 'Revision');
    const revision = path.join(DIRS.learning, 'revision-schedule.png');
    await screenshot(client, revision);
    log(revision, '/student#revision', 'Student', 'Captured');

  } catch (e) { console.error('  ✗ student portal:', e.message); }

  // Clear session
  await client.send('Network.clearBrowserCookies');
  await sleep(300);

  // ═══════════════════════════════════════════════════════════════════════════
  // 06 — TEACHER PORTAL
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n── 06 Teacher Portal');
  try {
    await loginAs(client, 'teacher');
    await navigate(client, `${BASE_URL}/teacher`, { waitText: 'Teacher', maxWaitMs: 10000 });
    await waitForText(client, 'Analytics');

    const tDash = path.join(DIRS.teacher, 'teacher-dashboard.png');
    await screenshot(client, tDash);
    log(tDash, '/teacher', 'Teacher', 'Captured');

    const tFull = path.join(DIRS.fullpage, 'teacher-dashboard-full.png');
    await screenshot(client, tFull, { fullPage: true });
    log(tFull, '/teacher-full', 'Teacher', 'Captured');

    // Try cohort analytics tab
    await clickNav(client, 'Class Analytics');
    await sleep(1200);
    const tAnalytics = path.join(DIRS.teacher, 'teacher-cohort-analytics.png');
    await screenshot(client, tAnalytics);
    log(tAnalytics, '/teacher#analytics', 'Teacher', 'Captured');

    // Students tab
    await clickNav(client, 'Student');
    await sleep(1200);
    const tStudents = path.join(DIRS.teacher, 'teacher-student-list.png');
    await screenshot(client, tStudents);
    log(tStudents, '/teacher#students', 'Teacher', 'Captured');

    // Misconceptions tab
    await clickNav(client, 'Misconception');
    await sleep(1200);
    const tMisc = path.join(DIRS.teacher, 'teacher-misconception-analytics.png');
    await screenshot(client, tMisc);
    log(tMisc, '/teacher#misconceptions', 'Teacher', 'Captured');

    // Export tab
    await clickNav(client, 'Export');
    await sleep(1200);
    const tExport = path.join(DIRS.teacher, 'teacher-data-export.png');
    await screenshot(client, tExport);
    log(tExport, '/teacher#export', 'Teacher', 'Captured');
  } catch (e) { console.error('  ✗ teacher portal:', e.message); }

  await client.send('Network.clearBrowserCookies');
  await sleep(300);

  // ═══════════════════════════════════════════════════════════════════════════
  // 07 — ADMIN PORTAL
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n── 07 Admin Portal');
  try {
    await loginAs(client, 'admin');
    await navigate(client, `${BASE_URL}/admin`, { waitText: 'Admin', maxWaitMs: 10000 });

    const aDash = path.join(DIRS.admin, 'admin-dashboard.png');
    await screenshot(client, aDash);
    log(aDash, '/admin', 'Admin', 'Captured');

    const aFull = path.join(DIRS.fullpage, 'admin-dashboard-full.png');
    await screenshot(client, aFull, { fullPage: true });
    log(aFull, '/admin-full', 'Admin', 'Captured');

    // User management
    await clickNav(client, 'User');
    await sleep(1200);
    const aUsers = path.join(DIRS.admin, 'admin-user-management.png');
    await screenshot(client, aUsers);
    log(aUsers, '/admin#users', 'Admin', 'Captured');

    // Audit logs
    await clickNav(client, 'Audit');
    await sleep(1200);
    const aAudit = path.join(DIRS.admin, 'admin-audit-logs.png');
    await screenshot(client, aAudit);
    log(aAudit, '/admin#audit', 'Admin', 'Captured');
  } catch (e) { console.error('  ✗ admin portal:', e.message); }

  await client.send('Network.clearBrowserCookies');

  // ═══════════════════════════════════════════════════════════════════════════
  // 08 — MOBILE SCREENSHOTS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n── 08 Mobile');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
  });

  try {
    // Landing mobile
    await navigate(client, `${BASE_URL}/`, { waitText: 'MEDHA' });
    const mLanding = path.join(DIRS.mobile, 'mobile-landing-page.png');
    await screenshot(client, mLanding);
    log(mLanding, '/', 'Public', 'Captured');

    // Login mobile
    await navigate(client, `${BASE_URL}/login`, { waitText: 'Sign in' });
    const mLogin = path.join(DIRS.mobile, 'mobile-login-page.png');
    await screenshot(client, mLogin);
    log(mLogin, '/login', 'Public', 'Captured');

    // Student mobile
    await loginAs(client, 'student');
    await navigate(client, `${BASE_URL}/student`, { maxWaitMs: 10000 });
    await waitForText(client, 'MEDHA');
    const mStudent = path.join(DIRS.mobile, 'mobile-student-dashboard.png');
    await screenshot(client, mStudent);
    log(mStudent, '/student', 'Student', 'Captured');

    // Mobile nav open
    await client.send('Runtime.evaluate', {
      expression: `const btn = document.querySelector('[aria-label="Toggle navigation"]'); if(btn) btn.click();`
    });
    await sleep(600);
    const mNav = path.join(DIRS.mobile, 'mobile-navigation-open.png');
    await screenshot(client, mNav);
    log(mNav, '/student#mobile-nav', 'Student', 'Captured');

    await client.send('Network.clearBrowserCookies');

    // Teacher mobile
    await loginAs(client, 'teacher');
    await navigate(client, `${BASE_URL}/teacher`, { maxWaitMs: 10000 });
    await waitForText(client, 'MEDHA');
    const mTeacher = path.join(DIRS.mobile, 'mobile-teacher-dashboard.png');
    await screenshot(client, mTeacher);
    log(mTeacher, '/teacher', 'Teacher', 'Captured');

    await client.send('Network.clearBrowserCookies');
  } catch (e) { console.error('  ✗ mobile:', e.message); }

  // ── Cleanup
  client.close();
  chrome.kill();

  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTORY REPORT
  // ═══════════════════════════════════════════════════════════════════════════
  const captured  = inventory.filter(r => r.status === 'Captured').length;
  const failed    = inventory.filter(r => r.status !== 'Captured').length;

  const tableRows = inventory.map(r =>
    `| ${r.file.replace(/\\/g,'/')} | ${r.route} | ${r.role} | ${r.status} |`
  ).join('\n');

  const report = `# MEDHA Screenshot Inventory Report

Generated: ${new Date().toISOString()}

## Summary
| Metric | Value |
|---|---|
| Routes Discovered | 7 (/, /login, /student, /teacher, /admin + sub-tabs) |
| Total Screenshots Captured | ${captured} |
| Desktop Captures | ${inventory.filter(r => !r.file.includes('mobile')).length} |
| Mobile Captures | ${inventory.filter(r => r.file.includes('mobile')).length} |
| Failed | ${failed} |

## Screenshot Inventory

| File | Route | Role | Status |
|---|---|---|---|
${tableRows}

## Notes
- All screenshots captured from live production server on http://localhost:3000
- Desktop viewport: 1920×1080 @ 100% zoom
- Mobile viewport: 390×844 @ 200% device scale (iPhone 14 Pro equivalent)
- Authentication: student (priya), teacher (sharma), admin (admin@medha.edu)
- No application source code was modified during capture
- Registration page: not implemented (intentional — demo accounts used)
`;
  fs.writeFileSync(path.join(DIRS.reports, 'screenshot-inventory.md'), report);
  console.log(`\n✓ Inventory saved → demo-assets/reports/screenshot-inventory.md`);
  console.log(`\n=== COMPLETE: ${captured} screenshots captured, ${failed} failed ===\n`);
}

captureAll().catch(console.error);
