from typing import Callable, Any
from socketio import AsyncServer
from loguru import logger
from dotenv import load_dotenv
import os
from utils import verify_token, AuthError, AuthExpiredError, call_refresh_service
load_dotenv()


# extracted to appease sonarcube
async def socket_connect_retry(io, sid, environ, data=None):
    try:
        if not data:
            logger.error(f"Socket {sid} attempted to connect without data")
            raise AuthError("No data provided")

        cookie = environ.get('HTTP_COOKIE')
        cookie = cookie.split(';')
        cookie_data = {}
        for c in cookie:
            c = c.split('=')
            cookie_data[c[0].strip()] = c[1].strip()

        token = cookie_data.get('token')
        xsrf_token = data.get('xsrftoken')

        if not xsrf_token or not token:
            logger.error(f"Connection rejected - No XSRF token provided: {sid}")
            raise AuthError("No XSRF token provided")

        try:       
            decoded = verify_token(token, xsrf_token)
        except AuthExpiredError as e:
            try:
                decoded = await call_refresh_service(cookie_data, xsrf_token, token)
            except Exception as e:
                logger.error(f"Connection rejected - {str(e)}: {sid}")
                raise AuthError("Token expired")
        
        # Store user data in the socket session
        await io.save_session(sid, {'user': decoded['user']})
        
        logger.info(f"Socket connected: {sid} - User: {decoded['user'].get('email')}")

    except AuthError as e:
        logger.error(f"Connection rejected - {str(e)}: {sid}")

    except Exception as e:
        logger.error(f"Unexpected error during socket authentication: {str(e)}")
          

async def register_socket_events(io: AsyncServer) -> None:
    @io.event
    async def connect(sid, environ, data=None):
        await socket_connect_retry(io, sid, environ, data)
    
    @io.event
    async def disconnect(sid):
        logger.info(f"Socket disconnected: {sid}")

    @io.event
    async def join_room(sid, data=None):
        if not data:
            logger.error(f"Socket {sid} attempted to join room without data")
            return
        room = data.get('room')
        logger.info(f"Socket {sid} joined room: {room}")
        await io.enter_room(sid, str(room))

    @io.event
    async def leave_room(sid, data=None):
        if not data:
            logger.error(f"Socket {sid} attempted to leave room without data")
            return
        room = data.get('room')
        logger.info(f"Socket {sid} left room: {room}")
        await io.leave_room(sid, str(room))


