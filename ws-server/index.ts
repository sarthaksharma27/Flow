// ws-server/index.ts
import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from "redis";

// Read ENV
const PORT = process.env.PORT || 4000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Create Redis subscriber
const redis = createClient({ url: REDIS_URL });
redis.connect().then(() => {
  console.log("✅ Redis connected");
}).catch(console.error);

// Socket.IO server setup
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // change this to match frontend origin in prod
  }
});

// Client connects
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join room by jobId
  socket.on("join", (jobId: string) => {
    console.log(`➡️  Socket ${socket.id} joining room ${jobId}`);
    socket.join(jobId);
  });

  // Optional: client disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Redis Pub/Sub → forward to WebSocket
redis.subscribe("video-ready", (message) => {
  try {
    const { jobId, videoUrl } = JSON.parse(message);
    console.log(`📡 PubSub received: jobId=${jobId} and videoURL=${videoUrl}`);

    // Emit to room
    io.to(jobId).emit("video:done", { videoUrl });
    console.log("Vidoe url send to the frontend");
    
  } catch (err) {
    console.error("❌ Failed to parse Redis message:", err);
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket Server running on port ${PORT}`);
});
