# InterviewCoach AI

> **Placement Interview Preparation & Practice Platform**  
> Built with the **MERN Stack** (MongoDB, Express, React, Node.js) for high performance, private local execution, and lightweight operation on standard laptops (including 4 GB RAM systems).

InterviewCoach AI allows college students and placement candidates to upload resumes, practice text and voice mock interviews across technical and behavioral domains, receive comprehensive rubric feedback with reference answers, and track progress over time.

---

## Key Features

1. **User Authentication & Profile Isolation**:
   - Secure registration and login with bcrypt password hashing (salt rounds: 10).
   - JWT tokens transmitted via secure `HttpOnly` cookies and `Authorization: Bearer` headers.
   - Strict data ownership: candidates only access their own resumes, interview sessions, and metrics.
2. **Resume Workspace**:
   - Pure-JS PDF text parsing via `pdf-parse` (supports files under 5MB).
   - Scanned PDF detection heuristic with actionable warning and manual text-paste fallback.
   - Deterministic keyword extraction for technical skills (React, Node.js, Express, MongoDB, Java, Python, Docker, etc.).
   - Interactive editor to review and update extracted skills before question generation.
3. **Curated Placement Question Bank**:
   - Role-specific questions tailored for:
     - **MERN Stack Developer** (React hooks, Express middleware, MongoDB aggregations, JWT cookies, Node Event Loop)
     - **Frontend Developer** (Real DOM vs Virtual DOM, Event Loop, CSS architecture, Core Web Vitals)
     - **Backend Developer** (Database indexing, API security, caching strategies, concurrency)
     - **Java / DSA** (JVM architecture, Spring Boot, Big-O complexities, data structures)
     - **DevOps Engineer** (Docker containerization, CI/CD, Kubernetes, Linux, IaC)
     - **Full Stack Developer** & **Data Analyst**
     - **HR & Behavioral** (STAR method, teamwork, conflict resolution, technical growth)
   - 3 Difficulty levels: Beginner, Intermediate, Advanced.
4. **Dual Inference Mode**:
   - **Basic Practice Mode (Offline Default)**: 100% offline with zero external model dependencies. Questions evaluated with deterministic rubric checklists, strengths, missing points, and model placement answers (`is_ai_generated: false`).
   - **Local AI Provider**: Connects to local Ollama (`http://127.0.0.1:11434`) or local OpenAI-compatible endpoints when enabled.
5. **Voice Mock Interview Mode**:
   - **Question Read-Aloud**: Browser `speechSynthesis` speaks questions aloud with Play, Stop, and Replay controls.
   - **Native Web Speech Recognition**: Transcribes spoken answers directly in the browser (`SpeechRecognition` / `webkitSpeechRecognition`) with real-time text feedback and zero backend latency.
   - **Human-in-the-Loop Review**: Spoken text is loaded into an editable answer field so candidates can review, correct, and edit before submitting.
6. **Analytics & Performance Dashboard**:
   - Real-time score trends powered by Recharts.
   - Focus Areas identification (topics scored below 70% or skipped).
   - Clean empty state for brand new users (zero fabricated statistics).
   - Printable official practice report (`window.print()` / Save as PDF).

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Node.js (ES Modules), Express.js |
| **Database** | MongoDB with Mongoose (with automatic in-memory fallback for local zero-setup dev) |
| **Auth** | JWT with HttpOnly cookies + bcryptjs password hashing |
| **PDF Extraction**| `pdf-parse` (pure JavaScript, lightweight and fast) |
| **Testing** | Custom automated integration test runner (`server/tests/mern.test.js`) |

*(Note: The active application runs entirely on the MERN stack. Legacy user database history is preserved in backend/data/ and virtual environment in venv/).*

---

## Quick Start & Running Locally

### Option 1: 1-Click Windows Launcher (Recommended)
Double-click **`start_app.bat`** (or **`start_mern.bat`**) in the project folder, or run:
```powershell
.\start_app.bat
```
This automatically verifies dependencies, starts the Node.js Express server on port 5000, and opens `http://127.0.0.1:5000` in your default browser.

---

### Option 2: Manual Setup

#### Step 1: Start Backend Server
```powershell
cd "server"
npm install
node src/server.js
```
The server will start listening at `http://127.0.0.1:5000`.

#### Step 2: Build or Run Frontend
```powershell
cd "frontend"
npm install
npm run build
```
Once built, the Express server on port 5000 serves `frontend/dist/` directly at `http://127.0.0.1:5000/`.

If you prefer hot-reloading dev mode:
```powershell
npm run dev
```
Access the Vite dev server at `http://127.0.0.1:5173/` (requests to `/api` proxy automatically to `http://127.0.0.1:5000`).

---

### Option 3: VS Code "Go Live" (Live Server)
1. Start the Express backend on port 5000 (`node server/src/server.js` or `.\start_app.bat`).
2. Click **Go Live** in VS Code (or open `index.html` via Live Server on port 5500).
3. The root `index.html` redirects automatically to `frontend/dist/index.html`. Dual-mode authentication (HttpOnly cookies + localStorage Bearer tokens) enables full Sign In, Resume Upload, and Mock Interview capabilities seamlessly across dev ports.

---

## Database Configuration (MongoDB)

The server connects to MongoDB via `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/interviewcoach
JWT_SECRET=super-secret-mern-jwt-key-for-interviewcoach
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### Starting Local MongoDB
- On Windows: Start the service via command prompt:
  ```cmd
  net start MongoDB
  ```
- Or connect to MongoDB Atlas by providing your Atlas connection string in `server/.env`:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/interviewcoach?retryWrites=true&w=majority
  ```

### Resilient In-Memory Fallback
If MongoDB is not installed or running, the server detects this gracefully, logs actionable setup instructions, and activates an in-memory store so you can test authentication, resume uploads, mock interviews, and dashboard analytics with zero crashes.

### Google Gemini AI & Demo Mode
- When `GEMINI_API_KEY` is provided, live AI answer evaluation and resume improvement suggestions are performed via Google Gemini (`gemini-1.5-flash`).
- When no key is provided, the platform automatically runs in **Demo Mode: Placement Practice Rubric**, providing deterministic placement scoring and recommendations with zero external network dependencies.
- **User Consent**: Resume analysis requires explicit user consent via an interactive confirmation modal before sending resume content to Gemini.

---

## Running Verification Tests

Run the comprehensive integration test suite:
```powershell
cd "server"
node tests/mern.test.js
```
This verifies 19 distinct behaviors:
1. API Health Check
2. User A Registration & Password Hashing
3. User A Login & Cookie Generation
4. Session Persistence (`/api/auth/me`)
5. Pure-JS Resume Text Processing & Skill Extraction
6. Interview Session Initialization (MERN Stack, 3 Questions)
7. Answer Submission & Rubric Evaluation
8. User B Registration
9. **Data Ownership Isolation** (`403 Forbidden` when User B accesses User A's session)
10. Dashboard Metrics Accuracy (User A)
11. Dashboard Empty State for New User B (Zero Fabricated Stats)
12. User A Logout
13. Resume Update via `PUT /api/resume`
14. **Resume Suggestions Consent Validation** (400 when consent is missing)
15. **Resume Suggestions Generation** (actionable advice for target placement role)
16. **Separate Question Evaluation Endpoint** (`/api/interview/question/:id/evaluate`)
17. **Delete Resume** (`DELETE /api/resume`)
18. **Settings Endpoint with Gemini / Demo Mode Status**
19. Static Production Frontend Delivery at `http://127.0.0.1:5000/`

---

## Privacy & Security

- **HttpOnly Cookies**: Prevents client-side scripts from reading authentication tokens (protects against XSS token theft).
- **Transient Audio Processing**: Voice mock interviews transcribe directly in the browser via the Web Speech API with zero audio saved to disk.
- **Strict Data Isolation**: Queries and mutations strictly enforce `userId` checks on all MongoDB documents.
