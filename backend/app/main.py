import sys
from pathlib import Path

# Ensure backend root is always on sys.path
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from app.config import CORS_ORIGINS, BACKEND_HOST, BACKEND_PORT
from app.database import init_db, get_db
from app.routers import profile, resume, interview, dashboard, settings, reports

# Initialize database tables on startup
init_db()

app = FastAPI(
    title="InterviewCoach AI API",
    description="Offline-first placement interview coaching assistant backend",
    version="1.0.0"
)

# Restrict CORS to local frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(profile.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.get("/api/health")
def health_check():
    db_ok = True
    db_detail = "connected"
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
    except Exception as e:
        db_ok = False
        db_detail = str(e)

    frontend_built = (frontend_dist / "index.html").exists()

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "InterviewCoach AI Backend",
        "version": "1.0.0",
        "database": db_detail,
        "storage": "Local SQLite",
        "frontend_built": frontend_built,
        "host": BACKEND_HOST,
        "port": BACKEND_PORT
    }

# Standalone Live Mode: Serve frontend static build directly on port 8000
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
assets_dir = frontend_dist / "assets"
assets_dir.mkdir(parents=True, exist_ok=True)
app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/")
async def serve_root():
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return HTMLResponse(
        "<html><head><title>InterviewCoach AI</title></head>"
        "<body style='font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#f8fafc;padding:40px;line-height:1.6;'>"
        "<div style='max-width:600px;margin:auto;background:#1e293b;padding:30px;border-radius:12px;border:1px solid #334155;'>"
        "<h2 style='color:#38bdf8;margin-bottom:12px;'>InterviewCoach AI Backend is Live!</h2>"
        "<p>The backend is running, but the frontend production build was not found in <code>frontend/dist</code>.</p>"
        "<p>To build the frontend, run: <br><code style='background:#0f172a;padding:4px 8px;border-radius:4px;color:#34d399;'>npm run build</code> in the <code>frontend</code> folder, or run <code>go_live.bat</code>.</p>"
        "<p style='margin-top:20px;'><a href='/docs' style='color:#38bdf8;'>Backend API Docs (Swagger) &rarr;</a></p>"
        "</div></body></html>"
    )

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Allow internal docs and openapi routes
    if full_path in ["docs", "redoc", "openapi.json"] or full_path.startswith("docs/") or full_path.startswith("api/") or full_path == "api":
        raise HTTPException(status_code=404, detail="Route not found")
    file_target = frontend_dist / full_path
    if file_target.exists() and file_target.is_file():
        return FileResponse(file_target)
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Page not found")

if __name__ == "__main__":
    import uvicorn
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    reload = "--reload" in sys.argv
    uvicorn.run("app.main:app", host=BACKEND_HOST, port=BACKEND_PORT, reload=reload)

