import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from fastapi import HTTPException, status, Request
from typing import IO, Callable
import filetype
from rag.services import Service, run_model
from concurrent.futures import ThreadPoolExecutor
import asyncio
import socketio
import jwt
import httpx
from loguru import logger
from dotenv import load_dotenv
import os
load_dotenv()

ROOT_DIR = Path(__file__).parent.parent
MAIN_API_URL = os.getenv("MAIN_API_URL", "http://localhost:3000")
thread_pool = ThreadPoolExecutor(max_workers=3) 

class AuthError(Exception):
    """Custom exception for authentication errors"""
    pass

class AuthExpiredError(AuthError):
    """Custom exception for expired tokens"""
    pass


def generate_headers(request: Request = None, xsrftoken: str = None) -> dict:
    if not request and not xsrftoken:
        raise ValueError("Request or XSRF token required")

    if not xsrftoken:
        resolved_xsrf_token = request.headers.get("x-xsrf-token")
    else:
        resolved_xsrf_token = xsrftoken

    return { 
        "Content-Type": "application/json",
        "x-local-service-key": os.getenv("LOCAL_SERVICE_KEY"),
        "x-xsrf-token": resolved_xsrf_token
}

async def set_project_status(sio: socketio.AsyncServer, request: Request, project_id: str, status: str) -> None:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{MAIN_API_URL}/projects/{project_id}/status", 
            headers=generate_headers(request),
            cookies=request.cookies,
            json={"status": status}
        )
        if resp.status_code != 200:
            logger.error(f"Error updating project status to processing {resp.json()}")
            raise ValueError("Error updating project status to processing")

        await sio.emit('status', {
            'status': status
        }, room=project_id)

async def get_project_status(request: Request, project_id: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{MAIN_API_URL}/projects/{project_id}/status", 
            headers=generate_headers(request),
            cookies=request.cookies
        )
        if resp.status_code != 200:
            logger.error(f"error getting project_status {resp.json()}")
            raise ValueError("Error getting project status")
        return resp.json().get('status')

# rewrote instead of microservice call for socket auth also
def verify_token(token: str, xsrf_token: str) -> dict:
    try:
        secret_key = os.getenv("JWT_SECRET_KEY")
        decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])
        decoded_xsrf = jwt.decode(xsrf_token, secret_key, algorithms=["HS256"])
        # check blacklisted tokens TODO

        decoded_xsrf_value = decoded_xsrf.get('xsrfToken')
        decoded_token_xsrf_value = decoded_token.get('xsrfToken')

        if not decoded_xsrf_value or not decoded_token_xsrf_value:
            logger.error("XSRF token not found in token")
            raise AuthError("No XSRF token found in token")

        if decoded_xsrf_value != decoded_token_xsrf_value:
            logger.error("XSRF token mismatch")
            raise AuthError("Invalid XSRF Token pair")

        return decoded_token
    except jwt.ExpiredSignatureError as e:
        logger.error(f"Token expired: {str(e)}")
        raise AuthExpiredError("Token expired")

    except jwt.InvalidTokenError as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise AuthError("Invalid token")

async def call_refresh_service(cookie_data, xsrf_token, token):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{MAIN_API_URL}/auth/refresh-token",
            cookies=cookie_data,
            headers=generate_headers(xsrftoken=xsrf_token)
        )
        if resp.status_code != 200:
            logger.error(f"Error refreshing token: {resp.json()}")
            raise AuthError("Token expired")
    
        resp_data = resp.json()
        new_token = resp_data.get('token')
        new_xsrf_token = resp_data.get('xsrfToken')
        decoded = verify_token(new_token, new_xsrf_token)
        return decoded
    
async def run_model_async(
        source_video_path: str,
        target_video_path: str,
        project_id: str,
        video_id: str,
        mode: Service,
        sio: socketio.AsyncServer,
        device: str = 'cpu'
        ):
    """
    Asynchronous wrapper for run_model that runs in a thread pool
    """
    loop = asyncio.get_event_loop()
    
    # Create a queue to communicate between the thread and async code
    queue = asyncio.Queue()
    
    async def process_queue():
        try:
            while True:
                percentage = await queue.get()
                if percentage is None:  # Signal to stop
                    break
                await sio.emit('progress', {
                    'type': 'progress',
                    'percentage': percentage
                })
        except asyncio.CancelledError as ace:
            logger.error(f"Queue processor cancelled: {ace}")
            raise ace
        except Exception as e:
            logger.error(f"Queue processor error: {e}")
            raise e

    def progress_callback(percentage):
        """Callback function to put progress updates in the queue"""
        asyncio.run_coroutine_threadsafe(queue.put(percentage), loop)

    def run_in_thread():
        # Run the original model with progress updates
        for percentage in run_model(
            source_video_path=source_video_path,
            target_video_path=target_video_path,
            project_id=project_id,
            video_id=video_id,
            mode=mode,
            device=device
        ):
            print(video_id, f"{percentage}%")
            progress_callback(percentage)
        
        # Signal completion
        progress_callback(None)

    # Start the queue processor
    queue_task = asyncio.create_task(process_queue())
    
    try:
        # Run the CPU-intensive task in the thread pool
        await loop.run_in_executor(thread_pool, run_in_thread)
        # Wait for queue to finish processing
        await queue_task
    except Exception as e:
        queue_task.cancel()
        raise HTTPException(status_code=500, detail=str(e))


def validate_file_size_type(file: IO):

    accepted_file_types = [
        "mp4",
        "mov",
        "avi",
        "mkv",
        "webm",
        "flv",
        "wmv",
        "mpeg",
        "mpg",
        "m4v",
        "3gp",
        "3g2",
    ] 
    file_info = filetype.guess(file.file)
    if file_info is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unable to determine file type",
        )

    detected_content_type = file_info.extension.lower()
    media_type, _ = file.content_type.split("/")
    if (
        media_type != "video"
        or detected_content_type not in accepted_file_types
    ):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type",
        )

    # validate file size # omitted for now as it consumes generator
    # FILE_SIZE = 10 * 1024 * 1024  # 10MB
    # real_file_size = 0
    # for chunk in file.file:
    #     real_file_size += len(chunk)
    #     if real_file_size > FILE_SIZE:
    #         raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Too large")
    # print("FILE SIZE", real_file_size)