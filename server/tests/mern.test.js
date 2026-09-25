/**
 * Focused MERN Integration Test Suite
 * Tests:
 * 1. User Registration, Login, Logout, Session Persistence
 * 2. Data Ownership Isolation (User B cannot access User A's data)
 * 3. Resume text parsing & skill detection
 * 4. Interview session creation & answer scoring
 * 5. Dashboard metrics accuracy
 */

const BASE_URL = 'http://127.0.0.1:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function runTests() {
  console.log('=====================================================================');
  console.log('       Running InterviewCoach AI - MERN Integration Tests');
  console.log('=====================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  // Ensure server is reachable; boot in-process if not already running
  try {
    const probe = await fetch('http://127.0.0.1:5000/api/health', { signal: AbortSignal.timeout(1000) });
    if (!probe.ok) throw new Error('Not ready');
  } catch (_) {
    console.log('[Test Setup] Booting local MERN server on port 5000 for integration test suite...');
    await import('../src/server.js');
    await new Promise(r => setTimeout(r, 1200));
  }

  // 1. Health check
  const health = await request('/health');
  assert(health.ok && health.data.status === 'healthy', 'Health Check Endpoint', JSON.stringify(health.data));

  // 2. Register User A
  const emailA = `candidate_${Date.now()}@example.com`;
  const regA = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Rahul Sharma',
      email: emailA,
      password: 'password123',
      target_role: 'MERN Stack Developer',
    }),
  });
  assert(regA.ok && regA.data.user && regA.data.user.name === 'Rahul Sharma', 'User A Registration', regA.data.message);
  const tokenA = regA.data.token;

  // 3. Login User A
  const loginA = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: emailA, password: 'password123' }),
  });
  assert(loginA.ok && loginA.data.token, 'User A Login', loginA.data.message);

  // 4. Session Persistence (Get Me)
  const meA = await request('/auth/me', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(meA.ok && meA.data.user.email === emailA, 'Session Persistence (Get Me)', meA.data.message);

  // 5. Resume Paste & Skill Extraction
  const sampleResume = `
    Experienced Full Stack Engineer with strong proficiency in React, Node.js, Express, MongoDB, TypeScript, and Docker.
    Developed scalable REST APIs, optimized Mongoose queries, and implemented Redis caching.
  `;
  const resumeA = await request('/resume/paste', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ text: sampleResume }),
  });
  assert(
    resumeA.ok && resumeA.data.resume.skills.includes('React') && resumeA.data.resume.skills.includes('MongoDB'),
    'Resume Text Processing & Skill Extraction',
    JSON.stringify(resumeA.data)
  );

  // 6. Start Interview Session (MERN Stack Developer)
  const sessionA = await request('/interview/start', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      target_role: 'MERN Stack Developer',
      interview_type: 'Technical',
      difficulty: 'Intermediate',
      question_count: 3,
      input_mode: 'text',
    }),
  });
  assert(
    sessionA.ok && sessionA.data.questions && sessionA.data.questions.length === 3,
    'Start Interview Session (MERN Stack, 3 Questions)',
    JSON.stringify(sessionA.data)
  );
  const sessionIdA = sessionA.data.id;
  const firstQuestionId = sessionA.data.questions[0].id;

  // 7. Submit Answer to Question 1
  const answerA = await request('/interview/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      question_id: firstQuestionId,
      user_answer: 'In a MERN stack application, React acts as the single-page application client. It communicates via HTTP fetch or axios with the Express backend on Node.js. Express handles the routes, parses JSON, and interacts with MongoDB using Mongoose schemas. Authentication uses JWT in HttpOnly cookies, and state updates dynamically in React upon receiving JSON responses.',
    }),
  });
  assert(
    answerA.ok && answerA.data.score > 0 && answerA.data.feedback,
    'Submit Answer & Compute Rubric Feedback',
    JSON.stringify(answerA.data)
  );

  // 8. Register User B
  const emailB = `candidate_b_${Date.now()}@example.com`;
  const regB = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Priya Patel',
      email: emailB,
      password: 'securepassword',
      target_role: 'Frontend Developer',
    }),
  });
  assert(regB.ok && regB.data.token, 'User B Registration', regB.data.message);
  const tokenB = regB.data.token;

  // 9. Data Ownership Isolation Test
  // User B tries to access User A's interview session
  const accessDeniedTest = await request(`/interview/${sessionIdA}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(
    accessDeniedTest.status === 403,
    'Data Ownership Isolation (User B cannot access User A session)',
    `Expected 403, got ${accessDeniedTest.status}`
  );

  // 10. Dashboard Accuracy for User A
  const dashA = await request('/dashboard/summary', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    dashA.ok && dashA.data.total_sessions >= 1 && dashA.data.total_questions_attempted >= 1,
    'Dashboard Metrics Accuracy (User A)',
    JSON.stringify(dashA.data)
  );

  // 11. Empty State for Brand New User B
  const dashB = await request('/dashboard/summary', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(
    dashB.ok && dashB.data.total_sessions === 0 && dashB.data.completed_sessions === 0,
    'Dashboard Empty State for New User B (Zero Fabricated Stats)',
    JSON.stringify(dashB.data)
  );

  // 12. Logout User A
  const logoutA = await request('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(logoutA.ok, 'User A Logout', logoutA.data.message);

  // 13. Update Resume (PUT /api/resume) with User B
  const resumeUpdateB = await request('/resume', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      edited_text: 'Rahul Kumar - MERN Developer with React, Node.js, Express, MongoDB experience.',
      extracted_skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'],
    }),
  });
  assert(
    resumeUpdateB.ok && resumeUpdateB.data.resume && resumeUpdateB.data.resume.skills.includes('Express'),
    'Update Resume via PUT /api/resume',
    resumeUpdateB.data?.message
  );

  // 14. Resume Suggestions Consent Check (POST /api/resume/suggestions without consent)
  const noConsentReq = await request('/resume/suggestions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ target_role: 'MERN Stack Developer', has_consent: false }),
  });
  assert(
    noConsentReq.status === 400 && noConsentReq.data.message?.includes('consent'),
    'Resume Suggestions Requires Explicit User Consent',
    noConsentReq.data?.message
  );

  // 15. Resume Suggestions with Consent (POST /api/resume/suggestions with consent=true)
  const consentReq = await request('/resume/suggestions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ target_role: 'MERN Stack Developer', has_consent: true }),
  });
  assert(
    consentReq.ok && consentReq.data.suggestions && Array.isArray(consentReq.data.suggestions.missing_information),
    'Resume Suggestions Generated with Consent (Demo Mode / Gemini)',
    JSON.stringify(consentReq.data?.suggestions)
  );

  // 16. Separate Question Evaluation Endpoint (POST /api/interview/question/:id/evaluate)
  const evalQuestion = await request(`/interview/question/${firstQuestionId}/evaluate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    evalQuestion.ok && evalQuestion.data.feedback && evalQuestion.data.score > 0,
    'Separate Question Evaluation Endpoint (/api/interview/question/:id/evaluate)',
    JSON.stringify(evalQuestion.data?.feedback?.feedback_mode)
  );

  // 17. Delete Resume (DELETE /api/resume)
  const deleteRes = await request('/resume', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const checkResumeAfterDelete = await request('/resume', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(
    deleteRes.ok && checkResumeAfterDelete.data.has_resume === false,
    'Delete Resume (DELETE /api/resume)',
    deleteRes.data?.message
  );

  // 18. System Settings Endpoint (GET /api/settings)
  const settingsCheck = await request('/settings', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(
    settingsCheck.ok && typeof settingsCheck.data.gemini_configured === 'boolean' && settingsCheck.data.mode,
    'Settings Endpoint with Gemini / Demo Mode Status',
    settingsCheck.data?.mode
  );

  // 19. Static Frontend Single-Page App Served at Root
  const rootHtml = await fetch('http://127.0.0.1:5000/');
  const rootText = await rootHtml.text();
  assert(
    rootHtml.status === 200 && rootText.includes('InterviewCoach AI'),
    'Static Production Frontend Served at http://127.0.0.1:5000/',
    `Status ${rootHtml.status}`
  );

  console.log('\n=====================================================================');
  console.log(`  Tests Completed: ${passed} Passed, ${failed} Failed`);
  console.log('=====================================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
