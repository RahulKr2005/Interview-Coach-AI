import json
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.database import get_db

router = APIRouter(prefix="/reports", tags=["Reports & History"])

@router.get("/sessions")
def list_all_sessions():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT s.*, 
               AVG(q.score) as avg_score,
               COUNT(q.id) as total_questions,
               SUM(CASE WHEN q.user_answer IS NOT NULL THEN 1 ELSE 0 END) as answered_count,
               SUM(q.skipped) as skipped_count
        FROM interview_sessions s
        LEFT JOIN interview_questions q ON s.id = q.session_id
        GROUP BY s.id
        ORDER BY s.created_at DESC
        """)
        rows = cursor.fetchall()
        
        sessions = []
        for r in rows:
            sessions.append({
                "id": r["id"],
                "target_role": r["target_role"],
                "interview_type": r["interview_type"],
                "difficulty": r["difficulty"],
                "question_count": r["question_count"],
                "status": r["status"],
                "mode": r["mode"],
                "created_at": r["created_at"],
                "completed_at": r["completed_at"],
                "average_score": round(r["avg_score"], 1) if r["avg_score"] is not None else None,
                "answered_count": r["answered_count"],
                "skipped_count": r["skipped_count"]
            })
        return sessions

@router.get("/session/{session_id}")
def get_session_report(session_id: str) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM interview_sessions WHERE id = ?", (session_id,))
        session = cursor.fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found.")

        cursor.execute("SELECT * FROM user_profile WHERE id = 1")
        user = cursor.fetchone()

        cursor.execute("SELECT * FROM interview_questions WHERE session_id = ? ORDER BY question_index ASC", (session_id,))
        questions_rows = cursor.fetchall()

        questions = []
        scores = []
        for q in questions_rows:
            feedback = json.loads(q["feedback_json"]) if q["feedback_json"] else None
            checklist = json.loads(q["checklist"]) if q["checklist"] else []
            if q["score"] is not None:
                scores.append(q["score"])

            questions.append({
                "question_index": q["question_index"],
                "question_text": q["question_text"],
                "topic": q["topic"],
                "reference_answer": q["reference_answer"],
                "checklist": checklist,
                "user_answer": q["user_answer"],
                "feedback": feedback,
                "score": q["score"],
                "skipped": bool(q["skipped"]),
                "answered_at": q["answered_at"]
            })

        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        return {
            "session_id": session["id"],
            "candidate_name": user["name"] if user else "Candidate",
            "target_role": session["target_role"],
            "interview_type": session["interview_type"],
            "difficulty": session["difficulty"],
            "question_count": session["question_count"],
            "status": session["status"],
            "mode": session["mode"],
            "created_at": session["created_at"],
            "completed_at": session["completed_at"],
            "average_score": avg_score,
            "questions": questions
        }

@router.delete("/session/{session_id}")
def delete_session(session_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM interview_questions WHERE session_id = ?", (session_id,))
        cursor.execute("DELETE FROM interview_sessions WHERE id = ?", (session_id,))
        return {"success": True, "message": f"Session {session_id} deleted successfully."}

@router.delete("/all-data")
def delete_all_user_data():
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
        return {"success": True, "message": "All interview sessions, resume data, and history have been erased locally."}
