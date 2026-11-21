import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const CDP_PORT = 9226;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.networkRequests = [];

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        this.consoleLogs.push({
          type: msg.params.type,
          args: msg.params.args.map(a => a.value || a.description)
        });
      }
      if (msg.method === 'Network.requestWillBeSent') {
        this.networkRequests.push({
          requestId: msg.params.requestId,
          url: msg.params.request.url,
          method: msg.params.request.method
        });
      }
      if (msg.method === 'Network.responseReceived') {
        const req = this.networkRequests.find(r => r.requestId === msg.params.requestId);
        if (req) req.status = msg.params.response.status;
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

async function testBrowserAssessment() {
  console.log('=== REAL BROWSER ASSESSMENT DEBUGGING ===');
  
  // 1. Authenticate as Priya via API to get session cookie
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@student.medha.edu', password: 'Medha@2026!' })
  });
  const cookie = loginRes.headers.get('set-cookie').match(/medha_session=([^;]+)/)[1];
  console.log('1. Obtained session cookie for Priya.');

  // 2. Launch Chrome
  const tempDir = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'cdp-assess-' + Date.now());
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tempDir}`,
    'about:blank'
  ]);

  for (let i = 0; i < 20; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (r.ok) break;
    } catch {
      await sleep(300);
    }
  }

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await listRes.json();
  const target = targets.find(t => t.type === 'page') || targets[0];
  const client = new CDPClient(target.webSocketDebuggerUrl);
  await client.ready();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');

  // Set auth cookie
  await client.send('Network.setCookie', {
    name: 'medha_session',
    value: cookie,
    url: 'http://localhost:3000',
    path: '/'
  });

  // Navigate to /student
  console.log('2. Navigating to /student...');
  await client.send('Page.navigate', { url: `${BASE_URL}/student` });
  
  // Wait for loading spinner to disappear
  for (let i = 0; i < 30; i++) {
    const isLoaded = await client.send('Runtime.evaluate', {
      expression: `!document.body.innerText.includes('Authenticating') && document.querySelectorAll('aside nav button').length > 0`
    });
    if (isLoaded.result.value) {
      console.log('   Student portal loaded successfully.');
      break;
    }
    await sleep(300);
  }

  // Navigate to Adaptive Practice tab
  console.log('3. Clicking Adaptive Practice tab in sidebar...');
  await client.send('Runtime.evaluate', {
    expression: `
      const btn = Array.from(document.querySelectorAll('aside nav button')).find(b => b.innerText.includes('Adaptive Practice'));
      if (btn) {
        btn.click();
        'clicked_adaptive_practice';
      } else {
        'adaptive_practice_btn_not_found';
      }
    `
  });
  await sleep(1500);

  // Check if a question is displayed or if "Generate Adaptive Challenge" is needed
  console.log('4. Checking if question is loaded or clicking generate...');
  const checkQuestion = await client.send('Runtime.evaluate', {
    expression: `
      const genBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Generate Adaptive Challenge'));
      if (genBtn) {
        genBtn.click();
        'clicked_generate';
      } else {
        'question_already_visible';
      }
    `
  });
  console.log('   Generate button state:', checkQuestion.result.value);
  
  // Wait up to 10s for question to generate via API
  for (let i = 0; i < 20; i++) {
    const hasQ = await client.send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('textarea') && document.querySelectorAll('.border.cursor-pointer').length > 0)`
    });
    if (hasQ.result.value) {
      console.log('   Question rendered in workspace.');
      break;
    }
    await sleep(500);
  }

  // Check rendered question
  const questionDetails = await client.send('Runtime.evaluate', {
    expression: `
      (() => {
        const questionH3 = document.querySelector('h3.font-heading');
        const options = Array.from(document.querySelectorAll('.border.cursor-pointer')).map(el => el.innerText);
        const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Submit & Diagnose'));
        return {
          questionText: questionH3 ? questionH3.innerText : null,
          optionsCount: options.length,
          optionsText: options,
          submitBtnExists: Boolean(submitBtn)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('5. Question rendered in UI:', questionDetails.result.value);

  // Select Option 0
  console.log('6. Selecting first option...');
  await client.send('Runtime.evaluate', {
    expression: `
      const opts = document.querySelectorAll('.border.cursor-pointer');
      if (opts.length > 0) opts[0].click();
    `
  });
  await sleep(500);

  // Type reasoning in textarea
  console.log('7. Entering written reasoning in textarea...');
  await client.send('Runtime.evaluate', {
    expression: `
      const textarea = document.querySelector('textarea');
      if (textarea) {
        // React 19 synthetic event setter
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        nativeSetter.call(textarea, 'According to Ohm law, V = I * R, so current is directly proportional to voltage.');
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    `
  });
  await sleep(500);

  // Click Submit & Diagnose
  console.log('8. Clicking "Submit & Diagnose" button...');
  const submitResult = await client.send('Runtime.evaluate', {
    expression: `
      (() => {
        const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Submit & Diagnose'));
        if (submitBtn) {
          submitBtn.click();
          return 'submit_clicked';
        }
        return 'submit_btn_not_found';
      })()
    `
  });
  console.log('   Submit click result:', submitResult.result.value);

  // Wait 4 seconds for diagnosis & attempt API calls to execute
  await sleep(4000);

  // Inspect UI after submission
  console.log('9. Inspecting UI state after submission...');
  const postSubmitState = await client.send('Runtime.evaluate', {
    expression: `
      (() => {
        const feedbackCard = document.querySelector('.rounded-3xl.bg-surface');
        const text = document.body.innerText;
        const hasDiagnosis = text.includes('Reasoning Diagnosis') || text.includes('Diagnostic Heuristic Engine') || text.includes('Next Adaptive Challenge');
        const errorBanners = Array.from(document.querySelectorAll('.bg-mastery-atRiskLight')).map(e => e.innerText);
        return {
          hasDiagnosis,
          errorBanners,
          snippet: text.substring(0, 500)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Post-submit state:', postSubmitState.result.value);

  console.log('\n10. Network requests captured during interaction:');
  client.networkRequests.filter(r => r.url.includes('/api/')).forEach(r => {
    console.log(`   ${r.method} ${r.url} -> ${r.status || 'pending/failed'}`);
  });

  console.log('\n11. Console logs during interaction:');
  client.consoleLogs.forEach(l => {
    console.log(`   [${l.type}]`, ...l.args);
  });

  // 12. Verify attempt and profile persistence in database
  console.log('\n12. Verifying database persistence via GET /api/student/profile...');
  const verifyRes = await fetch(`${BASE_URL}/api/student/profile`, {
    headers: { 'Cookie': `medha_session=${cookie}` }
  });
  const verifyData = await verifyRes.json();
  const latestAttempt = verifyData.profile?.attempts?.slice(-1)[0];
  console.log('   Total recorded attempts in DB:', verifyData.profile?.attempts?.length);
  console.log('   Latest persisted attempt in DB:', {
    id: latestAttempt?.id,
    questionId: latestAttempt?.questionId,
    selectedAnswer: latestAttempt?.selectedAnswer,
    isCorrect: latestAttempt?.isCorrect,
    misconceptionDetected: latestAttempt?.misconceptionDetected,
    reasoningQuality: latestAttempt?.reasoningQuality
  });

  client.close();
  chromeProc.kill();
  console.log('\n=== BROWSER DEBUGGING RUN COMPLETED ===');
}

testBrowserAssessment().catch(console.error);
