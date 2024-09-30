import { io } from 'socket.io-client';
import { createContext, ReactNode, useMemo} from 'react';

const socket = io(import.meta.env['VITE_AI_API_URL'], {
  auth: {
    xsrftoken: localStorage.getItem('xsrfToken'),
  },
  transports: ['websocket'],
  path: '/ws/socketio',
  // autoConnect: false,
  upgrade: true,
});


export const SocketContext = createContext({ socket })
const SocketProvider = ({ children }
    : { children: ReactNode }
) => { 
    const socketValue = useMemo(() => ({ socket }), []);
    return (
        <SocketContext.Provider value={socketValue}>
          {children}
        </SocketContext.Provider>
    )
    }

export default SocketProvider;