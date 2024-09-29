from utils import (
    ROOT_DIR, 
    run_model_async, 
    Service, 
    validate_file_size_type, 
    set_project_status, 
    get_project_status,
    generate_headers,
    verify_token,
    MAIN_API_URL
)

import os
import json
from typing import Union, Annotated, AsyncGenerator, Optional, List 
from fastapi import (
    FastAPI, 
    Request, 
    UploadFile, Form, 
    File, 
    Depends, 
    status, 
    HTTPException
)
from pydantic import BaseModel, constr
from rag.sql_rag import SQLAgentLanggraph, SQLMessageHistory
from werkzeug.utils import secure_filename
from fastapi.responses import StreamingResponse, JSONResponse
import asyncio
import aiofiles
from dotenv import load_dotenv
import ngrok
import uvicorn
from loguru import logger
import firebase_admin
from firebase_admin import credentials, firestore, storage
import socketio
from contextlib import asynccontextmanager
from socketsetup import register_socket_events
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from functools import partial
from typing import AsyncGenerator
import numpy as np
import uuid
import httpx

load_dotenv()

NGROK_AUTH_TOKEN = os.getenv("NGROK_AUTH_TOKEN", "")
APPLICATION_PORT = os.getenv("APPLICATION_PORT", 8000)
NGROK_DOAMAIN = os.getenv("NGROK_DOMAIN", "localhost")
FIREBASE_BUCKET = os.getenv("FIREBASE_BUCKET", "grak-twitter-166d0.appspot.com")

my_credentitals = credentials.Certificate((Path(__file__).parent/"firebaseconfig.json").as_posix())
firebase_admin.initialize_app(my_credentitals, { 
    'storageBucket': FIREBASE_BUCKET
})

db = firestore.client()
bucket = storage.bucket()

sio = socketio.AsyncServer(cors_allowed_origins=[], async_mode='asgi') 

@asynccontextmanager
async def lifespan(app: FastAPI):
    # if using ngrok in 
    # logger.info("Setting up Ngrok Tunnel")
    # ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    # ngrok.forward(
    #     addr=APPLICATION_PORT,
    #     domain=NGROK_DOAMAIN,
    #     proto="http",
    # )
    logger.info("Setting up socket server")
    await register_socket_events(sio)
    socket_app = socketio.ASGIApp(sio, socketio_path="/ws/socketio")
    app.mount("/", socket_app)
    yield
    # ngrok teardown
    # logger.info("Tearing Down Ngrok Tunnel")
    # ngrok.disconnect()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def before_request(request: Request, call_next):

    if request.method != "OPTIONS":
        token = request.cookies.get('token')
        xsrf_token = request.headers.get('x-xsrf-token')   

        if not xsrf_token or not token:
            logger.error("Missing XSRF token or token")
            return JSONResponse(content={"error": "Missing XSRF token or token"}, status_code=400)
            
        try:
            decoded = verify_token(token, xsrf_token)
            request.state.user = decoded.get('user')
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return JSONResponse(content={"error": "Invalid token"}, status_code=401)
    
    response = await call_next(request)
    return response

@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "ok"})

class PredictFileRequest(BaseModel):
    model: Service
    file: UploadFile
    prompt: Optional[constr(max_length=1000)] = None

class PredictAgentRequest(BaseModel):
    model: Optional[Service] = None # not required but may require to specify which table to help with prediction ?
    video_id: str
    prompt: constr(min_length=1, max_length=1000)


class PredictRequest(BaseModel):
    @classmethod
    def from_form(
        cls,
        model: Annotated[Optional[str], Form()] = None,
        file: Annotated[Optional[UploadFile], Form()] = None,
        prompt: Annotated[Optional[str], Form()] = None,
        video_id: Annotated[Optional[str], Form()] = None
    ) -> Union[PredictFileRequest, PredictAgentRequest]:

        if model is not None:
            model = Service[model.upper()]

        if file is not None:
            if not model: 
                raise ValueError("Model is required")
            return PredictFileRequest(model=model, file=file, prompt=prompt)
        elif prompt is not None and video_id is not None:
            return PredictAgentRequest(model=model, video_id=video_id, prompt=prompt)
        raise ValueError("Either file or (prompt and video_id) must be provided")         

@app.post('/ai/predict/{project_id}')
async def predict(
    request: Request,
    project_id: str,
    predict_request: Annotated[PredictRequest, Depends(PredictRequest.from_form)]
):
    try:
        async def token_stream_callback(token):
            await sio.emit('system_message', {"token": token}, room=project_id)

        async def final_answer_pre_stream_callback():
            await sio.emit('system_message_start', room=project_id)
            await asyncio.sleep(1) # ensure start message is sent before final answer

        project_status = await get_project_status(request, project_id)
        if project_status == "processing":
            raise HTTPException(status_code=400, detail="Project is currently processing a request")

        sender = request.state.user.get('email')
        if not sender:
            return JSONResponse(content={"error": "could not determine sender"}, status_code=400)

        await set_project_status(sio, request, project_id, "processing")

        if isinstance(predict_request, PredictFileRequest):
            
            service = Service[predict_request.model.upper()]

            validate_file_size_type(predict_request.file)
            
            sec_filename = secure_filename(predict_request.file.filename)
            temp_file = ROOT_DIR / f"temp/{sec_filename}"
            temp_file.parent.mkdir(exist_ok=True, parents=True)

            output_file = ROOT_DIR / f"output/{sec_filename}"
            output_file.parent.mkdir(exist_ok=True, parents=True)

            contents = await predict_request.file.read()
            async with aiofiles.open(temp_file, "wb") as f:
                await f.write(contents)

            # Initial progress
            await sio.emit('progress', {
                'type': 'progress',
                'percentage': 0
            }, room=project_id)

            video_id = f"{project_id}-{str(uuid.uuid4())}"

            # Process video with socket.io progress updates
            await run_model_async(
                temp_file, 
                output_file, 
                project_id, 
                video_id, 
                service, 
                sio, 
            )

            _, ext = sec_filename.split(".")
            # Upload to firebase
            blob = bucket.blob(f"projects/{project_id}/clips/{video_id}.{ext}")
            with open(output_file, "rb") as f:
                blob.upload_from_file(f, content_type=f"video/{ext}")
                blob.make_public()
                
                url = blob.public_url
                print(url)

            # Clean up files
            if temp_file.exists():
                Path.unlink(temp_file)
            if output_file.exists():
                Path.unlink(output_file)

            # let microservice save video to db
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{MAIN_API_URL}/projects/{project_id}/save-clip", 
                    headers=generate_headers(request),
                    cookies=request.cookies,
                    json={
                        "video_id": video_id,
                        "url": url,
                        "content_type": f"video/{ext}",
                    }
                )
                if resp.status_code != 200:
                    logger.error(f"Error saving video to db: {resp.text}")
                    raise ValueError("Error saving video to db")

            await socket.emit('new_clip', {
                "video_id": video_id,
                "url": url,
                "content_type": f"video/{ext}"
            }, room=project_id)

            if predict_request.prompt:
                agent = SQLAgentLanggraph(
                    service="google", 
                    project_id=project_id,
                    video_id=video_id,
                    final_answer_pre_callback=final_answer_pre_stream_callback,
                    token_callback=token_stream_callback
                )

                await agent.process_question(predict_request.prompt, sender)

         

            return JSONResponse(content={
                "video_id": video_id,
                "url": url,
                "content_type": f"video/{ext}"
            }, status_code=200)

        # Handle batch prediction (video_id with prompt)
        elif isinstance(predict_request, PredictAgentRequest):

            agent = SQLAgentLanggraph(
                service="google", 
                project_id=project_id,
                video_id=predict_request.video_id,
                final_answer_pre_callback=final_answer_pre_stream_callback,
                token_callback=token_stream_callback
            )

            await agent.process_question(predict_request.prompt, sender)

            return JSONResponse(content={"status": "ok"}, status_code=200)

        else:
            return JSONResponse(content={"error": "Invalid request"}, status_code=400)
            

    except HTTPException as e:
        raise e

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        # Emit error through socket
        await sio.emit('progress', {
            'type': 'error',
            'message': str(e)
        }, room=project_id)
        await sio.emit('system_message_error', room=project_id)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        await set_project_status(sio, request, project_id, "active")
            
@app.get("/ai/{project_id}/messages")
def get_history(request: Request, project_id: str):

    try:
        sql_history = SQLMessageHistory(project_id=project_id)
        messages = sql_history.get_history()
        
        return JSONResponse(content={"messages": messages}, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": f"Error: {e}"}, status_code=500)


# @app.get("/ai/{project_id}")
# async def ai_query(request: Request, query: str, project_id: Union[str, None] = None):

#     try:
        
#         if not query or not project_id:
#             return JSONResponse(content={"error": "query and project_id are required"}, status_code=400)

#         project_status = await get_project_status(request, project_id)
#         if project_status == "processing":
#             raise HTTPException(status_code=400, detail="Project is currently processing a request")

#         sender = request.headers.get("X-Sender")
#         if not sender:
#             return JSONResponse(content={"error": "X-Sender header is required"}, status_code=400)

#         agent = SQLAgentLanggraph(
#             service="groq", 
#             project_id=project_id,
#         )

#         await set_project_status(request, project_id, "processing")
#         return StreamingResponse(agent.process_question(query, sender), media_type="text/event-stream")

#     except Exception as e:
#         return JSONResponse(content={"error": f"Error: {e}"}, status_code=500)

#     finally:
#         await set_project_status(request, project_id, "active")
