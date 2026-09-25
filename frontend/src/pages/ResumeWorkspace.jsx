import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Code, 
  Briefcase, 
  FolderGit2,
  ClipboardPaste,
  ShieldCheck,
  X
} from 'lucide-react';
import Card from '../components/Card';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';

export default function ResumeWorkspace({ setActivePage }) {
  const { reloadProfileAndSettings } = useUser();
  const [resumeData, setResumeData] = useState({
    raw_text: '',
    edited_text: '',
    extracted_skills: [],
    extracted_projects: [],
    extracted_experience: [],
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null); // { type: 'success' | 'warning' | 'error', message: '' }
  const [pasteText, setPasteText] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste' | 'editor'
  const [newSkillInput, setNewSkillInput] = useState('');

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      setLoading(true);
      const data = await api.getResume();
      setResumeData(data);
      if (data.edited_text) {
        setActiveTab('editor');
      }
    } catch (err) {
      console.error('Failed to load resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setNotice({
        type: 'error',
        message: 'Invalid file format. Please upload a standard PDF (.pdf) file.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice({
        type: 'error',
        message: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB). Please choose a smaller PDF.`,
      });
      return;
    }

    try {
      setUploading(true);
      setNotice(null);
      const res = await api.uploadResumePdf(file);
      
      setResumeData({
        raw_text: res.raw_text,
        edited_text: res.edited_text,
        extracted_skills: res.extracted_skills || [],
        extracted_projects: res.extracted_projects || [],
        extracted_experience: res.extracted_experience || [],
      });

      if (res.is_scanned) {
        setNotice({
          type: 'warning',
          message: res.message,
        });
        setActiveTab('paste');
      } else {
        setNotice({
          type: 'success',
          message: 'Resume parsed successfully! You can review and refine the extracted skills below.',
        });
        setActiveTab('editor');
      }
    } catch (err) {
      setNotice({
        type: 'error',
        message: err.message || 'Failed to upload and parse PDF.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) {
      setNotice({ type: 'error', message: 'Please paste resume content before submitting.' });
      return;
    }

    try {
      setUploading(true);
      setNotice(null);
      const res = await api.pasteResumeText(pasteText);
      setResumeData({
        raw_text: res.raw_text,
        edited_text: res.edited_text,
        extracted_skills: res.extracted_skills || [],
        extracted_projects: res.extracted_projects || [],
        extracted_experience: res.extracted_experience || [],
      });
      setNotice({
        type: 'success',
        message: 'Resume text processed! Verify your detected skills and projects below.',
      });
      setActiveTab('editor');
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to process pasted text.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdits = async () => {
    try {
      setSaving(true);
      const updated = await api.updateResume({
        edited_text: resumeData.edited_text,
        extracted_skills: resumeData.extracted_skills,
        extracted_projects: resumeData.extracted_projects,
        extracted_experience: resumeData.extracted_experience,
      });
      setResumeData(updated);
      setNotice({
        type: 'success',
        message: 'Resume changes saved successfully to your local SQLite database.',
      });
      await reloadProfileAndSettings();
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !resumeData.extracted_skills.includes(trimmed)) {
      setResumeData(prev => ({
        ...prev,
        extracted_skills: [...prev.extracted_skills, trimmed]
      }));
      setNewSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setResumeData(prev => ({
      ...prev,
      extracted_skills: prev.extracted_skills.filter(s => s !== skillToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload or paste your resume. We extract skills and project context locally to tailor practice questions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Local Processing & Storage</span>
          </div>
        </div>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : notice.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{notice.message}</div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload PDF</span>
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'paste'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          <span>Paste Text Directly</span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'editor'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Extracted Resume & Skills {resumeData.extracted_skills?.length > 0 && `(${resumeData.extracted_skills.length})`}</span>
        </button>
      </div>

      {/* Tab: Upload PDF */}
      {activeTab === 'upload' && (
        <Card>
          <div className="text-center py-10 px-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">Upload your Placement Resume</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Select a PDF document (under 5MB). Text is extracted directly on your PC using lightweight Python libraries.
            </p>

            <label className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium cursor-pointer transition-colors shadow-sm text-sm">
              <FileText className="w-4 h-4" />
              <span>{uploading ? 'Extracting Text...' : 'Select PDF Resume'}</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleFileUpload}
              />
            </label>

            <p className="text-xs text-slate-400 mt-4">
              Scanned / image-only PDFs without text layers cannot be extracted offline. If your PDF is scanned, switch to the "Paste Text Directly" tab.
            </p>
          </div>
        </Card>
      )}

      {/* Tab: Paste Text Directly */}
      {activeTab === 'paste' && (
        <Card title="Paste Resume Text" subtitle="Alternative for scanned documents or quick copy-paste">
          <div className="space-y-4">
            <textarea
              rows={12}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste the plain text of your resume here (Summary, Skills, Education, Projects, Experience)..."
              className="w-full p-4 rounded-xl border border-slate-300 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <div className="flex justify-end">
              <button
                onClick={handlePasteSubmit}
                disabled={uploading || !pasteText.trim()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {uploading ? 'Processing...' : 'Parse & Extract Skills'}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Extracted Text & Skills Editor */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Text Editor (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              title="Resume Content (Editable)"
              subtitle="Verify or modify your extracted resume text before mock interview generation"
              action={
                <button
                  onClick={handleSaveEdits}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              }
            >
              <textarea
                rows={16}
                value={resumeData.edited_text}
                onChange={(e) => setResumeData(prev => ({ ...prev, edited_text: e.target.value }))}
                placeholder="No resume content loaded yet. Please upload a PDF or paste resume text."
                className="w-full p-4 rounded-xl border border-slate-200 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
              />
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{resumeData.edited_text ? `${resumeData.edited_text.length} characters` : '0 characters'}</span>
                <span className="text-slate-400">Untrusted Input: Treated as factual text, never executed as code.</span>
              </div>
            </Card>
          </div>

          {/* Extracted Metadata (1 Col) */}
          <div className="space-y-6">
            {/* Skills Badges */}
            <Card title="Detected Skills" subtitle="Extracted using deterministic tech keywords">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                  {resumeData.extracted_skills && resumeData.extracted_skills.length > 0 ? (
                    resumeData.extracted_skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200"
                      >
                        <Code className="w-3 h-3 text-teal-600" />
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-600 ml-0.5"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No skills detected yet.</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Add manual skill..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={addSkill}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </Card>

            {/* Extracted Projects */}
            <Card title="Detected Projects" subtitle="Extracted section highlights">
              {resumeData.extracted_projects && resumeData.extracted_projects.length > 0 ? (
                <div className="space-y-2">
                  {resumeData.extracted_projects.map((proj, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                      <FolderGit2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{proj}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No project section patterns detected.</p>
              )}
            </Card>

            {/* Extracted Experience */}
            <Card title="Detected Experience" subtitle="Extracted employment or internships">
              {resumeData.extracted_experience && resumeData.extracted_experience.length > 0 ? (
                <div className="space-y-2">
                  {resumeData.extracted_experience.map((exp, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{exp}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No experience section patterns detected.</p>
              )}
            </Card>

            {/* Ready to Practice CTA */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-teal-700 to-slate-900 text-white shadow-sm">
              <h4 className="font-semibold text-sm">Resume Ready!</h4>
              <p className="text-xs text-teal-100 mt-1 mb-4">
                Now launch a mock interview session tailored to your role and target skills.
              </p>
              <button
                onClick={() => setActivePage('start')}
                className="w-full py-2 bg-teal-400 hover:bg-teal-300 text-slate-900 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Go to Interview Setup →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
