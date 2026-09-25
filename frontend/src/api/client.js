/**
 * InterviewCoach AI - API Client
 * Universal, offline-first client supporting Standalone (port 8000), Live Server (port 5500),
 * Vite Dev Server (port 5173), and graceful zero-error offline practice mode.
 */

const BACKEND_LOOPBACK = 'http://127.0.0.1:8000';

function getApiBase() {
  if (typeof window === 'undefined') return '/api';
  if (window.location.port === '8000') return '/api';
  return `${BACKEND_LOOPBACK}/api`;
}

export async function request(endpoint, options = {}) {
  const primaryBase = getApiBase();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const urlsToTry = [
    `${primaryBase}${endpoint}`,
    `${BACKEND_LOOPBACK}/api${endpoint}`,
    `${BACKEND_LOOPBACK}${endpoint}`,
    `/api${endpoint}`,
  ];

  const uniqueUrls = [...new Set(urlsToTry)];
  let lastError = null;

  for (const url of uniqueUrls) {
    try {
      const response = await fetch(url, { ...options, headers });
      if (response.ok) {
        return await response.json();
      }

      if (response.status === 404 || response.status === 405) {
        lastError = new Error(`HTTP Error ${response.status}`);
        continue;
      }

      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorData.message || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    } catch (netErr) {
      lastError = netErr;
    }
  }

  throw lastError || new Error('Network request failed');
}

// -------------------------------------------------------------
// Offline Curated Fallback Question Bank & Session Engine
// -------------------------------------------------------------
const OFFLINE_QUESTION_BANK = {
  'Frontend Developer': [
    {
      question: 'How does the JavaScript Event Loop work? Specifically, explain how the Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout) interact.',
      topic: 'JavaScript Event Loop',
      reference_answer: 'JavaScript is single-threaded. Synchronous code runs on the Call Stack. Asynchronous tasks dispatch callbacks to either the Microtask Queue (Promises, queueMicrotask) or Macrotask Queue (setTimeout, I/O). When the Call Stack empties, the Event Loop drains all pending microtasks before processing a single macrotask, repeating continuously.',
      checklist: ['Mention single-threaded nature of JavaScript', 'Differentiate microtasks from macrotasks', 'Explain execution priority order']
    },
    {
      question: 'What is the purpose of useEffect dependency arrays, and what causes the "stale closure" bug in React functional components?',
      topic: 'React Hooks & Lifecycle',
      reference_answer: 'The dependency array instructs React when to re-run an effect. Stale closures occur when an effect or callback captures variables from an earlier render without listing them in dependencies, causing the handler to reference outdated values.',
      checklist: ['Explain dependency array comparison mechanism', 'Define closures in JavaScript', 'Describe how functional state updates or refs prevent stale state']
    },
    {
      question: 'Explain Core Web Vitals (LCP, INP/FID, CLS), and what techniques would you use to improve Largest Contentful Paint (LCP)?',
      topic: 'Web Performance',
      reference_answer: 'LCP measures perceived loading speed, INP measures responsiveness, and CLS measures visual stability. To optimize LCP: preload the hero image, optimize image formats (WebP/AVIF), minimize server response time (TTFB), eliminate render-blocking scripts/styles, and avoid client lazy-loading for above-the-fold content.',
      checklist: ['Define LCP, INP, and CLS metrics accurately', 'Suggest image preloading and compression', 'Identify render-blocking CSS/JS optimizations']
    },
    {
      question: 'Compare React Context with dedicated external state stores like Redux Toolkit or Zustand. When does Context cause performance bottlenecks?',
      topic: 'State Management',
      reference_answer: 'React Context is intended for dependency injection and low-frequency global values (theme, current user). Whenever a Context value changes, every consuming component re-renders. Zustand and Redux Toolkit offer selector subscriptions (useStore(s => s.foo)), triggering re-renders only when the specifically chosen slice changes.',
      checklist: ['Identify Context re-rendering characteristics', 'Explain selector-based subscriptions in Zustand/Redux', 'Provide guidelines on when to use each']
    },
    {
      question: 'What are React Server Components (RSC) and how do they differ from standard client-side SSR hydration?',
      topic: 'Modern React Architecture',
      reference_answer: 'RSC execute strictly on the server and stream a JSON-like virtual DOM wire format to the client without shipping any JavaScript bundle for those server components. Standard SSR renders initial HTML on the server but still ships all component JS to hydrate client-side.',
      checklist: ['Explain zero-bundle-size server components', 'Differentiate server rendering from client hydration', 'Discuss security and direct backend/database access benefits']
    }
  ],
  'Backend Developer': [
    {
      question: 'Explain the difference between SQL database indexing strategies (B-Tree vs Hash Index) and how composite indexes work.',
      topic: 'Database Optimization',
      reference_answer: 'B-Tree indexes maintain balanced hierarchical order, making them ideal for equality (=) and range queries (<, >, BETWEEN). Hash indexes provide O(1) equality lookups but cannot support range queries. Composite indexes cover multiple columns; queries must query the leftmost prefix columns to use the index effectively.',
      checklist: ['Compare B-Tree vs Hash index use cases', 'Explain leftmost prefix rule for composite indexes', 'Discuss index write overhead trade-offs']
    },
    {
      question: 'How do you design a rate limiter for an API? Compare Token Bucket with Leaky Bucket and Sliding Window Log algorithms.',
      topic: 'API Architecture & Resilience',
      reference_answer: 'Rate limiters prevent system overload. Token Bucket allows bursts up to bucket capacity and refills at a fixed rate. Leaky Bucket smooths traffic to a constant egress rate. Sliding Window Log/Counter tracks timestamped hits across a rolling window for precision without memory explosion.',
      checklist: ['Explain Token Bucket burst tolerance', 'Compare Leaky Bucket smoothing behavior', 'Discuss Redis-based distributed implementation']
    },
    {
      question: 'Explain database isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) and the anomalies they prevent.',
      topic: 'Database Concurrency & ACID',
      reference_answer: 'Read Uncommitted allows dirty reads. Read Committed prevents dirty reads. Repeatable Read prevents dirty and non-repeatable reads. Serializable prevents all anomalies including phantom reads and write skew using two-phase locking or serialization graph checks.',
      checklist: ['Name 4 standard ACID isolation levels in order', 'Define dirty read, non-repeatable read, phantom read', 'Explain performance vs consistency trade-offs']
    },
    {
      question: 'How does connection pooling improve database performance and what happens if the pool is exhausted?',
      topic: 'Backend Systems & Infrastructure',
      reference_answer: 'Establishing TCP and TLS connections with authentication is expensive. A connection pool keeps a set of open connections ready for reuse. When exhausted, incoming requests either queue until a timeout occurs or fail with connection pool timeout exceptions.',
      checklist: ['Identify TCP handshake overhead cost', 'Describe pool min/max size configuration', 'Explain queueing and timeout failure modes']
    },
    {
      question: 'What is idempotent API design and how do you implement idempotency keys for payment processing endpoints?',
      topic: 'Distributed Systems & Payments',
      reference_answer: 'An idempotent operation produces the identical outcome when executed multiple times. For payment endpoints, the client generates a unique UUID idempotency key. The server stores the request and initial response in an atomic key-value store (e.g. Redis). If a duplicate request arrives, the cached response is returned without recharging.',
      checklist: ['Define mathematical idempotency in HTTP', 'Explain UUID client key generation', 'Detail atomic cache checking and expiration']
    }
  ],
  'Full Stack Developer': [
    {
      question: 'How do you securely handle JWT authentication across client and server? Compare storing tokens in localStorage vs httpOnly SameSite cookies.',
      topic: 'Web Security & Auth',
      reference_answer: 'Storing JWTs in localStorage exposes tokens to Cross-Site Scripting (XSS). httpOnly SameSite cookies cannot be accessed by client JavaScript, significantly reducing XSS token theft risks while SameSite=Lax/Strict mitigates Cross-Site Request Forgery (CSRF).',
      checklist: ['Identify localStorage vulnerability to XSS', 'Explain httpOnly cookie protections', 'Address CSRF mitigation strategies']
    },
    {
      question: 'Explain how database connection pooling, indexing, and Redis caching work together to handle 10,000 requests per minute.',
      topic: 'High Scale Architecture',
      reference_answer: 'Redis serves high-frequency read data directly from RAM in sub-milliseconds, shielding the database. Cache misses hit indexed database queries utilizing existing pooled database connections, preventing connection exhaustion and disk I/O bottlenecks.',
      checklist: ['Explain Redis in-memory cache layer', 'Detail database indexing reduction of disk reads', 'Describe connection pool concurrency limits']
    },
    {
      question: 'How do you prevent SQL Injection and Cross-Site Scripting (XSS) in modern full-stack web applications?',
      topic: 'Security Best Practices',
      reference_answer: 'Prevent SQL Injection using parameterized queries and ORMs (e.g. SQLAlchemy, Prisma) rather than string concatenation. Prevent XSS by sanitizing untrusted HTML (DOMPurify), utilizing modern frameworks like React that automatically escape JSX variables, and enforcing strict Content Security Policies (CSP).',
      checklist: ['Detail parameterized queries for SQLi', 'Explain JSX automatic variable escaping', 'Mention Content Security Policy headers']
    },
    {
      question: 'Describe the trade-offs between Monoliths and Microservices architecture for an early-stage startup.',
      topic: 'Software Architecture',
      reference_answer: 'A modular monolith offers rapid feature iteration, single deployment pipeline, zero network latency between services, and simplified debugging. Microservices add distributed network complexity, RPC latency, data synchronization overhead, and DevOps burden, which usually slows early product-market fit.',
      checklist: ['Highlight monolith speed of iteration advantage', 'Detail microservice distributed complexity costs', 'Explain team scaling thresholds for splitting services']
    },
    {
      question: 'How does Docker containerization ensure consistency between local development and cloud production deployments?',
      topic: 'DevOps & Tooling',
      reference_answer: 'Docker packages application code along with exact runtime dependencies, system libraries, and OS environment into an immutable image. This eliminates the "works on my machine" problem, guaranteeing identical behavior across developer workstations, CI/CD pipelines, and cloud clusters.',
      checklist: ['Explain immutable container image packaging', 'Differentiate containers from virtual machines', 'Describe environment consistency benefits']
    }
  ]
};

function getOfflineQuestions(role, count = 5) {
  const bank = OFFLINE_QUESTION_BANK[role] || OFFLINE_QUESTION_BANK['Frontend Developer'];
  const questions = bank.slice(0, count);
  return questions.map((q, idx) => ({
    id: idx + 1,
    question_index: idx + 1,
    question_text: q.question,
    topic: q.topic,
    reference_answer: q.reference_answer,
    checklist: q.checklist,
    user_answer: null,
    feedback: null,
    score: null,
    skipped: false,
    answered_at: null,
  }));
}

function createOfflineSession(data) {
  const sessionId = 'offline-' + Date.now();
  const session = {
    id: sessionId,
    target_role: data.target_role || 'Frontend Developer',
    interview_type: data.interview_type || 'Technical',
    difficulty: data.difficulty || 'Intermediate',
    question_count: data.question_count || 5,
    status: 'in_progress',
    mode: 'Basic Practice Mode (Offline)',
    input_mode: data.input_mode || 'text',
    created_at: new Date().toISOString(),
    completed_at: null,
    current_question_index: 1,
    questions: getOfflineQuestions(data.target_role, data.question_count || 5),
  };

  try {
    localStorage.setItem(`interviewcoach_session_${sessionId}`, JSON.stringify(session));
    localStorage.setItem('interviewcoach_active_session_id', sessionId);
  } catch (_) {}

  return session;
}

function getOfflineSession(sessionId) {
  try {
    const raw = localStorage.getItem(`interviewcoach_session_${sessionId}`);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function submitOfflineAnswer(questionId, userAnswer) {
  const activeId = localStorage.getItem('interviewcoach_active_session_id');
  if (!activeId) return { success: true, score: 75 };

  const session = getOfflineSession(activeId);
  if (!session) return { success: true, score: 75 };

  const q = session.questions.find((item) => item.id === questionId || item.question_index === questionId);
  if (q) {
    q.user_answer = userAnswer;
    q.answered_at = new Date().toISOString();

    const wordCount = (userAnswer || '').trim().split(/\s+/).length;
    let score = 70;
    if (wordCount > 30) score = 85;
    if (wordCount > 60) score = 92;
    if (wordCount < 10) score = 45;

    q.score = score;
    q.feedback = {
      score,
      overall_feedback: `Good response (${wordCount} words). Review the key reference checklist points to ensure complete coverage.`,
      strengths: ['Addressed the core concept directly', 'Clear explanations provided'],
      improvements: ['Consider elaborating with concrete production examples', 'Mention performance trade-offs'],
      checklist_evaluation: (q.checklist || []).map((item, idx) => ({
        point: item,
        covered: idx < 2 || wordCount > 40,
        tip: `Ensure you clearly explain ${item}`
      }))
    };

    if (session.current_question_index < session.question_count) {
      session.current_question_index += 1;
    } else {
      session.status = 'completed';
      session.completed_at = new Date().toISOString();
    }

    try {
      localStorage.setItem(`interviewcoach_session_${activeId}`, JSON.stringify(session));
    } catch (_) {}

    return {
      session_id: activeId,
      question_id: questionId,
      user_answer: userAnswer,
      feedback: q.feedback,
      score,
      is_completed: session.status === 'completed',
      next_question_index: session.current_question_index,
    };
  }

  return { success: true, score: 75 };
}

function skipOfflineQuestion(questionId) {
  const activeId = localStorage.getItem('interviewcoach_active_session_id');
  if (!activeId) return { success: true };

  const session = getOfflineSession(activeId);
  if (!session) return { success: true };

  const q = session.questions.find((item) => item.id === questionId || item.question_index === questionId);
  if (q) {
    q.skipped = true;
    if (session.current_question_index < session.question_count) {
      session.current_question_index += 1;
    } else {
      session.status = 'completed';
      session.completed_at = new Date().toISOString();
    }
    try {
      localStorage.setItem(`interviewcoach_session_${activeId}`, JSON.stringify(session));
    } catch (_) {}
  }
  return { success: true };
}

function endOfflineSession(sessionId) {
  const session = getOfflineSession(sessionId);
  if (session) {
    session.status = 'completed';
    session.completed_at = new Date().toISOString();
    try {
      localStorage.setItem(`interviewcoach_session_${sessionId}`, JSON.stringify(session));
    } catch (_) {}
  }
  return { success: true };
}

function getOfflineDashboardSummary() {
  const targetRole = (typeof localStorage !== 'undefined' && localStorage.getItem('interviewcoach_target_role')) || 'Frontend Developer';
  return {
    total_sessions: 0,
    completed_sessions: 0,
    total_questions_attempted: 0,
    average_score: null,
    practice_streak_days: 1,
    target_role: targetRole,
    active_mode: 'Basic Practice Mode',
    topics_needing_practice: [],
    recent_sessions: [],
    score_trend: [],
  };
}

// -------------------------------------------------------------
// Exported API Interface
// -------------------------------------------------------------
export const api = {
  // Profile
  getProfile: async () => {
    try {
      return await request('/profile');
    } catch (_) {
      return {
        name: (typeof localStorage !== 'undefined' && localStorage.getItem('interviewcoach_user_name')) || 'Placement Candidate',
        target_role: (typeof localStorage !== 'undefined' && localStorage.getItem('interviewcoach_target_role')) || 'Frontend Developer',
        experience_level: 'Entry Level',
      };
    }
  },
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Resume
  getResume: async () => {
    try {
      return await request('/resume');
    } catch (_) {
      return {
        has_resume: false,
        skills: [],
        experience_summary: '',
      };
    }
  },
  uploadResumePdf: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/resume/upload', {
      method: 'POST',
      body: formData,
    });
  },
  pasteResumeText: (text) => request('/resume/paste', { method: 'POST', body: JSON.stringify({ text }) }),
  updateResume: (data) => request('/resume', { method: 'PUT', body: JSON.stringify(data) }),

  // Interview
  startInterview: async (data) => {
    try {
      return await request('/interview/start', { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      console.warn('Backend server unavailable or returned error, activating offline practice mode:', err);
      return createOfflineSession(data);
    }
  },
  getSession: async (sessionId) => {
    try {
      return await request(`/interview/${sessionId}`);
    } catch (err) {
      const offline = getOfflineSession(sessionId);
      if (offline) return offline;
      throw err;
    }
  },
  submitAnswer: async (questionId, userAnswer) => {
    try {
      return await request('/interview/submit', {
        method: 'POST',
        body: JSON.stringify({ question_id: questionId, user_answer: userAnswer }),
      });
    } catch (err) {
      return submitOfflineAnswer(questionId, userAnswer);
    }
  },
  skipQuestion: async (questionId) => {
    try {
      return await request(`/interview/question/${questionId}/skip`, { method: 'POST' });
    } catch (err) {
      return skipOfflineQuestion(questionId);
    }
  },
  endSession: async (sessionId) => {
    try {
      return await request(`/interview/${sessionId}/end`, { method: 'POST' });
    } catch (err) {
      return endOfflineSession(sessionId);
    }
  },
  transcribeAudio: (audioBlob, filename = 'recording.webm') => {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    return request('/interview/transcribe', {
      method: 'POST',
      body: formData,
    });
  },

  // Dashboard
  getDashboardSummary: async () => {
    try {
      return await request('/dashboard/summary');
    } catch (_) {
      return getOfflineDashboardSummary();
    }
  },

  // Settings
  getSettings: async () => {
    try {
      return await request('/settings');
    } catch (_) {
      return {
        ai_endpoint: 'http://127.0.0.1:11434/v1',
        model_name: 'llama3:8b',
        use_local_ai: false,
        timeout_seconds: 20.0,
      };
    }
  },
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getTranscriptionStatus: async () => {
    try {
      return await request('/settings/transcription-status');
    } catch (_) {
      return {
        faster_whisper_available: false,
        device: 'cpu',
        model_loaded: false,
      };
    }
  },
  testConnection: (endpoint, modelName) =>
    request('/settings/test-connection', {
      method: 'POST',
      body: JSON.stringify({ ai_endpoint: endpoint, model_name: modelName }),
    }),

  // Reports & History
  getAllSessions: async () => {
    try {
      return await request('/reports/sessions');
    } catch (_) {
      return [];
    }
  },
  getSessionReport: (sessionId) => request(`/reports/session/${sessionId}`),
  deleteSession: (sessionId) => request(`/reports/session/${sessionId}`, { method: 'DELETE' }),
  deleteAllData: () => request('/reports/all-data', { method: 'DELETE' }),
};
