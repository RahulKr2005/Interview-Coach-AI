from fastapi import APIRouter
from typing import Dict, Any, List
from app.database import get_db
from app.schemas import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
@router.get("/summary/", response_model=DashboardSummaryResponse)
@router.get("", response_model=DashboardSummaryResponse)
@router.get("/", response_model=DashboardSummaryResponse)
def get_dashboard_summary():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # User profile
        cursor.execute("SELECT target_role FROM user_profile WHERE id = 1")
        prof = cursor.fetchone()
        target_role = prof["target_role"] if prof else "Frontend Developer"

        # Settings for active mode
        cursor.execute("SELECT use_local_ai FROM settings WHERE id = 1")
        setting = cursor.fetchone()
        active_mode = "Local AI" if (setting and setting["use_local_ai"]) else "Basic Practice Mode"

        # Session counts
        cursor.execute("SELECT COUNT(*) as total FROM interview_sessions")
        total_sessions = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as completed FROM interview_sessions WHERE status = 'completed'")
        completed_sessions = cursor.fetchone()["completed"]

        # Questions attempted
        cursor.execute("""
        SELECT COUNT(*) as attempted
        FROM interview_questions
        WHERE user_answer IS NOT NULL OR skipped = 1
        """)
        total_attempted = cursor.fetchone()["attempted"]

        # Average score across answered questions (excluding skips)
        cursor.execute("""
        SELECT AVG(score) as avg_score
        FROM interview_questions
        WHERE user_answer IS NOT NULL AND score IS NOT NULL
        """)
        avg_score_row = cursor.fetchone()
        avg_score = round(avg_score_row["avg_score"], 1) if (avg_score_row and avg_score_row["avg_score"] is not None) else None

        # Topics needing practice: topics with average score < 70 or skipped > 0
        cursor.execute("""
        SELECT topic, AVG(score) as avg_topic_score, COUNT(*) as count, SUM(skipped) as skipped_count
        FROM interview_questions
        WHERE user_answer IS NOT NULL OR skipped = 1
        GROUP BY topic
        HAVING avg_topic_score < 70 OR skipped_count > 0
        ORDER BY avg_topic_score ASC
        LIMIT 6
        """)
        topics_needing_practice = []
        for r in cursor.fetchall():
            topics_needing_practice.append({
                "topic": r["topic"],
                "avg_score": round(r["avg_topic_score"], 1) if r["avg_topic_score"] is not None else 0,
                "count": r["count"],
                "skipped_count": r["skipped_count"]
            })

        # Recent sessions
        cursor.execute("""
        SELECT s.id, s.target_role, s.interview_type, s.difficulty, s.question_count, s.status, s.mode, s.created_at,
               AVG(q.score) as session_avg_score,
               COUNT(CASE WHEN q.user_answer IS NOT NULL THEN 1 END) as answered_count
        FROM interview_sessions s
        LEFT JOIN interview_questions q ON s.id = q.session_id
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT 5
        """)
        recent_sessions = []
        for s in cursor.fetchall():
            recent_sessions.append({
                "id": s["id"],
                "target_role": s["target_role"],
                "interview_type": s["interview_type"],
                "difficulty": s["difficulty"],
                "question_count": s["question_count"],
                "status": s["status"],
                "mode": s["mode"],
                "created_at": s["created_at"],
                "average_score": round(s["session_avg_score"], 1) if s["session_avg_score"] is not None else None,
                "answered_count": s["answered_count"]
            })

        # Score trend for charts (all completed sessions sorted ascending by date)
        cursor.execute("""
        SELECT s.id, s.created_at, s.target_role, s.difficulty, AVG(q.score) as avg_score
        FROM interview_sessions s
        JOIN interview_questions q ON s.id = q.session_id
        WHERE s.status = 'completed' AND q.score IS NOT NULL
        GROUP BY s.id
        ORDER BY s.created_at ASC
        LIMIT 20
        """)
        score_trend = []
        for idx, row in enumerate(cursor.fetchall()):
            date_label = row["created_at"][:10] if row["created_at"] else f"Session {idx+1}"
            score_trend.append({
                "session_index": idx + 1,
                "date": date_label,
                "role": row["target_role"],
                "score": round(row["avg_score"], 1)
            })

        return {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "total_questions_attempted": total_attempted,
            "average_score": avg_score,
            "practice_streak_days": 1 if total_sessions > 0 else 0,
            "target_role": target_role,
            "active_mode": active_mode,
            "topics_needing_practice": topics_needing_practice,
            "recent_sessions": recent_sessions,
            "score_trend": score_trend
        }
