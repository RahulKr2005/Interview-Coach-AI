import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [profile, setProfile] = useState({
    name: 'Placement Candidate',
    target_role: 'Frontend Developer',
    experience_level: 'Entry Level',
  });
  const [activeSessionId, setActiveSessionIdState] = useState(() => {
    return localStorage.getItem('interviewcoach_active_session_id') || null;
  });
  const [activeMode, setActiveMode] = useState('Basic Practice Mode');
  const [loading, setLoading] = useState(true);

  const setActiveSessionId = (id) => {
    setActiveSessionIdState(id);
    if (id) {
      localStorage.setItem('interviewcoach_active_session_id', id);
    } else {
      localStorage.removeItem('interviewcoach_active_session_id');
    }
  };

  const reloadProfileAndSettings = async () => {
    try {
      const [profData, settingsData] = await Promise.all([
        api.getProfile(),
        api.getSettings(),
      ]);
      setProfile(profData);
      setActiveMode(settingsData.use_local_ai ? 'Local AI' : 'Basic Practice Mode');
    } catch (err) {
      console.error('Failed to load user profile or settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadProfileAndSettings();
  }, []);

  return (
    <UserContext.Provider
      value={{
        profile,
        setProfile,
        activeSessionId,
        setActiveSessionId,
        activeMode,
        setActiveMode,
        reloadProfileAndSettings,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
