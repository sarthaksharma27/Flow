// ws-server/index.ts
import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from "redis";

// Constants
const PORT = 4000;
const REDIS_URL = "redis://localhost:6379";

// ALLOWED ORIGINS (localhost + vercel)
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://flow-theta-inky.vercel.app"
];

// Redis client setup
const redis = createClient({ url: REDIS_URL });

redis
  .connect()
  .then(() => {
    console.log("✅ Redis connected");
  })
  .catch(console.error);

// HTTP server for Socket.IO
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: false
  }
});

// Handle socket connection
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join a specific room
  socket.on("join", (jobId: string) => {
    console.log(`➡️  Socket ${socket.id} joining room ${jobId}`);
    socket.join(jobId);
  });

  // Optional disconnect log
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Redis → WebSocket broadcast
redis.subscribe("video-ready", (message) => {
  try {
    const { jobId, videoUrl } = JSON.parse(message);
    console.log(`📡 PubSub received: jobId=${jobId}, videoUrl=${videoUrl}`);

    // Emit to room
    io.to(jobId).emit("video:done", { videoUrl });
    console.log(`✅ Emitted to room ${jobId}`);
  } catch (err) {
    console.error("❌ Failed to parse Redis message:", err);
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket Server running on http://localhost:${PORT}`);
});
