// lib/queue.ts
import { Queue } from "bullmq"
import IORedis from "ioredis"

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379")

export const videoQueue = new Queue("video-generation", { connection })
