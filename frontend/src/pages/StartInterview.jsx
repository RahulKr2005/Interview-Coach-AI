import React, { useState } from 'react';
import { 
  Play, 
  Layers, 
  Gauge, 
  HelpCircle, 
  Sparkles, 
  Check, 
  BookOpen, 
  Cpu, 
  Code,
  Users,
  FileText,
  Mic,
  Keyboard,
  Volume2,
  ShieldCheck
} from 'lucide-react';
import Card from '../components/Card';
import ModeBadge from '../components/ModeBadge';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';

const SUPPORTED_ROLES = [
  { id: 'Frontend Developer', name: 'Frontend Developer', desc: 'React, TypeScript, CSS Architecture, Web Performance' },
  { id: 'Backend Developer', name: 'Backend Developer', desc: 'APIs, Concurrency, Database Indexing, Caching, Systems' },
  { id: 'Full Stack Developer', name: 'Full Stack Developer', desc: 'End-to-End Architecture, Security, Docker, SSR, Integrations' },
  { id: 'Java Developer', name: 'Java Developer', desc: 'JVM Architecture, Spring Boot, Concurrency, JPA/Hibernate' },
  { id: 'Data Analyst', name: 'Data Analyst', desc: 'SQL Joins & Windows, EDA, A/B Testing, Business KPIs' },
  { id: 'DevOps Engineer', name: 'DevOps Engineer', desc: 'CI/CD, Kubernetes, Docker, Linux, Observability, IaC' },
];

const INTERVIEW_TYPES = [
  { id: 'Technical', label: 'Technical Interview', icon: Code, desc: 'Role-specific engineering concepts, trade-offs, and systems.' },
  { id: 'HR', label: 'HR & Behavioral', icon: Users, desc: 'STAR method answers, teamwork, conflict resolution, leadership.' },
  { id: 'Resume-Based', label: 'Resume-Based Tech', icon: FileText, desc: 'Combines your role requirements with extracted resume skills.' },
];

const DIFFICULTIES = [
  { id: 'Beginner', label: 'Beginner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'Intermediate', label: 'Intermediate', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'Advanced', label: 'Advanced', color: 'text-purple-700 bg-purple-50 border-purple-200' },
];

const QUESTION_COUNTS = [5, 10, 15];

export default function StartInterview({ setActivePage }) {
  const { profile, activeMode, setActiveSessionId } = useUser();
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'voice'
  const [selectedRole, setSelectedRole] = useState(profile.target_role || 'Frontend Developer');
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await api.startInterview({
        target_role: selectedRole,
        interview_type: interviewType,
        difficulty: difficulty,
        question_count: questionCount,
        input_mode: inputMode,
      });

      // Save active session in context / localStorage
      setActiveSessionId(session.id);
      setActivePage('session');
    } catch (err) {
      setError(err.message || 'Failed to start interview session');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configure Mock Interview</h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Tailor your placement preparation session. Practice answering one question at a time and receive comprehensive review criteria.
        </p>
      </div>

      {/* Mode Awareness Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
        activeMode === 'Local AI'
          ? 'bg-emerald-50/70 border-emerald-200'
          : 'bg-amber-50/70 border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            activeMode === 'Local AI' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {activeMode === 'Local AI' ? <Cpu className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Inference Mode</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              {activeMode === 'Local AI'
                ? 'Local AI inference is connected. You will receive AI-generated coaching feedback and rubric scoring.'
                : 'Basic Practice Mode: offline curated question bank with reference answers and self-review checklists.'}
            </p>
          </div>
        </div>
        <ModeBadge mode={activeMode} size="sm" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Form Card */}
      <Card>
        <div className="space-y-6">
          {/* Step 1: Delivery Mode (Text vs Voice) */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              1. Choose Interview Delivery Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  inputMode === 'text'
                    ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Keyboard className={`w-4 h-4 ${inputMode === 'text' ? 'text-teal-600' : 'text-slate-500'}`} />
                    <span className="font-semibold text-sm text-slate-900">Standard Text Interview</span>
                  </div>
                  {inputMode === 'text' && <Check className="w-4 h-4 text-teal-600" />}
                </div>
                <p className="text-xs text-slate-500">
                  Read questions on-screen and type answers via keyboard. Best for quiet environments or quick practice.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  inputMode === 'voice'
                    ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Mic className={`w-4 h-4 ${inputMode === 'voice' ? 'text-teal-600' : 'text-slate-500'}`} />
                    <span className="font-semibold text-sm text-slate-900">Voice Mock Interview</span>
                  </div>
                  {inputMode === 'voice' && <Check className="w-4 h-4 text-teal-600" />}
                </div>
                <p className="text-xs text-slate-500">
                  TTS question read-aloud, microphone recording, local transcription, and review/edit before submit.
                </p>
              </button>
            </div>

            {inputMode === 'voice' && (
              <div className="mt-3 p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl text-xs text-teal-900 flex items-start gap-2">
                <Volume2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Voice Mode Active:</span>
                  <span>
                    Questions can be read aloud using browser voices. Audio recordings (up to 3 mins) are transcribed locally on your PC. Raw audio is never saved to disk. Microphone access requires localhost or HTTPS.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Target Role */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              2. Select Target Placement Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SUPPORTED_ROLES.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900">{role.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{role.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Interview Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              3. Interview Focus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INTERVIEW_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = interviewType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setInterviewType(type.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-slate-500'}`} />
                      <span className="font-semibold text-sm text-slate-900">{type.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{type.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4 & 5: Difficulty & Question Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                4. Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((diff) => {
                  const isSelected = difficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setDifficulty(diff.id)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                        isSelected
                          ? `${diff.color} ring-1 ring-offset-1`
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {diff.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                5. Session Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {QUESTION_COUNTS.map((count) => {
                  const isSelected = questionCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {count} Questions
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Session state is preserved automatically in local storage.
            </div>
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors shadow-sm text-sm disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{loading ? 'Initializing Session...' : 'Start Mock Interview'}</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
