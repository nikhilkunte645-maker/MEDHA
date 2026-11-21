import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9229;
const HTML = 'file:///C:/Users/lucifer/OneDrive/Documents/MEDHA/brand-assets/presentation/medha-brand-board.html';
const OUT  = 'C:/Users/lucifer/OneDrive/Documents/MEDHA/brand-assets/presentation/medha-brand-board.png';
const TMP  = `C:\\Windows\\Temp\\cdp-bb-${Date.now()}`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0; this.cbs = new Map();
    this.ws.onmessage = ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.cbs.has(m.id)) {
        const { resolve, reject } = this.cbs.get(m.id);
        this.cbs.delete(m.id);
        m.error ? reject(m.error) : resolve(m.result);
      }
    };
  }
  ready() { return new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; }); }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.cbs.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.ws.close(); }
}

(async () => {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${TMP}`,
    '--window-size=1600,1000',
    'about:blank',
  ]);

  for (let i = 0; i < 25; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) break; } catch {}
    await sleep(300);
  }

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const targets = await listRes.json();
  const target  = targets.find(t => t.type === 'page') || targets[0];
  const client  = new CDP(target.webSocketDebuggerUrl);
  await client.ready();

  await client.send('Page.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false,
  });
  await client.send('Page.navigate', { url: HTML });
  await sleep(3500); // let the HTML fully render (fonts, SVGs, gradients)

  const result = await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    fromSurface: true,
  });
  fs.writeFileSync(OUT, Buffer.from(result.data, 'base64'));
  console.log(`✓ Brand board PNG saved → ${OUT}`);
  console.log(`  Size: ${Math.round(fs.statSync(OUT).size / 1024)} KB`);

  client.close();
  chrome.kill();
})().catch(e => { console.error(e); process.exit(1); });
