import React from 'react';
import { Cpu, BookOpen } from 'lucide-react';

export default function ModeBadge({ mode, size = 'md' }) {
  const isAI = mode === 'Local AI';

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2.5 py-0.5 gap-1.5' 
    : 'text-sm px-3 py-1 gap-2';

  return (
    <div
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeClasses} ${
        isAI
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
          : 'bg-amber-50 text-amber-900 border-amber-300'
      }`}
      title={
        isAI
          ? 'Local AI inference active via localhost endpoint'
          : 'Basic Practice Mode active — Curated technical question bank with reference answers'
      }
    >
      {isAI ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Cpu className="w-3.5 h-3.5 text-emerald-700" />
          <span>Local AI Active</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <span>Basic Practice Mode (AI unavailable)</span>
        </>
      )}
    </div>
  );
}
