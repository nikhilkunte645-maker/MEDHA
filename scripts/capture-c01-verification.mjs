import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const CDP_PORT = 9231;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
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

  waitOpen() {
    if (this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.cbs.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('--- STARTING C01 VISUAL BROWSER VERIFICATION ---');

  // Verify server is responding
  const statusRes = await fetch(`${BASE_URL}/api/status`).catch(() => null);
  if (!statusRes || !statusRes.ok) {
    console.error('Server not reachable at http://localhost:3000');
    process.exit(1);
  }
  console.log('✓ Server is active at http://localhost:3000');

  // Launch headless Chrome
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank'
  ]);

  let cdpClient = null;

  try {
    // Wait for CDP endpoint
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const res = await fetch(`http://localhost:${CDP_PORT}/json`);
        targets = await res.json();
        if (targets && targets.length > 0) break;
      } catch {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Failed to connect to Chrome CDP endpoint');
    }

    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    cdpClient = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdpClient.waitOpen();

    await cdpClient.send('Page.enable');
    await cdpClient.send('DOM.enable');
    await cdpClient.send('Runtime.enable');
    await cdpClient.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1.5,
      mobile: false
    });

    console.log('✓ Chrome connected via CDP. Performing authentication...');

    // Login via session or form
    await cdpClient.send('Page.navigate', { url: `${BASE_URL}/login` });
    await sleep(1500);

    // Auto-login via student credentials
    const loginEval = await cdpClient.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'priya@student.medha.edu', password: 'Medha@2026!' })
          });
          return res.status;
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('✓ Login API response:', loginEval.result?.value);

    // Navigate to student dashboard
    await cdpClient.send('Page.navigate', { url: `${BASE_URL}/student` });
    await sleep(2000);

    // Click Workspace tab to view C01 formulas
    const switchTabEval = await cdpClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const wsBtn = btns.find(b => b.textContent && b.textContent.includes('Adaptive Workspace'));
          if (wsBtn) {
            wsBtn.click();
            return 'CLICKED_WORKSPACE';
          }
          return 'NOT_FOUND';
        })()
      `,
      returnByValue: true
    });
    console.log('✓ Tab switch:', switchTabEval.result?.value);
    await sleep(1500);

    // Select C01 if not already selected
    const selectC01Eval = await cdpClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const pills = Array.from(document.querySelectorAll('button'));
          const c01Pill = pills.find(p => p.textContent && p.textContent.trim().startsWith('C01'));
          if (c01Pill) {
            c01Pill.click();
            return 'C01_SELECTED';
          }
          return 'C01_NOT_CLICKED';
        })()
      `,
      returnByValue: true
    });
    console.log('✓ C01 pill select:', selectC01Eval.result?.value);
    await sleep(1000);

    // Inspect the Formula DOM
    const inspectEval = await cdpClient.send('Runtime.evaluate', {
      expression: `
        (() => {
          const katexElements = document.querySelectorAll('.katex');
          const katexHtmls = Array.from(katexElements).map(el => el.innerText.trim());
          const hasRawLatex = document.body.innerText.includes('\\\\frac') || document.body.innerText.includes('**I =');
          const formulaTexts = Array.from(document.querySelectorAll('span, div'))
            .filter(el => el.textContent && el.textContent.includes('Formula:'))
            .map(el => el.innerText.trim());

          return {
            totalKatexElements: katexElements.length,
            katexSampleTexts: katexHtmls.slice(0, 5),
            hasRawLatexGlitch: hasRawLatex,
            formulaBannerTexts: formulaTexts.slice(0, 3)
          };
        })()
      `,
      returnByValue: true
    });

    console.log('=== DOM INSPECTION RESULTS ===');
    console.log('Total KaTeX glyph elements found:', inspectEval.result?.value?.totalKatexElements);
    console.log('KaTeX sample texts:', inspectEval.result?.value?.katexSampleTexts);
    console.log('Has raw LaTeX glitch:', inspectEval.result?.value?.hasRawLatexGlitch);
    console.log('Formula banner texts:', inspectEval.result?.value?.formulaBannerTexts);

    // Capture screenshot
    const screenshotData = await cdpClient.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(screenshotData.data, 'base64');

    const outDir = 'brand-assets';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'c01-formula-verification.png');
    fs.writeFileSync(outPath, buffer);
    console.log(`✓ Desktop screenshot saved: ${outPath} (${buffer.length} bytes)`);

    // Mobile verification (390 x 844)
    await cdpClient.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(800);
    const mobileScreenshotData = await cdpClient.send('Page.captureScreenshot', { format: 'png' });
    const mobileBuffer = Buffer.from(mobileScreenshotData.data, 'base64');
    const mobileOutPath = path.join(outDir, 'c01-mobile-formula-verification.png');
    fs.writeFileSync(mobileOutPath, mobileBuffer);
    console.log(`✓ Mobile screenshot saved: ${mobileOutPath} (${mobileBuffer.length} bytes)`);

  } finally {
    if (cdpClient) cdpClient.close();
    chromeProc.kill();
    console.log('✓ Headless Chrome shut down cleanly.');
  }
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
