const API_BASE = (typeof window !== 'undefined' && window.location.port !== '8000' && window.location.port !== '')
  ? `http://${window.location.hostname || '127.0.0.1'}:8000/api`
  : '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorData.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),

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

  // Interview
  startInterview: (data) => request('/interview/start', { method: 'POST', body: JSON.stringify(data) }),
  getSession: (sessionId) => request(`/interview/${sessionId}`),
  submitAnswer: (questionId, userAnswer) =>
    request('/interview/submit', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, user_answer: userAnswer }),
    }),
  skipQuestion: (questionId) => request(`/interview/question/${questionId}/skip`, { method: 'POST' }),
  endSession: (sessionId) => request(`/interview/${sessionId}/end`, { method: 'POST' }),
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
    } catch (err) {
      try {
        return await request('/api/dashboard/summary');
      } catch (_) {
        const direct = await fetch('http://127.0.0.1:8000/api/dashboard/summary');
        if (direct.ok) return await direct.json();
        throw err;
      }
    }
  },

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getTranscriptionStatus: () => request('/settings/transcription-status'),
  testConnection: (endpoint, modelName) =>
    request('/settings/test-connection', {
      method: 'POST',
      body: JSON.stringify({ ai_endpoint: endpoint, model_name: modelName }),
    }),

  // Reports & History
  getAllSessions: () => request('/reports/sessions'),
  getSessionReport: (sessionId) => request(`/reports/session/${sessionId}`),
  deleteSession: (sessionId) => request(`/reports/session/${sessionId}`, { method: 'DELETE' }),
  deleteAllData: () => request('/reports/all-data', { method: 'DELETE' }),
};
