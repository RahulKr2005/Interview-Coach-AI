import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  AlertTriangle, 
  ExternalLink, 
  RotateCcw, 
  Search, 
  Calendar,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';

export default function HistoryView({ setActivePage, onSelectSession }) {
  const { reloadProfileAndSettings } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await api.getAllSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message || 'Failed to load past sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await api.deleteSession(sessionToDelete.id);
      setSessionToDelete(null);
      setActionNotice('Interview session deleted successfully.');
      await loadSessions();
      await reloadProfileAndSettings();
    } catch (err) {
      setError(err.message || 'Failed to delete session');
    }
  };

  const handleWipeAllData = async () => {
    try {
      await api.deleteAllData();
      setShowWipeModal(false);
      setActionNotice('All local session history and resume data have been erased.');
      await loadSessions();
      await reloadProfileAndSettings();
    } catch (err) {
      setError(err.message || 'Failed to erase data');
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterRole === 'ALL') return true;
    return s.target_role === filterRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Practice History & Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review past mock interview performances, question logs, and printable coaching summaries.
          </p>
        </div>
        {sessions.length > 0 && (
          <button
            onClick={() => setShowWipeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Local Data</span>
          </button>
        )}
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Filter Role:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Roles ({sessions.length})</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Java Developer">Java Developer</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
          </select>
        </div>

        <button
          onClick={() => setActivePage('start')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm"
        >
          + New Practice Session
        </button>
      </div>

      {/* Sessions Table or Empty State */}
      {filteredSessions.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Role & Focus</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Coaching Score</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-mono">
                      {s.created_at ? s.created_at.substring(0, 16).replace('T', ' ') : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 text-xs">
                      <div>{s.target_role}</div>
                      <span className="text-[11px] font-normal text-slate-400">{s.interview_type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{s.difficulty}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {s.answered_count} / {s.question_count}
                      {s.skipped_count > 0 && (
                        <span className="text-[10px] text-slate-400 block">({s.skipped_count} skipped)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.average_score !== null ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          s.average_score >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.average_score}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Incomplete</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {s.mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectSession(s.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded"
                        >
                          View Report
                        </button>
                        <button
                          onClick={() => setSessionToDelete(s)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="py-16 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">No Mock Sessions Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Completed or in-progress interview sessions will appear here with detailed scoring breakdowns.
          </p>
          <button
            onClick={() => setActivePage('start')}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            Start Your First Practice Mock
          </button>
        </Card>
      )}

      {/* Delete Single Session Modal */}
      <Modal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        title="Delete Interview Session?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this session for <span className="font-semibold text-slate-900">{sessionToDelete?.target_role}</span>? This will permanently delete recorded answers and feedback for this session.
          </p>
          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => setSessionToDelete(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSession}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
            >
              Delete Session
            </button>
          </div>
        </div>
      </Modal>

      {/* Wipe All Data Modal */}
      <Modal
        isOpen={showWipeModal}
        onClose={() => setShowWipeModal(false)}
        title="Permanently Delete All Local Data?"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              Warning: This action will erase all interview sessions, questions, scores, and uploaded resume text from your local SQLite database.
            </span>
          </div>
          <p className="text-sm text-slate-600">
            This action cannot be undone. Are you sure you wish to reset your placement workspace?
          </p>
          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => setShowWipeModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleWipeAllData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
            >
              Yes, Erase All Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
