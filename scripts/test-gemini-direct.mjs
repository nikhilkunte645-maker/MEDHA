import fs from 'node:fs';

async function testGeminiDirect() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.+)/);
  if (!match) {
    console.log('No GEMINI_API_KEY found in .env.local');
    return;
  }
  const key = match[1].trim().replace(/^['"]|['"]$/g, '');

  console.log('Making direct API request to generativelanguage.googleapis.com...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with exactly: PONG' }] }]
      })
    });
    console.log('HTTP Status:', res.status);
    const body = await res.text();
    console.log('Response Body:\n' + body);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testGeminiDirect();
