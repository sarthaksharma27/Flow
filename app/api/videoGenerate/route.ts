// app/api/videoGenerate/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code } = body

    console.log("Received code for video generation:\n", code)

    return NextResponse.json({ message: "Code received", status: "ok" })
  } catch (error) {
    console.error("Error in videoGenerate handler:", error)
    return NextResponse.json({ error: "Failed to process code" }, { status: 500 })
  }
}
