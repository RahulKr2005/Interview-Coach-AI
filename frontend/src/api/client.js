/**
 * InterviewCoach AI - MERN API Client
 * Connects to Node.js / Express backend with HttpOnly cookie credentials
 * and fallback Bearer token persistence across local dev ports (5000, 5173, 5500).
 */

const TOKEN_STORAGE_KEY = 'interviewcoach_token';

export function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Dynamically resolves the API base URL.
 * - Respects VITE_API_URL environment variable if set.
 * - Uses relative '/api' if frontend is hosted directly on port 5000 (production Express dist).
 * - Matches window.location.hostname dynamically (e.g. localhost:5000 or 127.0.0.1:5000)
 *   to avoid cross-origin cookie mismatch when running on external dev servers (port 5500, 5173).
 */
export function getApiBase() {
  if (typeof window === 'undefined') return '/api';

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // If served directly from Express on port 5000
  if (window.location.port === '5000') {
    return '/api';
  }

  // In local development on any non-5000 port (Live Server port 5500/5501, Vite dev port 5173, etc.),
  // target the MERN Express backend on port 5000 using current hostname
  const host = window.location.hostname || '127.0.0.1';
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';

  if (isLocalhost && window.location.port && window.location.port !== '5000') {
    return `http://${host}:5000/api`;
  }

  // Default for production cloud hosting behind reverse proxy (e.g. port 80/443)
  return '/api';
}

export async function request(endpoint, options = {}) {
  const primaryBase = getApiBase();
  const url = `${primaryBase}${endpoint}`;

  const headers = { ...options.headers };

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach stored JWT Bearer token if present (preserves session across dev ports)
  const token = getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Determine timeout: allow 60s for AI inference / resume parsing, 15s for standard CRUD
  const isAiEndpoint =
    endpoint.includes('/suggestions') ||
    endpoint.includes('/submit') ||
    endpoint.includes('/evaluate') ||
    endpoint.includes('/upload');
  const timeoutMs = options.timeout || (isAiEndpoint ? 60000 : 15000);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include', // Include HttpOnly cookies
    signal: options.signal || controller.signal,
  };

  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    // If server returned 405 Method Not Allowed (e.g. hitting static Live Server)
    if (response.status === 405) {
      throw new Error(
        `Backend server returned HTTP 405 or request hit a static file server. Please ensure the MERN backend is running on port 5000 (launch start_app.bat or run 'npm start' in the server folder).`
      );
    }

    if (response.ok) {
      const data = await response.json();
      // Store token if returned in auth response
      if (data && data.token) {
        setToken(data.token);
      }
      return data;
    }

    // Server returned non-ok JSON error
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorData.detail || errorMsg;
    } catch (_) {}

    throw new Error(errorMsg);
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new Error(
        `Request timed out after ${timeoutMs / 1000}s. Please check if the backend server is responding on port 5000.`
      );
    }

    // Check if network failed (connection refused, DNS failure, offline server)
    const isNetworkError =
      err instanceof TypeError &&
      (err.message.includes('fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('network') ||
        err.message.includes('Failed to fetch'));

    if (isNetworkError) {
      throw new Error(
        `Cannot connect to InterviewCoach AI backend on port 5000. Please start the backend server using start_app.bat or 'npm start' in the server directory.`
      );
    }

    throw err;
  }
}

export const api = {
  // Authentication
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: async () => {
    clearToken();
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (_) {
      // Still proceed with clearing client state
    }
    return { success: true };
  },
  getMe: () => request('/auth/me'),
  getProfile: () => request('/auth/profile'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Resume
  getResume: () => request('/resume'),
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
  deleteResume: () => request('/resume', { method: 'DELETE' }),
  getResumeSuggestions: (data) => request('/resume/suggestions', { method: 'POST', body: JSON.stringify(data) }),

  // Interview
  startInterview: (data) => request('/interview/start', { method: 'POST', body: JSON.stringify(data) }),
  getSession: (sessionId) => request(`/interview/${sessionId}`),
  submitAnswer: (questionId, userAnswer, sessionId = null) =>
    request('/interview/submit', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, user_answer: userAnswer, session_id: sessionId }),
    }),
  evaluateAnswer: (questionId) => request(`/interview/question/${questionId}/evaluate`, { method: 'POST' }),
  skipQuestion: (questionId) => request(`/interview/question/${questionId}/skip`, { method: 'POST' }),
  endSession: (sessionId) => request(`/interview/${sessionId}/end`, { method: 'POST' }),
  getAllSessions: () => request('/interview/sessions'),
  getSessionReport: (sessionId) => request(`/interview/${sessionId}`),
  deleteSession: (sessionId) => request(`/interview/session/${sessionId}`, { method: 'DELETE' }),
  deleteAllData: () => request('/interview/all-data', { method: 'DELETE' }),

  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getTranscriptionStatus: () => request('/settings/transcription-status'),
  testConnection: (payload) =>
    request('/settings/test-connection', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
