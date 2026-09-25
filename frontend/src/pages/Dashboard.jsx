import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  HelpCircle, 
  TrendingUp, 
  AlertTriangle, 
  Play, 
  FileText, 
  ArrowRight,
  Clock,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Card from '../components/Card';
import ModeBadge from '../components/ModeBadge';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';

export default function Dashboard({ setActivePage, onSelectSession }) {
  const { profile, activeMode } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err) {
      console.warn('Dashboard summary fetch failed, using fallback:', err);
      setData({
        total_sessions: 0,
        completed_sessions: 0,
        total_questions_attempted: 0,
        average_score: null,
        practice_streak_days: 0,
        target_role: profile?.target_role || 'Frontend Developer',
        active_mode: activeMode || 'Basic Practice Mode',
        topics_needing_practice: [],
        recent_sessions: [],
        score_trend: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading placement dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h3 className="font-semibold text-red-900 text-lg">Unable to load dashboard</h3>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button
          onClick={loadSummary}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasSessions = (data?.total_sessions || 0) > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-700">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                Target Role: {data.target_role}
              </span>
              <ModeBadge mode={data.active_mode} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {profile.name}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Private, offline-first placement prep. Practice role-specific technical and behavioral questions, inspect model answers, and track your progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('start')}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium shadow-sm transition-all text-sm shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start New Mock</span>
            </button>
            <button
              onClick={() => setActivePage('resume')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium transition-all text-sm shrink-0"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed Mocks</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {data.completed_sessions} <span className="text-xs font-normal text-slate-400">/ {data.total_sessions} total</span>
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Questions Answered</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{data.total_questions_attempted}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Practice Score</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {data.average_score !== null ? `${data.average_score}%` : 'N/A'}
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Preparation Level</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 truncate">{profile.experience_level}</h3>
          </div>
        </Card>
      </div>

      {/* Main Grid: Chart & Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart (2 Cols) */}
        <div className="lg:col-span-2">
          <Card
            title="Practice Performance Trend"
            subtitle="Historical session scores stored locally in your database"
          >
            {data.score_trend && data.score_trend.length > 0 ? (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.score_trend} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="session_index" 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      tickFormatter={(val) => `M#${val}`}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Average Score']}
                      labelFormatter={(label) => `Mock #${label}`}
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#0d9488" 
                      strokeWidth={3} 
                      dot={{ fill: '#0d9488', r: 4 }}
                      activeDot={{ r: 6, fill: '#14b8a6' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <TrendingUp className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-700">No score history yet</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Complete your first mock interview session to begin charting your progress.
                </p>
                <button
                  onClick={() => setActivePage('start')}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700"
                >
                  Start First Session
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Topics Needing Practice (1 Col) */}
        <div>
          <Card
            title="Focus Areas"
            subtitle="Topics scored below 70% or skipped"
          >
            {data.topics_needing_practice && data.topics_needing_practice.length > 0 ? (
              <div className="space-y-3">
                {data.topics_needing_practice.map((topic, i) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{topic.topic}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Attempted {topic.count} time{topic.count > 1 ? 's' : ''}
                        {topic.skipped_count > 0 && ` • ${topic.skipped_count} skipped`}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                      {topic.avg_score}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No weak topics recorded</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Topics with room for improvement will automatically appear here as you practice questions.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Practice Sessions */}
      <Card
        title="Recent Interview Sessions"
        subtitle="Review past answers, reference criteria, and feedback"
        action={
          hasSessions && (
            <button
              onClick={() => setActivePage('history')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )
        }
      >
        {data.recent_sessions && data.recent_sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Type & Difficulty</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Average Score</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recent_sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {sess.created_at ? sess.created_at.substring(0, 16).replace('T', ' ') : '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{sess.target_role}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {sess.interview_type} • <span className="font-medium">{sess.difficulty}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {sess.answered_count} / {sess.question_count}
                    </td>
                    <td className="py-3 px-4">
                      {sess.average_score !== null ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          sess.average_score >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sess.average_score}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Incomplete</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {sess.mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectSession(sess.id)}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-800 text-base">Your placement workspace is ready</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Get interview-ready by taking a 5-question mock in your target role. No cloud account or external internet needed.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActivePage('start')}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Start First Mock Interview
              </button>
              <button
                onClick={() => setActivePage('resume')}
                className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50"
              >
                Upload Resume First
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
