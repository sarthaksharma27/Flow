// next-app/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Use environment variable for Socket.IO server URL
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(WS_URL!); // Non-null assertion since you control the env
  }
  return socket;
};
