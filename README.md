# InterviewCoach AI

> **Private, offline-first placement interview preparation assistant** designed for local execution and aligned for **Snapdragon-powered HP PCs** running Windows on ARM.

InterviewCoach AI allows college students and job seekers to upload a resume, practice role-based technical and behavioral mock interviews, receive comprehensive feedback, and track preparation progress—all running 100% locally on their own PC.

---

## Key Features

1. **Local Candidate Profile**: Configure your target placement role and experience level. Supported roles:
   - Frontend Developer
   - Backend Developer
   - Full Stack Developer
   - Java Developer
   - Data Analyst
   - DevOps Engineer
2. **Resume Workspace**:
   - Upload PDF resumes (under 5MB) with pure-Python extraction (`pypdf`).
   - Scanned PDF detection with clear explanation and a paste-text fallback.
   - Deterministic keyword extraction for skills, projects, and work experience.
   - Interactive editor to refine extracted resume content before question generation.
   - Strict untrusted input handling: resumes are evaluated as factual text, never executed as code.
3. **Mock Interview Engine**:
   - Technical, HR, and Resume-Based interview sessions.
   - 3 Difficulty levels: Beginner, Intermediate, Advanced.
   - Session sizes: 5, 10, or 15 questions.
   - One question at a time with answer textbox, submit, skip, progress bar, and early exit.
   - **Refresh Resilience**: An accidental browser reload preserves your exact question index and recorded answers.
4. **Dual-Mode Inference**:
   - **Basic Practice Mode (Offline Default)**: Works out of the box with zero external AI models installed. Over 70+ curated technical questions across 6 roles and 15 HR questions with reference model answers and self-review rubric checklists.
   - **Local AI Mode**: Seamlessly connects to any local OpenAI-compatible inference server (such as Ollama, LM Studio, or llama.cpp) running on `localhost`.
5. **Voice Mock Interview Mode**:
   - **Question Read-Aloud**: Browser `speechSynthesis` speaks questions aloud (Play, Stop, Replay) prioritizing installed local English voices.
   - **Microphone Capture**: In-browser audio recording (`getUserMedia` + `MediaRecorder`) with automatic codec detection (`audio/webm;codecs=opus`, `audio/mp4`, `audio/wav`), live elapsed timer (up to 3:00 max), and Cancel / Stop controls.
   - **Audio Track Hygiene**: Microphone tracks are strictly terminated upon completion, cancellation, navigation, or errors to avoid persistent browser recording locks.
   - **Local Speech-to-Text (STT)**: Integration with local Whisper servers (e.g. `whisper.cpp`) or local Python Whisper with 25MB validation.
   - **Strict Privacy**: Spoken audio is held temporarily only for transcription and is unconditionally deleted in a `try...finally: os.remove(...)` block. Zero raw audio is stored on disk or in SQLite.
   - **Human-in-the-Loop Review**: Transcripts are automatically loaded into an editable answer field so candidates can review, correct, or refine their thoughts before submitting.
   - **Honest Fallback**: When STT is offline, clear setup instructions are shown and candidates can continue practicing immediately by typing.
6. **Results & Analytics Dashboard**:
   - Visual score trend chart powered by locally bundled Recharts.
   - Real-time focus area detection: highlights topics scored below 70% or frequently skipped.
   - Printable session report (`window.print()` / Save as PDF).
   - Data privacy: single session deletion and a nuclear "Delete All Local Data" action.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic v2.
- **Database**: SQLite (standard library, zero binary dependencies).
- **PDF Extraction**: `pypdf 4.x` (100% pure Python, avoiding native C++ build hurdles on ARM64).
- **Inference Adapter**: Configurable localhost OpenAI-compatible HTTP client (`httpx`).

---

## Quick Start & Go Live (1-Click Run)

### Option 1: 1-Click Go Live Launcher (Recommended)
Simply double-click the **`go_live.bat`** file in the project folder, or run in PowerShell:
```powershell
.\go_live.bat
# or: .\go_live.ps1
```
*This starts the FastAPI backend and frontend automatically, and opens the live application directly in your browser!*

### Option 2: VS Code "Go Live" Extension (Live Server)
1. Open this project in VS Code.
2. Click the **"Go Live"** button in the bottom status bar (port 5500).
3. The **InterviewCoach AI Live Portal** will open in your browser with real-time service monitors and instant access to the application and API docs.

### Option 3: Single-Server Standalone Mode (Python Only)
FastAPI directly serves the built React frontend on port 8000:
```powershell
.\venv\Scripts\Activate.ps1
python backend\app\main.py
```
*Open `http://127.0.0.1:8000` in any browser!*

---

### Option 4: Manual Two-Terminal Setup (For Developers)

#### Prerequisites
- **Python 3.11+** installed (check with `python --version`).
- **Node.js 18+** installed (check with `node --version`).

---

### Step 1: Backend Setup
Open a Windows PowerShell terminal in the project directory:

```powershell
# 1. Navigate to project root
cd "c:\Users\Dell\OneDrive\Documents\InterviewCoach AI"

# 2. Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Upgrade pip and install backend dependencies
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

# 4. Start the FastAPI backend on 127.0.0.1:8000
python backend\app\main.py
```
*The backend is now live at `http://127.0.0.1:8000` (API docs at `http://127.0.0.1:8000/docs`).*

---

### Step 2: Frontend Setup
Open a **second** Windows PowerShell terminal in the project directory:

```powershell
# 1. Navigate to the frontend directory
cd "c:\Users\Dell\OneDrive\Documents\InterviewCoach AI\frontend"

# 2. Install frontend dependencies
npm install

# 3. Launch the development server
npm run dev
```
*Open your browser and navigate to `http://127.0.0.1:5173` to start practicing!*

---

## Running Verification Tests

To run the automated backend test suite (question quotas, PDF extraction, interview state engine):
```powershell
.\venv\Scripts\pytest -v
```

To run the frontend production build verification:
```powershell
cd frontend
npm run build
```

---

## Offline & Privacy Guarantees

- **No Remote Calls**: The frontend bundles all styles, SVGs, and chart scripts locally. No external fonts, Google CDNs, or tracking telemetry are loaded.
- **Localhost Only**: The backend binds strictly to `127.0.0.1` and CORS is restricted to local browser ports (`5173`).
- **Disk Storage**: Resume data and interview history are saved locally inside `backend/data/interviewcoach.db`. Notice: Local SQLite storage is stored in plaintext on disk and is not encrypted by default; you can delete individual sessions or wipe all stored data at any time from the History page.

---

## Additional Documentation

- [System Architecture](file:///docs/ARCHITECTURE.md)
- [Local AI Setup Guide (Ollama & LM Studio)](file:///docs/LOCAL_AI_SETUP.md)
- [Snapdragon-Powered HP PC Compatibility & Optimization](file:///docs/SNAPDRAGON_COMPATIBILITY.md)
- [Hardware & Inference Benchmark Template](file:///docs/BENCHMARK_TEMPLATE.md)
