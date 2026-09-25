import os
import time
import tempfile
import httpx
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.database import get_db

MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024  # 25MB max upload (well beyond 3 minutes of compressed audio)

SUPPORTED_AUDIO_MIME_TYPES = {
    "audio/webm",
    "audio/webm;codecs=opus",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/ogg",
    "audio/ogg;codecs=opus",
    "audio/mpeg",
    "audio/mp3",
}

DEFAULT_SETUP_INSTRUCTIONS = (
    "To enable offline local transcription on your PC, you can either:\n"
    "1. Run a local Whisper server (e.g. whisper.cpp server or local OpenAI-compatible endpoint) on localhost:8080.\n"
    "2. Install OpenAI Whisper in your virtual environment: `.\\venv\\Scripts\\pip install openai-whisper`.\n"
    "Configure your preferred endpoint or runtime in the Settings tab."
)


class BaseSTTProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_path: str, mime_type: str) -> Dict[str, Any]:
        """Transcribe an audio file from disk."""
        pass

    @abstractmethod
    async def check_readiness(self) -> Dict[str, Any]:
        """Check if local STT runtime or endpoint is ready."""
        pass


class LocalWhisperEndpointProvider(BaseSTTProvider):
    """
    Connects to a local OpenAI-compatible Whisper HTTP endpoint
    (e.g., whisper.cpp server, local Ollama / LM Studio audio endpoint, or local Whisper API).
    """
    def __init__(self, endpoint: str, model_name: str = "whisper-1", timeout: float = 30.0):
        self.endpoint = endpoint.rstrip("/")
        self.model_name = model_name or "whisper-1"
        self.timeout = timeout

    async def check_readiness(self) -> Dict[str, Any]:
        if not self.endpoint:
            return {
                "ready": False,
                "provider": "Local Whisper Endpoint",
                "endpoint": "",
                "model": self.model_name,
                "status": "not_configured",
                "message": "Local STT endpoint URL is not configured. Basic practice text answering remains available.",
                "setup_instructions": DEFAULT_SETUP_INSTRUCTIONS
            }

        try:
            # Ping base or /models endpoint with a short timeout
            url = f"{self.endpoint}/models"
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url)
                if res.status_code in (200, 404, 405):  # Server is alive
                    return {
                        "ready": True,
                        "provider": "Local Whisper Endpoint",
                        "endpoint": self.endpoint,
                        "model": self.model_name,
                        "status": "ready",
                        "message": f"Local STT endpoint is reachable at {self.endpoint}.",
                        "setup_instructions": None
                    }
                else:
                    return {
                        "ready": False,
                        "provider": "Local Whisper Endpoint",
                        "endpoint": self.endpoint,
                        "model": self.model_name,
                        "status": "unreachable",
                        "message": f"Server responded with unexpected status HTTP {res.status_code}.",
                        "setup_instructions": DEFAULT_SETUP_INSTRUCTIONS
                    }
        except httpx.ConnectError:
            return {
                "ready": False,
                "provider": "Local Whisper Endpoint",
                "endpoint": self.endpoint,
                "model": self.model_name,
                "status": "unreachable",
                "message": f"Cannot connect to local STT server at {self.endpoint}. Ensure your local Whisper server is running.",
                "setup_instructions": DEFAULT_SETUP_INSTRUCTIONS
            }
        except Exception as e:
            return {
                "ready": False,
                "provider": "Local Whisper Endpoint",
                "endpoint": self.endpoint,
                "model": self.model_name,
                "status": "error",
                "message": f"Connection check failed: {str(e)}",
                "setup_instructions": DEFAULT_SETUP_INSTRUCTIONS
            }

    async def transcribe(self, audio_path: str, mime_type: str) -> Dict[str, Any]:
        start = time.perf_counter()
        target_url = f"{self.endpoint}/audio/transcriptions"

        try:
            with open(audio_path, "rb") as f:
                audio_bytes = f.read()

            files = {
                "file": ("recording.webm", audio_bytes, mime_type)
            }
            data = {
                "model": self.model_name,
                "language": "en"
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(target_url, files=files, data=data)
                latency = round((time.perf_counter() - start) * 1000, 1)

                if res.status_code == 200:
                    resp_json = res.json()
                    transcript = resp_json.get("text", "").strip()
                    return {
                        "success": True,
                        "transcript": transcript,
                        "status": "completed",
                        "message": "Transcription completed successfully.",
                        "latency_ms": latency
                    }
                else:
                    return {
                        "success": False,
                        "transcript": "",
                        "status": "endpoint_error",
                        "message": f"Local STT server returned HTTP {res.status_code}: {res.text[:200]}",
                        "latency_ms": latency,
                        "setup_instructions": DEFAULT_SETUP_INSTRUCTIONS
                    }
        except httpx.ConnectError:
            return {
                "success": False,
                "transcript": "",
                "status": "not_connected",
                "message": f"Cannot connect to local transcription server at {self.endpoint}. Please verify that the server is running on localhost.",
                "setup_instructions": DEFAULT_SETUP_INSTRUCTIONS
            }
        except Exception as e:
            return {
                "success": False,
                "transcript": "",
                "status": "error",
                "message": f"Transcription request failed: {str(e)}",
                "setup_instructions": DEFAULT_SETUP_INSTRUCTIONS
            }


class LocalWhisperPythonProvider(BaseSTTProvider):
    """
    Direct in-process Whisper runtime provider if openai-whisper or faster-whisper is installed.
    """
    def __init__(self, model_name: str = "base.en"):
        self.model_name = model_name

    async def check_readiness(self) -> Dict[str, Any]:
        try:
            import whisper  # Check if installed
            return {
                "ready": True,
                "provider": "Python OpenAI-Whisper",
                "endpoint": "in-process",
                "model": self.model_name,
                "status": "ready",
                "message": "In-process OpenAI Whisper runtime is installed.",
                "setup_instructions": None
            }
        except ImportError:
            return {
                "ready": False,
                "provider": "Python OpenAI-Whisper",
                "endpoint": "in-process",
                "model": self.model_name,
                "status": "not_installed",
                "message": "Local Whisper Python runtime is not installed in the virtual environment.",
                "setup_instructions": (
                    "To use in-process transcription, run:\n"
                    ".\\venv\\Scripts\\pip install openai-whisper\n"
                    "Note: requires ffmpeg on Windows path. Alternatively, use a local whisper.cpp server."
                )
            }

    async def transcribe(self, audio_path: str, mime_type: str) -> Dict[str, Any]:
        try:
            import whisper
            start = time.perf_counter()
            model = whisper.load_model(self.model_name)
            result = model.transcribe(audio_path, language="en")
            latency = round((time.perf_counter() - start) * 1000, 1)
            return {
                "success": True,
                "transcript": result.get("text", "").strip(),
                "status": "completed",
                "message": "Transcription completed successfully via local Whisper.",
                "latency_ms": latency
            }
        except ImportError:
            return {
                "success": False,
                "transcript": "",
                "status": "not_installed",
                "message": "Local Whisper package is not installed. You can type or paste your answer directly below.",
                "setup_instructions": (
                    "To install offline Whisper, run in PowerShell:\n"
                    ".\\venv\\Scripts\\pip install openai-whisper"
                )
            }
        except Exception as e:
            return {
                "success": False,
                "transcript": "",
                "status": "error",
                "message": f"Local transcription failed: {str(e)}",
                "setup_instructions": DEFAULT_SETUP_INSTRUCTIONS
            }


def get_stt_provider() -> BaseSTTProvider:
    """Factory to retrieve configured STT provider based on database settings."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT stt_endpoint, stt_model, stt_provider_type FROM settings WHERE id = 1")
        row = cursor.fetchone()

    if not row:
        return LocalWhisperEndpointProvider(endpoint="")

    stt_endpoint = row["stt_endpoint"].strip() if row["stt_endpoint"] else ""
    stt_model = row["stt_model"] or "whisper-1"
    provider_type = row["stt_provider_type"] or "local_whisper"

    if provider_type == "python_whisper":
        return LocalWhisperPythonProvider(model_name=stt_model)
    else:
        return LocalWhisperEndpointProvider(endpoint=stt_endpoint, model_name=stt_model)


async def transcribe_audio_safe(file_bytes: bytes, filename: str, mime_type: str) -> Dict[str, Any]:
    """
    Validates audio payload, writes to a temporary file, transcribes via STT provider,
    and UNCONDITIONALLY deletes the temporary audio file in a finally: block.
    Raw audio is NEVER persisted on disk or in SQLite.
    """
    if len(file_bytes) > MAX_AUDIO_SIZE_BYTES:
        return {
            "success": False,
            "transcript": "",
            "status": "file_too_large",
            "message": f"Audio file exceeds maximum size limit of 25MB ({len(file_bytes) / 1024 / 1024:.1f}MB). Please record a shorter response under 3 minutes.",
            "setup_instructions": None
        }

    # Validate audio MIME or extension
    clean_mime = mime_type.split(";")[0].strip().lower()
    valid_ext = any(filename.lower().endswith(ext) for ext in [".webm", ".mp4", ".m4a", ".wav", ".ogg", ".mp3"])
    if clean_mime not in [m.split(";")[0] for m in SUPPORTED_AUDIO_MIME_TYPES] and not valid_ext:
        return {
            "success": False,
            "transcript": "",
            "status": "invalid_format",
            "message": f"Unsupported audio format '{mime_type}'. Supported formats: WebM (Opus), MP4/M4A, WAV, OGG.",
            "setup_instructions": None
        }

    # Determine temporary file suffix
    suffix = ".webm"
    if "mp4" in clean_mime or filename.endswith(".mp4"):
        suffix = ".mp4"
    elif "wav" in clean_mime or filename.endswith(".wav"):
        suffix = ".wav"
    elif "ogg" in clean_mime or filename.endswith(".ogg"):
        suffix = ".ogg"
    elif "m4a" in clean_mime or filename.endswith(".m4a"):
        suffix = ".m4a"

    temp_path = None
    try:
        # Create temp file
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(file_bytes)
            temp_path = tmp.name

        provider = get_stt_provider()
        result = await provider.transcribe(temp_path, mime_type)
        return result

    finally:
        # Strictly delete temporary audio file to preserve privacy
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass
