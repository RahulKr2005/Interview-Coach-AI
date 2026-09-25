from fastapi import APIRouter
from app.database import get_db
from app.schemas import (
    SettingsSchema,
    SettingsResponse,
    ConnectionTestRequest,
    ConnectionTestResponse,
    TranscriptionStatusResponse
)
from app.services.ai_service import LocalAIProvider
from app.services.stt_service import get_stt_provider

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SettingsResponse)
async def get_settings():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM settings WHERE id = 1")
        row = cursor.fetchone()
        
    ai_endpoint = row["ai_endpoint"]
    model_name = row["model_name"]
    use_local_ai = bool(row["use_local_ai"])

    stt_endpoint = ""
    stt_model = "whisper-1"
    stt_provider_type = "local_whisper"
    try:
        stt_endpoint = row["stt_endpoint"] or ""
        stt_model = row["stt_model"] or "whisper-1"
        stt_provider_type = row["stt_provider_type"] or "local_whisper"
    except (KeyError, IndexError):
        pass

    # Ping connection if user has local AI enabled
    status = "Disabled (Basic Practice Mode Active)"
    if use_local_ai:
        provider = LocalAIProvider(ai_endpoint, model_name)
        res = await provider.test_connection()
        status = "Connected" if res["connected"] else f"Disconnected: {res['message']}"

    # Check STT readiness
    stt_provider = get_stt_provider()
    stt_ready_info = await stt_provider.check_readiness()
    stt_status = stt_ready_info["message"]

    return {
        "ai_endpoint": ai_endpoint,
        "model_name": model_name,
        "use_local_ai": use_local_ai,
        "stt_endpoint": stt_endpoint,
        "stt_model": stt_model,
        "stt_provider_type": stt_provider_type,
        "updated_at": row["updated_at"],
        "connection_status": status,
        "stt_status": stt_status
    }

@router.put("", response_model=SettingsResponse)
async def update_settings(payload: SettingsSchema):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE settings
        SET ai_endpoint = ?, model_name = ?, use_local_ai = ?,
            stt_endpoint = ?, stt_model = ?, stt_provider_type = ?, updated_at = datetime('now')
        WHERE id = 1
        """, (
            payload.ai_endpoint,
            payload.model_name,
            1 if payload.use_local_ai else 0,
            payload.stt_endpoint,
            payload.stt_model,
            payload.stt_provider_type
        ))
        
        cursor.execute("SELECT * FROM settings WHERE id = 1")
        row = cursor.fetchone()

    status = "Disabled (Basic Practice Mode Active)"
    if payload.use_local_ai:
        provider = LocalAIProvider(payload.ai_endpoint, payload.model_name)
        res = await provider.test_connection()
        status = "Connected" if res["connected"] else f"Disconnected: {res['message']}"

    stt_provider = get_stt_provider()
    stt_ready_info = await stt_provider.check_readiness()

    return {
        "ai_endpoint": row["ai_endpoint"],
        "model_name": row["model_name"],
        "use_local_ai": bool(row["use_local_ai"]),
        "stt_endpoint": payload.stt_endpoint,
        "stt_model": payload.stt_model,
        "stt_provider_type": payload.stt_provider_type,
        "updated_at": row["updated_at"],
        "connection_status": status,
        "stt_status": stt_ready_info["message"]
    }

@router.get("/transcription-status", response_model=TranscriptionStatusResponse)
async def get_transcription_status():
    provider = get_stt_provider()
    status_info = await provider.check_readiness()
    return status_info

@router.post("/test-connection", response_model=ConnectionTestResponse)
async def test_connection(payload: ConnectionTestRequest):
    provider = LocalAIProvider(payload.ai_endpoint, payload.model_name)
    result = await provider.test_connection()
    return result
