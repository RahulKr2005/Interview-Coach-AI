import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';
import ResumeWorkspace from './pages/ResumeWorkspace';
import StartInterview from './pages/StartInterview';
import InterviewSession from './pages/InterviewSession';
import ResultsView from './pages/ResultsView';
import HistoryView from './pages/HistoryView';
import SettingsView from './pages/SettingsView';
import { useUser } from './context/UserContext';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const { setActiveSessionId } = useUser();

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setActivePage('results');
  };

  const handleCompleteSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setActiveSessionId(null);
    setActivePage('results');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 pb-16">
        {activePage === 'dashboard' && (
          <Dashboard 
            setActivePage={setActivePage} 
            onSelectSession={handleSelectSession} 
          />
        )}

        {activePage === 'resume' && (
          <ResumeWorkspace 
            setActivePage={setActivePage} 
          />
        )}

        {activePage === 'start' && (
          <StartInterview 
            setActivePage={setActivePage} 
          />
        )}

        {activePage === 'session' && (
          <InterviewSession 
            setActivePage={setActivePage}
            onCompleteSession={handleCompleteSession} 
          />
        )}

        {activePage === 'results' && (
          <ResultsView 
            sessionId={selectedSessionId} 
            setActivePage={setActivePage} 
          />
        )}

        {activePage === 'history' && (
          <HistoryView 
            setActivePage={setActivePage} 
            onSelectSession={handleSelectSession} 
          />
        )}

        {activePage === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Global Authentication Modal */}
      <AuthModal />

      {/* Placement platform footer */}
      <footer className="no-print bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">InterviewCoach AI</span>
            <span>•</span>
            <span>Placement Interview Preparation & Practice Platform</span>
          </div>
          <div className="text-[11px] text-slate-400">
            MERN Stack (MongoDB, Express, React, Node.js) • Local & Secure • Zero Cloud Telemetry
          </div>
        </div>
      </footer>
    </div>
  );
}
