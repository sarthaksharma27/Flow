// app/api/videoGenerate/route.ts

import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { videoQueue } from "@/lib/queue"

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    const jobId = uuidv4()

    // Add job to BullMQ
    await videoQueue.add("generate-video", { code, jobId }, { jobId })

    return NextResponse.json({ jobId }) // Client gets this
  } catch (error) {
    console.error("Video job enqueue failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
