async function testPriyaDiagnose() {
  // 1. Login as Priya
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@student.medha.edu', password: 'Medha@2026!' })
  });
  console.log('Login Status:', loginRes.status);
  const cookie = loginRes.headers.get('set-cookie');

  // 2. Call /api/diagnose-reasoning WITHOUT x-medha-demo, using Cookie only
  const diagRes = await fetch('http://localhost:3000/api/diagnose-reasoning', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({
      questionPrompt: 'Two bulbs are connected in series. Compare the brightness of the two bulbs.',
      expectedAnswer: 'Both bulbs will glow with equal brightness',
      studentAnswer: 'Bulb 1 is brighter',
      studentReasoning: 'the first bulb uses up the current',
      targetConceptIds: ['C03']
    })
  });

  console.log('Diagnose Status:', diagRes.status);
  const data = await diagRes.json();
  console.log('Full JSON Response:\n' + JSON.stringify(data, null, 2));
}

testPriyaDiagnose().catch(console.error);
