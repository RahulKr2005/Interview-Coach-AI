from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.schemas import UserProfileSchema, UserProfileResponse

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=UserProfileResponse)
def get_profile():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_profile WHERE id = 1")
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Profile not found")
        return dict(row)

@router.put("", response_model=UserProfileResponse)
def update_profile(data: UserProfileSchema):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE user_profile
        SET name = ?, target_role = ?, experience_level = ?, updated_at = datetime('now')
        WHERE id = 1
        """, (data.name, data.target_role, data.experience_level))
        
        cursor.execute("SELECT * FROM user_profile WHERE id = 1")
        row = cursor.fetchone()
        return dict(row)
