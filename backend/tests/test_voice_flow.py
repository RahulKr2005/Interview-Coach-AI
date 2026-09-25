import pytest
import io
import os
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, get_db

@pytest.fixture(autouse=True)
def clean_db():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM interview_questions")
        cursor.execute("DELETE FROM interview_sessions")
        cursor.execute("DELETE FROM resume_data")
        cursor.execute("""
        UPDATE settings
        SET ai_endpoint = 'http://127.0.0.1:11434/v1', model_name = 'llama3:8b', use_local_ai = 0,
            stt_endpoint = 'http://127.0.0.1:8080/inference', stt_model = 'whisper-base', stt_provider_type = 'endpoint',
            updated_at = datetime('now')
        WHERE id = 1
        """)

@pytest.fixture
def client():
    return TestClient(app)

def test_voice_session_creation(client):
    """Test creating an interview session explicitly in voice mode."""
    res = client.post("/api/interview/start", json={
        "target_role": "Frontend Developer",
        "interview_type": "Technical",
        "difficulty": "Beginner",
        "question_count": 5,
        "input_mode": "voice"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["input_mode"] == "voice"
    session_id = data["id"]

    # Verify session detail preserves input_mode
    detail_res = client.get(f"/api/interview/{session_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["input_mode"] == "voice"

def test_default_text_session_creation(client):
    """Test creating an interview session in standard text mode."""
    res = client.post("/api/interview/start", json={
        "target_role": "Backend Developer",
        "interview_type": "Technical",
        "difficulty": "Intermediate",
        "question_count": 5,
        "input_mode": "text"
    })
    assert res.status_code == 200
    assert res.json()["input_mode"] == "text"

def test_transcription_status_endpoint(client):
    """Test the transcription readiness status endpoint."""
    res = client.get("/api/settings/transcription-status")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert data["status"] in ["ready", "not_configured", "error"]
    assert "provider" in data
    assert "message" in data

def test_transcribe_audio_safe_temporary_file_cleanup(client):
    """
    Test uploading an audio file for transcription and verify that
    temporary audio files are unconditionally deleted after processing.
    """
    # Sample minimal webm payload
    fake_audio = b"\x1a\x45\xdf\xa3" + b"mock audio content data" * 20
    audio_file = io.BytesIO(fake_audio)

    res = client.post(
        "/api/interview/transcribe",
        files={"file": ("test_answer.webm", audio_file, "audio/webm")}
    )

    # Response should be 200 (either transcribed or not_configured fallback)
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "transcript" in data

    # Verify no leaked temporary audio files remain in backend/temp_audio or temp dir
    temp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "temp_audio")
    if os.path.exists(temp_dir):
        files_left = os.listdir(temp_dir)
        test_files = [f for f in files_left if f.startswith("audio_") or f.endswith(".webm")]
        assert len(test_files) == 0, f"Temporary audio files were leaked: {test_files}"

def test_transcribe_audio_mime_type_validation(client):
    """Test rejecting files that are not valid audio MIME types."""
    fake_pdf = b"%PDF-1.4 dummy pdf content"
    pdf_file = io.BytesIO(fake_pdf)

    res = client.post(
        "/api/interview/transcribe",
        files={"file": ("document.pdf", pdf_file, "application/pdf")}
    )
    assert res.status_code == 400
    assert "Unsupported audio format" in res.json()["detail"]

def test_transcribe_audio_size_limit(client):
    """Test rejecting audio files larger than 25MB."""
    oversized_data = b"0" * (26 * 1024 * 1024)
    big_file = io.BytesIO(oversized_data)

    res = client.post(
        "/api/interview/transcribe",
        files={"file": ("huge_recording.webm", big_file, "audio/webm")}
    )
    assert res.status_code == 400
    assert "exceeds maximum size limit of 25MB" in res.json()["detail"]

def test_voice_interview_submit_confirmed_transcript(client):
    """
    Test the human-in-the-loop flow: start in voice mode, confirm transcript,
    and submit to the evaluation pipeline. Verify feedback is saved and no audio is retained.
    """
    # 1. Start voice session
    start_res = client.post("/api/interview/start", json={
        "target_role": "Frontend Developer",
        "interview_type": "Technical",
        "difficulty": "Beginner",
        "question_count": 5,
        "input_mode": "voice"
    })
    assert start_res.status_code == 200
    session = start_res.json()
    q1 = session["questions"][0]

    # 2. Submit confirmed transcript as answer
    user_transcript = (
        "The Virtual DOM is an in-memory tree representation of real DOM elements. "
        "React computes differences using diffing and batched updates to optimize re-renders."
    )
    submit_res = client.post("/api/interview/submit", json={
        "question_id": q1["id"],
        "user_answer": user_transcript
    })
    assert submit_res.status_code == 200
    submit_data = submit_res.json()
    assert submit_data["feedback"]["score"] >= 40
    assert submit_data["next_question_index"] == 2

    # 3. Verify in database: user_answer stores the confirmed transcript text, no audio
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_answer FROM interview_questions WHERE id = ?", (q1["id"],))
        row = cursor.fetchone()
        assert row["user_answer"] == user_transcript
