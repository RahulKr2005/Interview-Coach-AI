import uuid
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.database import get_db
from app.question_bank import get_questions_for_session
from app.services.ai_service import LocalAIProvider, BasicPracticeProvider

class InterviewService:
    @staticmethod
    def create_session(target_role: str, interview_type: str, difficulty: str, question_count: int, input_mode: str = "text") -> Dict[str, Any]:
        session_id = str(uuid.uuid4())
        
        # Check active settings to see if local AI is enabled
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ai_endpoint, model_name, use_local_ai FROM settings WHERE id = 1")
            setting_row = cursor.fetchone()
            
            use_ai = bool(setting_row["use_local_ai"]) if setting_row else False
            mode = "Local AI" if use_ai else "Basic Practice Mode"

            # Create session record
            cursor.execute("""
            INSERT INTO interview_sessions (id, target_role, interview_type, difficulty, question_count, status, mode, input_mode, created_at)
            VALUES (?, ?, ?, ?, ?, 'in_progress', ?, ?, datetime('now'))
            """, (session_id, target_role, interview_type, difficulty, question_count, mode, input_mode))

            # Fetch questions from question bank
            questions = get_questions_for_session(target_role, interview_type, difficulty, question_count)

            # Insert question rows
            for idx, q in enumerate(questions):
                cursor.execute("""
                INSERT INTO interview_questions (
                    session_id, question_index, question_text, topic, reference_answer, checklist, skipped
                ) VALUES (?, ?, ?, ?, ?, ?, 0)
                """, (
                    session_id,
                    idx + 1,
                    q["question"],
                    q["topic"],
                    q["reference_answer"],
                    json.dumps(q["checklist"])
                ))

        return InterviewService.get_session_detail(session_id)

    @staticmethod
    def get_session_detail(session_id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM interview_sessions WHERE id = ?", (session_id,))
            session_row = cursor.fetchone()
            if not session_row:
                return None

            cursor.execute("SELECT * FROM interview_questions WHERE session_id = ? ORDER BY question_index ASC", (session_id,))
            question_rows = cursor.fetchall()

            questions = []
            current_index = 1
            all_answered = True
            
            for q in question_rows:
                feedback = json.loads(q["feedback_json"]) if q["feedback_json"] else None
                checklist = json.loads(q["checklist"]) if q["checklist"] else []
                
                is_done = (q["user_answer"] is not None) or bool(q["skipped"])
                if not is_done and all_answered:
                    current_index = q["question_index"]
                    all_answered = False

                questions.append({
                    "id": q["id"],
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

            if all_answered and questions:
                current_index = len(questions)

            input_mode = "text"
            try:
                input_mode = session_row["input_mode"]
            except (KeyError, IndexError):
                pass

            return {
                "id": session_row["id"],
                "target_role": session_row["target_role"],
                "interview_type": session_row["interview_type"],
                "difficulty": session_row["difficulty"],
                "question_count": session_row["question_count"],
                "status": session_row["status"],
                "mode": session_row["mode"],
                "input_mode": input_mode or "text",
                "created_at": session_row["created_at"],
                "completed_at": session_row["completed_at"],
                "current_question_index": current_index,
                "questions": questions
            }

    @staticmethod
    async def submit_answer(question_id: int, user_answer: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT q.*, s.mode as session_mode, s.id as sess_id
            FROM interview_questions q
            JOIN interview_sessions s ON q.session_id = s.id
            WHERE q.id = ?
            """, (question_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError("Question not found.")

            session_id = row["sess_id"]
            question_text = row["question_text"]
            topic = row["topic"]
            reference_answer = row["reference_answer"]
            checklist = json.loads(row["checklist"]) if row["checklist"] else []

            # Check settings
            cursor.execute("SELECT ai_endpoint, model_name, use_local_ai FROM settings WHERE id = 1")
            setting_row = cursor.fetchone()

        # Decide inference provider
        feedback = None
        if setting_row and setting_row["use_local_ai"]:
            try:
                provider = LocalAIProvider(
                    endpoint=setting_row["ai_endpoint"],
                    model_name=setting_row["model_name"]
                )
                feedback = await provider.evaluate_answer(
                    question=question_text,
                    topic=topic,
                    reference_answer=reference_answer,
                    checklist=checklist,
                    user_answer=user_answer
                )
            except Exception as e:
                # Graceful fallback to Basic Practice Mode
                fallback_provider = BasicPracticeProvider()
                feedback = await fallback_provider.evaluate_answer(
                    question=question_text,
                    topic=topic,
                    reference_answer=reference_answer,
                    checklist=checklist,
                    user_answer=user_answer
                )
                feedback["actionable_tips"].insert(0, f"Local AI model timed out or encountered an issue ({str(e)}). Switched gracefully to Basic Practice Mode.")
        else:
            fallback_provider = BasicPracticeProvider()
            feedback = await fallback_provider.evaluate_answer(
                question=question_text,
                topic=topic,
                reference_answer=reference_answer,
                checklist=checklist,
                user_answer=user_answer
            )

        # Save to DB
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE interview_questions
            SET user_answer = ?, feedback_json = ?, score = ?, answered_at = datetime('now')
            WHERE id = ?
            """, (user_answer, json.dumps(feedback), feedback["score"], question_id))

            # Check if all questions in session are complete
            cursor.execute("""
            SELECT COUNT(*) as remaining
            FROM interview_questions
            WHERE session_id = ? AND user_answer IS NULL AND skipped = 0
            """, (session_id,))
            remaining = cursor.fetchone()["remaining"]
            
            session_completed = (remaining == 0)
            if session_completed:
                cursor.execute("""
                UPDATE interview_sessions
                SET status = 'completed', completed_at = datetime('now')
                WHERE id = ?
                """, (session_id,))

        detail = InterviewService.get_session_detail(session_id)
        next_index = detail["current_question_index"] if detail and not session_completed else None

        return {
            "question_id": question_id,
            "feedback": feedback,
            "session_completed": session_completed,
            "next_question_index": next_index
        }

    @staticmethod
    def skip_question(question_id: int) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT session_id FROM interview_questions WHERE id = ?", (question_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError("Question not found.")
            session_id = row["session_id"]

            cursor.execute("""
            UPDATE interview_questions
            SET skipped = 1, score = 0, answered_at = datetime('now')
            WHERE id = ?
            """, (question_id,))

            cursor.execute("""
            SELECT COUNT(*) as remaining
            FROM interview_questions
            WHERE session_id = ? AND user_answer IS NULL AND skipped = 0
            """, (session_id,))
            remaining = cursor.fetchone()["remaining"]

            session_completed = (remaining == 0)
            if session_completed:
                cursor.execute("""
                UPDATE interview_sessions
                SET status = 'completed', completed_at = datetime('now')
                WHERE id = ?
                """, (session_id,))

        detail = InterviewService.get_session_detail(session_id)
        next_index = detail["current_question_index"] if detail and not session_completed else None

        return {
            "question_id": question_id,
            "session_completed": session_completed,
            "next_question_index": next_index
        }

    @staticmethod
    def end_session(session_id: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE interview_sessions
            SET status = 'completed', completed_at = datetime('now')
            WHERE id = ?
            """, (session_id,))
        return InterviewService.get_session_detail(session_id)
