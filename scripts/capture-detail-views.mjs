import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\lucifer\\.gemini\\antigravity\\brain\\5981f300-51ef-4be9-8ee5-28e489abc682\\screenshots';
const BASE_URL = 'http://localhost:3000';
const CDP_PORT = 9225;

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

  console.log('[SCREENSHOT CAPTURE] Spawning Chrome for detail view captures...');
  const tempProfileDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'medha-detail-cdp-' + Date.now());

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tempProfileDir}`,
    'about:blank'
  ], { stdio: 'ignore' });

  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await sleep(300);
    }
  }

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.ready();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');

  const student = await loginUser('priya@student.medha.edu', 'Medha@2026!');
  const teacher = await loginUser('sharma@teacher.medha.edu', 'Medha@2026!');
  const admin = await loginUser('admin@medha.edu', 'Medha@2026!');

  async function takeScreenshot(fileName) {
    const res = await client.send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(SCREENSHOT_DIR, fileName);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`  ✓ Saved ${fileName} (${fs.statSync(filePath).size} bytes)`);
  }

  async function setViewport(width, height, isMobile = false) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: isMobile ? 2 : 1,
      mobile: isMobile
    });
  }

  // 1. Landing
  console.log('\n--- Capturing Landing ---');
  await client.send('Network.clearBrowserCookies');
  await setViewport(1440, 900, false);
  await client.send('Page.navigate', { url: `${BASE_URL}/` });
  await sleep(1500);
  await takeScreenshot('landing-1440.png');
  await setViewport(390, 844, true);
  await sleep(1000);
  await takeScreenshot('landing-390.png');

  // 2. Student Portal Views
  console.log('\n--- Capturing Student Portal Detail Views ---');
  await client.send('Network.setCookie', { name: 'medha_session', value: student.token, domain: 'localhost', path: '/' });
  
  // 2A. Cognitive Overview
  await setViewport(1440, 900, false);
  await client.send('Page.navigate', { url: `${BASE_URL}/student` });
  await sleep(2000);
  await takeScreenshot('student-overview-1440.png');
  await setViewport(390, 844, true);
  await sleep(1000);
  await takeScreenshot('student-overview-390.png');

  // 2B. Concept Graph
  await setViewport(1440, 900, false);
  await client.send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('aside nav button, main button')).find(b => b.innerText.includes('Concept Topology'))?.click()
    `
  });
  await sleep(1500);
  await takeScreenshot('student-concept-graph-1440.png');
  await setViewport(390, 844, true);
  await sleep(1000);
  await takeScreenshot('student-concept-graph-390.png');

  // 2C. Misconception Studio
  await setViewport(1440, 900, false);
  await client.send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('aside nav button, main button')).find(b => b.innerText.includes('Misconception Studio'))?.click()
    `
  });
  await sleep(1500);
  await takeScreenshot('student-misconception-studio-1440.png');
  await setViewport(390, 844, true);
  await sleep(1000);
  await takeScreenshot('student-misconception-studio-390.png');

  // 2D. Adaptive Practice Workspace
  await setViewport(1440, 900, false);
  await client.send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('aside nav button, main button')).find(b => b.innerText.includes('Adaptive Practice'))?.click()
    `
  });
  await sleep(1500);
  await takeScreenshot('student-adaptive-workspace-1440.png');
  await setViewport(390, 844, true);
  await sleep(1000);
  await takeScreenshot('student-adaptive-workspace-390.png');

  // 3. Teacher Portal
  console.log('\n--- Capturing Teacher Portal ---');
  await client.send('Network.setCookie', { name: 'medha_session', value: teacher.token, domain: 'localhost', path: '/' });
  await setViewport(1440, 900, false);
  await client.send('Page.navigate', { url: `${BASE_URL}/teacher` });
  await sleep(2000);
  await takeScreenshot('teacher-portal-1440.png');
  await setViewport(390, 844, true);
  await sleep(1000);
  await takeScreenshot('teacher-portal-390.png');

  // 4. Admin Portal
  console.log('\n--- Capturing Admin Portal ---');
  await client.send('Network.setCookie', { name: 'medha_session', value: admin.token, domain: 'localhost', path: '/' });
  await setViewport(1440, 900, false);
  await client.send('Page.navigate', { url: `${BASE_URL}/admin` });
  await sleep(2000);
  await takeScreenshot('admin-portal-1440.png');
  await setViewport(390, 844, true);
  await sleep(1000);
  await takeScreenshot('admin-portal-390.png');

  client.close();
  chromeProc.kill('SIGKILL');
  console.log('\n[SCREENSHOT CAPTURE] All detail screenshots captured successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
