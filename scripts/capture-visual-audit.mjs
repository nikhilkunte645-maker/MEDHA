import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\lucifer\\.gemini\\antigravity\\brain\\5981f300-51ef-4be9-8ee5-28e489abc682\\screenshots';
const BASE_URL = 'http://localhost:3000';
const CDP_PORT = 9222;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  const setCookie = res.headers.get('set-cookie');
  let token = null;
  if (setCookie) {
    const match = setCookie.match(/medha_session=([^;]+)/);
    if (match) token = match[1];
  }
  return { data, token };
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.callbacks = new Map();
    this.consoleLogs = [];

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        this.consoleLogs.push({
          type: msg.params.type,
          args: msg.params.args.map(a => a.value || a.description)
        });
      }
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('[VISUAL AUDIT] Starting Headless Chrome for visual regression and responsive inspection...');
  const tempProfileDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'medha-cdp-profile-' + Date.now());

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tempProfileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ], { stdio: 'ignore' });

  // Wait for CDP port to open
  let version = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      version = await res.json();
      if (version?.webSocketDebuggerUrl) break;
    } catch {
      await sleep(300);
    }
  }

  if (!version?.webSocketDebuggerUrl) {
    throw new Error('Failed to connect to headless Chrome CDP');
  }

  console.log('[VISUAL AUDIT] Connected to Chrome DevTools Protocol via WebSocket.');

  // Get existing page target from /json/list
  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('No page target available in Chrome');
  }
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.ready();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');

  // Authenticate personas
  console.log('[VISUAL AUDIT] Authenticating Student Priya, Teacher Sharma, and Admin...');
  const student = await loginUser('priya@student.medha.edu', 'Medha@2026!');
  const teacher = await loginUser('sharma@teacher.medha.edu', 'Medha@2026!');
  const admin = await loginUser('admin@medha.edu', 'Medha@2026!');

  const viewports = [
    { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
    { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 1 },
    { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2 }
  ];

  async function capturePage(pageName, urlPath, sessionToken) {
    console.log(`\n--- Capturing ${pageName} (${urlPath}) ---`);

    // Set cookie
    if (sessionToken) {
      await client.send('Network.setCookie', {
        name: 'medha_session',
        value: sessionToken,
        domain: 'localhost',
        path: '/'
      });
    } else {
      await client.send('Network.clearBrowserCookies');
    }

    for (const vp of viewports) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.deviceScaleFactor,
        mobile: vp.name === 'mobile'
      });

      await client.send('Page.navigate', { url: `${BASE_URL}${urlPath}` });
      await sleep(1500); // Allow React hydration and Studio UI animations to complete

      const screenshotResult = await client.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false
      });

      const fileName = `${pageName}-${vp.name}.png`;
      const filePath = path.join(SCREENSHOT_DIR, fileName);
      fs.writeFileSync(filePath, Buffer.from(screenshotResult.data, 'base64'));
      console.log(`  ✓ Saved ${fileName} (${fs.statSync(filePath).size} bytes)`);
    }
  }

  // 1. Landing Page
  await capturePage('landing', '/', null);

  // 2. Login Page
  await capturePage('login', '/login', null);

  // 3. Student Portal (Cognitive Overview & Studio Navigation)
  await capturePage('student-portal', '/student', student.token);

  // 4. Teacher Portal (Analytics & Scoped Class)
  await capturePage('teacher-portal', '/teacher', teacher.token);

  // 5. Admin Portal (Governance & Audit Logs)
  await capturePage('admin-portal', '/admin', admin.token);

  console.log('\n[VISUAL AUDIT] Console Logs from Browser during rendering:');
  const errorLogs = client.consoleLogs.filter(l => l.type === 'error');
  if (errorLogs.length === 0) {
    console.log('  ✓ ZERO console errors recorded across all captured routes and viewports.');
  } else {
    console.warn(`  ⚠️ Recorded ${errorLogs.length} console error(s):`, errorLogs);
  }

  client.close();
  chromeProc.kill('SIGKILL');

  console.log('\n====================================================');
  console.log('ALL VIEWPORT SCREENSHOTS CAPTURED SUCCESSFULLY (15 TOTAL)');
  console.log('Location:', SCREENSHOT_DIR);
  console.log('====================================================');
}

main().catch(err => {
  console.error('Visual audit failed:', err);
  process.exit(1);
});
