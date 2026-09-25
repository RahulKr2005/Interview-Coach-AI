import React from 'react';
import { Sparkles, Cpu, BookOpen } from 'lucide-react';

export default function ModeBadge({ mode = '', size = 'md' }) {
  const isGemini = mode.includes('Gemini');
  const isLocalAI = mode === 'Local AI';
  const isAI = isGemini || isLocalAI;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2.5 py-0.5 gap-1.5' 
    : 'text-sm px-3 py-1 gap-2';

  if (isGemini) {
    return (
      <div
        className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeClasses} bg-teal-50 text-teal-800 border-teal-300 shadow-xs`}
        title={`Live Google Gemini Evaluation (${mode})`}
      >
        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
        <span>{mode || 'Google Gemini AI'}</span>
      </div>
    );
  }

  if (isLocalAI) {
    return (
      <div
        className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeClasses} bg-emerald-50 text-emerald-800 border-emerald-300`}
        title="Local LLM Inference Active"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <Cpu className="w-3.5 h-3.5 text-emerald-700" />
        <span>Local AI Active</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeClasses} bg-amber-50 text-amber-900 border-amber-300`}
      title="Placement Practice Rubric Mode — Curated technical questions, checklists, and reference answers"
    >
      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
      <span>Demo Mode: Practice Rubric</span>
    </div>
  );
}

