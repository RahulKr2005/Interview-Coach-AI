# InterviewCoach AI — System Architecture

## Overview
InterviewCoach AI is a private, offline-first placement interview preparation assistant architected for local execution on Windows laptops, with specific optimizations and considerations for Snapdragon-powered HP PCs.

## Core System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Local Browser (User)                           │
│  http://127.0.0.1:5173                                                 │
│                                                                        │
│  React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts             │
│  ├── Local font stack (zero external Google fonts or CDN assets)      │
│  ├── Client state & localStorage sync (refresh resilience)            │
│  └── Accessible UI with high contrast and responsive layouts           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON over HTTP (localhost only)
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Python FastAPI Backend (Port 8000)                  │
│  Bound strictly to 127.0.0.1                                           │
│                                                                        │
│  ├── Routers:                                                          │
│  │   ├── /api/profile    - User profile & target role preferences     │
│  │   ├── /api/resume     - PDF extraction & skill heuristics          │
│  │   ├── /api/interview  - Session lifecycle, evaluation & skip       │
│  │   ├── /api/dashboard  - Metrics, progress chart data & weak topics │
│  │   ├── /api/settings   - Local AI endpoint configuration & checks   │
│  │   └── /api/reports    - Printable session reports & local wipe     │
│  │                                                                     │
│  ├── Services Layer:                                                   │
│  │   ├── PDF Service: pure-Python pypdf text extraction & heuristics   │
│  │   ├── Interview Service: session state engine & refresh recovery   │
│  │   └── AI Service:                                                   │
│  │       ├── BaseInferenceProvider (Interface)                        │
│  │       ├── LocalAIProvider (OpenAI-compatible HTTP adapter)          │
│  │       └── BasicPracticeProvider (Curated question bank + rubrics)   │
│  │                                                                     │
│  └── Data Layer:                                                       │
│      └── SQLite (interviewcoach.db) - Local disk persistence           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Optional HTTP (localhost only)
┌───────────────────────────────────▼────────────────────────────────────┐
│            Local Inference Provider (Optional User-Supplied)           │
│  (e.g., Ollama, LM Studio, llama.cpp on localhost:11434 / 1234)         │
│  * Future Snapdragon NPU: ONNX Runtime GenAI with Qualcomm QNN        │
└────────────────────────────────────────────────────────────────────────┘
```

## Security & Privacy Model
1. **Zero Data Telemetry**: No resumes, answers, or performance scores are transmitted to external cloud endpoints.
2. **Localhost Binding**: All backend endpoints are bound to `127.0.0.1` and CORS is restricted exclusively to local origins.
3. **Untrusted Input Sanitation**: Candidate answers and extracted resume text are treated as untrusted data, never as system execution instructions.
4. **Transparent Storage**: Candidate data is stored in standard SQLite (`backend/data/interviewcoach.db`). Users are clearly informed that data on disk is not encrypted by default and can be wiped instantly with the "Delete All Local Data" button.

## Dual-Mode Operation
- **Basic Practice Mode**: Fully autonomous out-of-the-box mode with 70+ curated technical questions across 6 roles plus 15 HR/behavioral questions, reference answers, and self-review rubrics. Works with 0 models installed.
- **Local AI Mode**: Connects to any local server supporting OpenAI-compatible `/v1/chat/completions` API (Ollama, LM Studio, etc.) for automated scoring, strength analysis, and actionable coaching tips.
