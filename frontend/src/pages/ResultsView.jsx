import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Printer, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  ThumbsUp, 
  AlertTriangle,
  Lightbulb,
  Sparkles,
  RotateCcw,
  Check,
  FileText
} from 'lucide-react';
import Card from '../components/Card';
import ModeBadge from '../components/ModeBadge';
import { api } from '../api/client';

export default function ResultsView({ sessionId, setActivePage }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      loadReport(sessionId);
    }
  }, [sessionId]);

  const loadReport = async (id) => {
    try {
      setLoading(true);
      const data = await api.getSessionReport(id);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to load session report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center p-8 bg-red-50 border border-red-200 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <h3 className="font-semibold text-red-900 text-lg">Unable to generate report</h3>
        <p className="text-sm text-red-600 mt-1">{error || 'Session not found'}</p>
        <button
          onClick={() => setActivePage('dashboard')}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
          <button
            onClick={() => setActivePage('start')}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Practice Session</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Official Placement Practice Report
              </span>
              <ModeBadge mode={report.mode} size="sm" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {report.target_role} — {report.interview_type} Mock
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Candidate: <span className="font-semibold text-slate-700">{report.candidate_name}</span> • 
              Difficulty: <span className="font-semibold text-slate-700">{report.difficulty}</span> • 
              Date: <span className="font-semibold text-slate-700">{report.created_at ? report.created_at.substring(0, 10) : ''}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Coaching Score</p>
              <h2 className={`text-3xl font-extrabold ${
                report.average_score >= 70 ? 'text-teal-600' : 'text-amber-600'
              }`}>
                {report.average_score}%
              </h2>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-100/60 border border-teal-200 flex items-center justify-center text-teal-700">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <p className="text-[11px] text-slate-400 italic">
          Disclaimer: Scores and feedback provided herein represent automated preparation coaching metrics designed to foster continuous learning. They do not constitute certified hiring evaluations or employment predictions.
        </p>
      </div>

      {/* Detailed Question Review List */}
      <div className="space-y-6">
        <h3 className="font-bold text-slate-900 text-lg">Question-by-Question Assessment</h3>

        {report.questions?.map((q, idx) => (
          <Card key={idx} className="border-slate-200">
            <div className="space-y-4">
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      Q{q.question_index}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Topic: {q.topic}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{q.question_text}</h4>
                </div>

                <div className="shrink-0">
                  {q.skipped ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
                      Skipped
                    </span>
                  ) : (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                      (q.score || 0) >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {q.score || 0}%
                    </span>
                  )}
                </div>
              </div>

              {/* Candidate Answer */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider block mb-1">
                  Candidate Response:
                </span>
                <p className="text-slate-800 whitespace-pre-wrap">
                  {q.user_answer || <span className="italic text-slate-400">No answer provided (skipped)</span>}
                </p>
              </div>

              {/* Feedback Breakdown */}
              {q.feedback && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs">
                    <span className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                      <ThumbsUp className="w-3.5 h-3.5" /> Strengths:
                    </span>
                    <ul className="space-y-1 text-emerald-950">
                      {q.feedback.strengths?.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 text-xs">
                    <span className="font-semibold text-amber-800 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Areas to Improve:
                    </span>
                    <ul className="space-y-1 text-amber-950">
                      {q.feedback.missing_points?.map((m, i) => (
                        <li key={i}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Reference Model Answer */}
              <div className="p-3.5 rounded-lg bg-slate-900 text-slate-200 text-xs">
                <span className="font-semibold text-teal-400 uppercase text-[10px] tracking-wider block mb-1">
                  Reference Model Answer:
                </span>
                <p className="leading-relaxed whitespace-pre-wrap">{q.reference_answer}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
