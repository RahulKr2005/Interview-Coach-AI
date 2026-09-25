/**
 * InterviewCoach AI - MERN API Client
 * Connects to Node.js / Express backend with HttpOnly cookie credentials.
 * Automatically handles port 5000 (MERN server), Vite dev server (port 5173),
 * and Live Server fallback.
 */

const MERN_BACKEND_URL = 'http://127.0.0.1:5000';

function getApiBase() {
  if (typeof window === 'undefined') return '/api';
  // If hosted on port 5000, relative /api is direct same-origin
  if (window.location.port === '5000') return '/api';
  // In dev / external ports (5173, 5500), target Express backend directly
  return `${MERN_BACKEND_URL}/api`;
}

export async function request(endpoint, options = {}) {
  const primaryBase = getApiBase();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Include credentials for HttpOnly cookie exchange across ports
  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include',
  };

  const urlsToTry = [
    `${primaryBase}${endpoint}`,
    `${MERN_BACKEND_URL}/api${endpoint}`,
    `/api${endpoint}`,
  ];

  const uniqueUrls = [...new Set(urlsToTry)];
  let lastError = null;

  for (const url of uniqueUrls) {
    try {
      const response = await fetch(url, fetchOptions);

      if (response.ok) {
        return await response.json();
      }

      // If server returned structured error JSON, parse message
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (_) {}

      // If route not found on candidate, try next candidate
      if (response.status === 404) {
        lastError = new Error(errorMsg);
        continue;
      }

      throw new Error(errorMsg);
    } catch (netErr) {
      lastError = netErr;
      // If error was thrown intentionally with a server message, rethrow it
      if (netErr.message && !netErr.message.includes('fetch') && !netErr.message.includes('network')) {
        throw netErr;
      }
    }
  }

  throw lastError || new Error('Network request failed. Is the MERN backend running on port 5000?');
}

export const api = {
  // Authentication
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
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
  submitAnswer: (questionId, userAnswer) =>
    request('/interview/submit', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, user_answer: userAnswer }),
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
