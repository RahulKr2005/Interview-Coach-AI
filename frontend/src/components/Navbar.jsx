import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  PlayCircle, 
  History, 
  Settings,
  AlertCircle,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import ModeBadge from './ModeBadge';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setActivePage }) {
  const { profile, activeMode, activeSessionId } = useUser();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'start', label: 'Start Interview', icon: PlayCircle },
    { id: 'history', label: 'History & Reports', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-inner">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">InterviewCoach</span>
                <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-semibold">AI</span>
              </div>
              <p className="text-xs text-slate-400">Placement Interview Preparation & Practice Platform</p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-teal-400 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Indicators & Active Session Resume & Auth */}
          <div className="flex items-center gap-3">
            {activeSessionId && activePage !== 'session' && (
              <button
                onClick={() => setActivePage('session')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-semibold hover:bg-amber-500/30 transition-colors animate-pulse"
                title="Resume unfinished interview session"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Resume Session</span>
              </button>
            )}

            <div className="hidden sm:block">
              <ModeBadge mode={activeMode} size="sm" />
            </div>

            {/* Authenticated User or Login CTA */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5 border-l border-slate-700 pl-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-xs uppercase">
                  {user?.name ? user.name.charAt(0) : (profile.name ? profile.name.charAt(0) : 'U')}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-medium text-slate-200 truncate max-w-[120px]">{user?.name || profile.name}</p>
                  <p className="text-[11px] text-teal-400 font-mono truncate max-w-[120px]">{user?.target_role || profile.target_role}</p>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-900/95 overflow-x-auto px-2 py-1 justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium ${
                isActive ? 'text-teal-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
