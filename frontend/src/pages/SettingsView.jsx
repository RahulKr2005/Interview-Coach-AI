import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  Laptop, 
  User, 
  HelpCircle,
  Activity,
  Zap,
  Mic,
  Volume2,
  Terminal
} from 'lucide-react';
import Card from '../components/Card';
import ModeBadge from '../components/ModeBadge';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';

const TARGET_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Java Developer',
  'Data Analyst',
  'DevOps Engineer',
];

const EXPERIENCE_LEVELS = [
  'Student / Fresher',
  'Entry Level (0-2 yrs)',
  'Associate / Mid Level (2-5 yrs)',
];

export default function SettingsView() {
  const { profile, setProfile, reloadProfileAndSettings } = useUser();
  const [profileForm, setProfileForm] = useState({
    name: profile.name || '',
    target_role: profile.target_role || 'Frontend Developer',
    experience_level: profile.experience_level || 'Student / Fresher',
  });

  const [settingsForm, setSettingsForm] = useState({
    ai_endpoint: 'http://127.0.0.1:11434/v1',
    model_name: 'llama3:8b',
    use_local_ai: false,
    stt_endpoint: 'http://127.0.0.1:8080/inference',
    stt_model: 'whisper-base',
    stt_provider_type: 'endpoint',
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testingSTT, setTestingSTT] = useState(false);
  const [sttTestResult, setSttTestResult] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [sData, pData] = await Promise.all([
        api.getSettings(),
        api.getProfile(),
      ]);
      setSettingsForm({
        ai_endpoint: sData.ai_endpoint,
        model_name: sData.model_name,
        use_local_ai: sData.use_local_ai,
        stt_endpoint: sData.stt_endpoint || 'http://127.0.0.1:8080/inference',
        stt_model: sData.stt_model || 'whisper-base',
        stt_provider_type: sData.stt_provider_type || 'endpoint',
      });
      setProfileForm({
        name: pData.name,
        target_role: pData.target_role,
        experience_level: pData.experience_level,
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSTT = async () => {
    try {
      setTestingSTT(true);
      setSttTestResult(null);
      const res = await api.getTranscriptionStatus();
      setSttTestResult(res);
    } catch (err) {
      setSttTestResult({
        status: 'error',
        message: err.message || 'STT readiness check failed',
      });
    } finally {
      setTestingSTT(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await api.updateProfile(profileForm);
      setProfile(updated);
      setNotice({ type: 'success', message: 'Candidate profile updated successfully.' });
      await reloadProfileAndSettings();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await api.updateSettings(settingsForm);
      setNotice({ type: 'success', message: 'Inference and system settings saved successfully.' });
      await reloadProfileAndSettings();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to update settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setTestResult(null);
      const res = await api.testConnection(settingsForm.ai_endpoint, settingsForm.model_name);
      setTestResult(res);
    } catch (err) {
      setTestResult({
        connected: false,
        message: err.message || 'Connection test failed',
        available_models: [],
      });
    } finally {
      setTestingConnection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & AI Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure candidate defaults, local AI inference endpoints, and review device compatibility.
        </p>
      </div>

      {notice && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          notice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Candidate Profile Card */}
      <Card title="Candidate Profile" subtitle="Used to tailor interview questions and session reports">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Placement Role</label>
              <select
                value={profileForm.target_role}
                onChange={(e) => setProfileForm(p => ({ ...p, target_role: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
              <select
                value={profileForm.experience_level}
                onChange={(e) => setProfileForm(p => ({ ...p, experience_level: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </Card>

      {/* Local AI Endpoint Configuration */}
      <Card
        title="Local AI Inference Provider"
        subtitle="Connect any local OpenAI-compatible inference server running on this PC"
      >
        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-teal-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Enable Local AI Inference</h4>
                <p className="text-[11px] text-slate-500">
                  When enabled, answers are evaluated by your local LLM. If disabled or unreachable, the app runs in Basic Practice Mode.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.use_local_ai}
                onChange={(e) => setSettingsForm(s => ({ ...s, use_local_ai: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Local Inference Endpoint URL
              </label>
              <input
                type="text"
                value={settingsForm.ai_endpoint}
                onChange={(e) => setSettingsForm(s => ({ ...s, ai_endpoint: e.target.value }))}
                placeholder="http://127.0.0.1:11434/v1"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Examples: Ollama (`http://127.0.0.1:11434/v1`), LM Studio (`http://127.0.0.1:1234/v1`)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Identifier
              </label>
              <input
                type="text"
                value={settingsForm.model_name}
                onChange={(e) => setSettingsForm(s => ({ ...s, model_name: e.target.value }))}
                placeholder="llama3:8b, mistral, phi3"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Must match an installed model on your local server.
              </span>
            </div>
          </div>

          {/* Test Connection Button & Result Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Connection Health Check</span>
                <p className="text-[11px] text-slate-500">Test if your local inference server is reachable right now</p>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs ${
                testResult.connected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2 font-semibold">
                  {testResult.connected ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.available_models && testResult.available_models.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/60 text-[11px]">
                    <span className="font-semibold block mb-1">Available Models Reported by Server:</span>
                    <div className="flex flex-wrap gap-1">
                      {testResult.available_models.map((m) => (
                        <span key={m} className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-900 font-mono">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </Card>

      {/* Local Speech-to-Text (STT) Provider Card */}
      <Card
        title="Local Speech-to-Text (STT) Provider"
        subtitle="Offline voice transcription for Voice Mock Interviews using whisper.cpp or Python Whisper"
      >
        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-teal-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Offline Speech-to-Text Engine</h4>
                <p className="text-[11px] text-slate-500">
                  Transcribes your spoken answers locally on your PC. Independent of the LLM inference engine.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Private & Local
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Provider Type
              </label>
              <select
                value={settingsForm.stt_provider_type}
                onChange={(e) => setSettingsForm(s => ({ ...s, stt_provider_type: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="endpoint">Local HTTP Server (whisper.cpp)</option>
                <option value="python">Local Python Package (openai-whisper)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                whisper.cpp recommended for Windows on ARM.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                STT Endpoint URL
              </label>
              <input
                type="text"
                value={settingsForm.stt_endpoint}
                onChange={(e) => setSettingsForm(s => ({ ...s, stt_endpoint: e.target.value }))}
                placeholder="http://127.0.0.1:8080/inference"
                disabled={settingsForm.stt_provider_type === 'python'}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Used when Provider Type is Local HTTP Server.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Identifier
              </label>
              <input
                type="text"
                value={settingsForm.stt_model}
                onChange={(e) => setSettingsForm(s => ({ ...s, stt_model: e.target.value }))}
                placeholder="whisper-base or base.en"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                e.g., `whisper-base`, `base`, `tiny`, `small`.
              </span>
            </div>
          </div>

          {/* Test STT Readiness & Setup Helper */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Transcription Engine Status</span>
                <p className="text-[11px] text-slate-500">Verify whether offline transcription is available right now</p>
              </div>
              <button
                type="button"
                onClick={handleTestSTT}
                disabled={testingSTT}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{testingSTT ? 'Checking...' : 'Test Transcription Readiness'}</span>
              </button>
            </div>

            {sttTestResult && (
              <div className={`p-3 rounded-lg border text-xs ${
                sttTestResult.status === 'ready'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : sttTestResult.status === 'not_configured'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2 font-semibold">
                  {sttTestResult.status === 'ready' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : sttTestResult.status === 'not_configured' ? (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{sttTestResult.message}</span>
                </div>
                {sttTestResult.setup_guide && (
                  <div className="mt-2 pt-2 border-t border-amber-200/60 text-[11px] font-mono whitespace-pre-line bg-amber-100/50 p-2 rounded">
                    {sttTestResult.setup_guide}
                  </div>
                )}
                {sttTestResult.status === 'not_configured' && (
                  <p className="mt-2 text-[11px] text-amber-700">
                    💡 <strong>Note:</strong> You can still conduct Voice Mock Interviews! The browser reads questions aloud, and if transcription is offline, you can type or edit your answer directly into the transcript box.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl flex items-start gap-2.5 text-teal-900 text-xs">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Strict Audio Privacy:</span>
              <span className="text-[11px] text-teal-800">
                Spoken audio is received as a transient stream, processed strictly in temporary storage on this PC, and permanently deleted immediately after transcription via an unconditional cleanup block. Raw voice audio is never stored in SQLite or retained on disk.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
