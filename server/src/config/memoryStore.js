/**
 * Resilient In-Memory Fallback Store
 * Used when local MongoDB service is not yet installed/running on the developer machine.
 * Guarantees zero crashing and allows complete end-to-end verification of authentication,
 * resume extraction, mock interview sessions, and dashboard charts.
 */

class MemoryStore {
  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.sessions = new Map();
    this.settings = new Map();
  }

  // --- Users ---
  findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) return user;
    }
    return null;
  }

  findUserById(id) {
    return this.users.get(String(id)) || null;
  }

  saveUser(user) {
    const id = user._id ? String(user._id) : 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const doc = {
      ...user,
      _id: id,
      id: id,
      createdAt: user.createdAt || new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, doc);
    return doc;
  }

  // --- Resumes ---
  findResumeByUserId(userId) {
    for (const resume of this.resumes.values()) {
      if (String(resume.userId) === String(userId)) return resume;
    }
    return null;
  }

  saveResume(resume) {
    const id = resume._id ? String(resume._id) : 'res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const doc = {
      ...resume,
      _id: id,
      id: id,
      updatedAt: new Date()
    };
    this.resumes.set(id, doc);
    return doc;
  }

  deleteResumeByUserId(userId) {
    for (const [id, resume] of this.resumes.entries()) {
      if (String(resume.userId) === String(userId)) {
        this.resumes.delete(id);
        return true;
      }
    }
    return false;
  }

  // --- Sessions ---
  findSessionById(id) {
    return this.sessions.get(String(id)) || null;
  }

  findSessionsByUserId(userId) {
    const results = [];
    for (const session of this.sessions.values()) {
      if (String(session.userId) === String(userId)) results.push(session);
    }
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  saveSession(session) {
    const id = session._id ? String(session._id) : 'ses_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const doc = {
      ...session,
      _id: id,
      id: id,
      createdAt: session.createdAt || new Date(),
      updatedAt: new Date()
    };
    this.sessions.set(id, doc);
    return doc;
  }

  deleteSessionById(id, userId) {
    const session = this.sessions.get(String(id));
    if (session && String(session.userId) === String(userId)) {
      this.sessions.delete(String(id));
      return true;
    }
    return false;
  }

  // --- Settings ---
  findSettingsByUserId(userId) {
    return this.settings.get(String(userId)) || null;
  }

  saveSettings(userId, settings) {
    const doc = {
      userId: String(userId),
      ...settings,
      updatedAt: new Date()
    };
    this.settings.set(String(userId), doc);
    return doc;
  }
}

export const memoryStore = new MemoryStore();
