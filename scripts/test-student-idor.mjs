async function testStudentIdor() {
  // 1. Log in as Priya
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@student.medha.edu', password: 'Medha@2026!' })
  });
  const cookie = loginRes.headers.get('set-cookie');

  // 2. Call GET /api/student/profile?studentId=usr_student_aarav
  console.log('--- TEST 5A: GET /api/student/profile?studentId=usr_student_aarav ---');
  const getProfileRes = await fetch('http://localhost:3000/api/student/profile?studentId=usr_student_aarav', {
    headers: { 'Cookie': cookie }
  });
  console.log('Status Code:', getProfileRes.status);
  const getProfileData = await getProfileRes.json();
  console.log('Returned Profile ID:', getProfileData?.profile?.id);
  console.log('Returned Profile Name:', getProfileData?.profile?.name);
  console.log('Response JSON Summary:', JSON.stringify({
    success: getProfileData.success,
    profileId: getProfileData?.profile?.id,
    profileName: getProfileData?.profile?.name,
    classId: getProfileData?.profile?.classId
  }, null, 2));

  // 3. Call POST /api/student/attempts with Aarav\'s ID in body (attempt to submit attempt on behalf of Aarav)
  console.log('\n--- TEST 5B: POST /api/student/attempts with learnerId=usr_student_aarav in body ---');
  const postAttemptRes = await fetch('http://localhost:3000/api/student/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({
      learnerId: 'usr_student_aarav',
      questionId: 'IDOR_TEST_Q1',
      selectedAnswer: 'A',
      writtenReasoning: 'IDOR probe test',
      isCorrect: true,
      targetConceptIds: ['C01'],
      difficulty: 2
    })
  });
  console.log('Status Code:', postAttemptRes.status);
  const postAttemptData = await postAttemptRes.json();
  console.log('Attempt Record Created For Learner ID:', postAttemptData?.attempt?.learnerId);
  console.log('Target Profile Mutated ID:', postAttemptData?.profile?.id);
  console.log('Response JSON Summary:', JSON.stringify({
    success: postAttemptData.success,
    attemptLearnerId: postAttemptData?.attempt?.learnerId,
    profileMutatedId: postAttemptData?.profile?.id,
    profileMutatedName: postAttemptData?.profile?.name
  }, null, 2));
}

testStudentIdor().catch(console.error);
