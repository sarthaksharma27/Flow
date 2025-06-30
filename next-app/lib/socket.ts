// next-app/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "https://d0ef-20-109-10-152.ngrok-free.app";

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket"],         // Force WS only
      withCredentials: false,            // No cookie/session-based CORS
    });

    socket.on("connect", () => {
      console.log("✅ WebSocket connected");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ WebSocket connection error:", err.message);
    });
  }

  return socket;
};
