import pytest
import io
import json
from fastapi.testclient import TestClient
from pypdf import PdfWriter
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
        UPDATE user_profile
        SET name = 'Placement Candidate', target_role = 'Frontend Developer', experience_level = 'Entry Level', updated_at = datetime('now')
        WHERE id = 1
        """)
        cursor.execute("""
        UPDATE settings
        SET ai_endpoint = 'http://127.0.0.1:11434/v1', model_name = 'llama3:8b', use_local_ai = 0, updated_at = datetime('now')
        WHERE id = 1
        """)

@pytest.fixture
def client():
    return TestClient(app)

def test_app_health_and_profile_defaults(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    prof = client.get("/api/profile")
    assert prof.status_code == 200
    assert prof.json()["name"] == "Placement Candidate"

    # Update profile
    update_res = client.put("/api/profile", json={
        "name": "Jane Doe",
        "target_role": "Backend Developer",
        "experience_level": "Entry Level (0-2 yrs)"
    })
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Jane Doe"
    assert update_res.json()["target_role"] == "Backend Developer"

def test_resume_upload_and_scanned_detection(client):
    # 1. Test empty / scanned PDF detection
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    buf = io.BytesIO()
    writer.write(buf)
    blank_pdf = buf.getvalue()

    res = client.post(
        "/api/resume/upload",
        files={"file": ("blank.pdf", blank_pdf, "application/pdf")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_scanned"] is True
    assert "scanned image or contains no selectable text" in data["message"]

    # 2. Test text pasting alternative
    paste_payload = {
        "text": (
            "Jane Doe\n"
            "Backend Developer with experience in Python, FastAPI, Docker, and PostgreSQL.\n"
            "Projects:\n"
            "- E-Commerce API: Built scalable microservice using Redis and FastAPI.\n"
            "Experience:\n"
            "- Software Engineering Intern at Tech Corp (May 2024 - Aug 2024)\n"
        )
    }
    paste_res = client.post("/api/resume/paste", json=paste_payload)
    assert paste_res.status_code == 200
    paste_data = paste_res.json()
    assert "Python" in paste_data["extracted_skills"]
    assert "FastAPI" in paste_data["extracted_skills"]
    assert "Docker" in paste_data["extracted_skills"]
    assert "PostgreSQL" in paste_data["extracted_skills"]
    assert len(paste_data["extracted_projects"]) >= 1

    # 3. Test get resume
    get_res = client.get("/api/resume")
    assert get_res.status_code == 200
    assert "Jane Doe" in get_res.json()["edited_text"]

def test_full_mock_session_refresh_recovery_and_dashboard(client):
    # 1. Start a 5-question Backend Developer session in Basic Practice Mode
    start_res = client.post("/api/interview/start", json={
        "target_role": "Backend Developer",
        "interview_type": "Technical",
        "difficulty": "Intermediate",
        "question_count": 5
    })
    assert start_res.status_code == 200
    session_data = start_res.json()
    session_id = session_data["id"]
    assert session_data["question_count"] == 5
    assert session_data["current_question_index"] == 1
    assert session_data["mode"] == "Basic Practice Mode"

    # 2. Answer question 1
    q1 = session_data["questions"][0]
    submit_res = client.post("/api/interview/submit", json={
        "question_id": q1["id"],
        "user_answer": "REST principles include statelessness, client-server separation, and uniform interfaces. Idempotent methods like GET and PUT produce identical server states on repeated calls."
    })
    assert submit_res.status_code == 200
    sub_data = submit_res.json()
    assert sub_data["session_completed"] is False
    assert sub_data["feedback"]["score"] >= 50
    assert sub_data["feedback"]["feedback_mode"] == "Basic Practice Mode"

    # 3. Test Refresh Recovery: simulate reloading the page mid-interview
    reload_res = client.get(f"/api/interview/{session_id}")
    assert reload_res.status_code == 200
    reload_data = reload_res.json()
    # Should point to question 2 since question 1 was answered
    assert reload_data["current_question_index"] == 2
    assert reload_data["questions"][0]["user_answer"] is not None

    # 4. Skip question 2
    q2 = reload_data["questions"][1]
    skip_res = client.post(f"/api/interview/question/{q2['id']}/skip")
    assert skip_res.status_code == 200
    assert skip_res.json()["next_question_index"] == 3

    # 5. Answer questions 3, 4, 5 to complete session
    for idx in [2, 3, 4]:
        qid = reload_data["questions"][idx]["id"]
        res = client.post("/api/interview/submit", json={
            "question_id": qid,
            "user_answer": "Comprehensive answer explaining architectural trade-offs, caching, indexing, and scalability."
        })
        assert res.status_code == 200

    # 6. Verify session completion
    final_sess = client.get(f"/api/interview/{session_id}").json()
    assert final_sess["status"] == "completed"

    # 7. Check Dashboard Summary reflects real database values
    dash_res = client.get("/api/dashboard/summary")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_sessions"] >= 1
    assert dash_data["completed_sessions"] >= 1
    assert dash_data["total_questions_attempted"] >= 5
    assert dash_data["average_score"] is not None
    assert len(dash_data["score_trend"]) >= 1

    # 8. Check Printable Session Report
    report_res = client.get(f"/api/reports/session/{session_id}")
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert report_data["session_id"] == session_id
    assert len(report_data["questions"]) == 5
    assert report_data["average_score"] > 0

    # 9. Test Deletion of single session
    del_res = client.delete(f"/api/reports/session/{session_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Confirm session is deleted
    assert client.get(f"/api/interview/{session_id}").status_code == 404

    # 10. Test Delete All Local Data
    wipe_res = client.delete("/api/reports/all-data")
    assert wipe_res.status_code == 200
    assert wipe_res.json()["success"] is True
    
    clean_dash = client.get("/api/dashboard/summary").json()
    assert clean_dash["total_sessions"] == 0
    assert clean_dash["completed_sessions"] == 0

def test_local_ai_connection_unavailable_and_graceful_fallback(client):
    # Test connection to an unreachable local port
    test_res = client.post("/api/settings/test-connection", json={
        "ai_endpoint": "http://127.0.0.1:59999/v1",
        "model_name": "test-model"
    })
    assert test_res.status_code == 200
    conn_data = test_res.json()
    assert conn_data["connected"] is False
    assert "Cannot connect" in conn_data["message"] or "timed out" in conn_data["message"]

    # Enable local AI pointing to unavailable port
    client.put("/api/settings", json={
        "ai_endpoint": "http://127.0.0.1:59999/v1",
        "model_name": "non-existent-model",
        "use_local_ai": True
    })

    # Start a session
    sess = client.post("/api/interview/start", json={
        "target_role": "Java Developer",
        "interview_type": "Technical",
        "difficulty": "Beginner",
        "question_count": 5
    }).json()

    # Submit an answer; because port 59999 is down, it must gracefully fall back to Basic Practice Mode
    # and NOT crash with an unhandled exception or 500
    q1 = sess["questions"][0]
    submit_res = client.post("/api/interview/submit", json={
        "question_id": q1["id"],
        "user_answer": "Java memory consists of Heap for object allocations and Stack for thread execution frames."
    })
    assert submit_res.status_code == 200
    sub_data = submit_res.json()
    assert sub_data["feedback"]["score"] >= 40
    # Confirm fallback happened gracefully
    assert "Switched gracefully to Basic Practice Mode" in sub_data["feedback"]["actionable_tips"][0]
