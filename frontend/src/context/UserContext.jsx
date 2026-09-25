import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export function UserProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || 'Placement Candidate',
    target_role: user?.target_role || 'MERN Stack Developer',
    experience_level: user?.experience_level || 'Student / Fresher',
  });

  const [activeSessionId, setActiveSessionIdState] = useState(() => {
    return localStorage.getItem('interviewcoach_active_session_id') || null;
  });

  const [activeMode, setActiveMode] = useState('Basic Practice Mode');
  const [loading, setLoading] = useState(true);

  // Sync profile when auth user changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || 'Placement Candidate',
        target_role: user.target_role || 'MERN Stack Developer',
        experience_level: user.experience_level || 'Student / Fresher',
      });
    } else {
      setProfile({
        name: 'Placement Candidate',
        target_role: 'MERN Stack Developer',
        experience_level: 'Student / Fresher',
      });
    }
  }, [user]);

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
      if (isAuthenticated) {
        const [profData, settingsData] = await Promise.all([
          api.getProfile().catch(() => null),
          api.getSettings().catch(() => null),
        ]);
        if (profData) setProfile(profData);
        if (settingsData) {
          const modeStr = settingsData.mode || (settingsData.gemini_configured ? `Google Gemini (${settingsData.gemini_model})` : 'Demo Mode (Placement Rubric)');
          setActiveMode(modeStr);
        }
      } else {
        const settingsData = await api.getSettings().catch(() => null);
        if (settingsData) {
          const modeStr = settingsData.mode || (settingsData.gemini_configured ? `Google Gemini (${settingsData.gemini_model})` : 'Demo Mode (Placement Rubric)');
          setActiveMode(modeStr);
        }
      }
    } catch (err) {
      console.error('Failed to load user profile or settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadProfileAndSettings();
  }, [isAuthenticated]);

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
