// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { generateManimCode } from "@/lib/llm"
import { validatePrompt } from "@/utils/validatePrompt"

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Invalid prompt" }, { status: 400 })
  }

  // Step 1: Basic validation
  const isValid = validatePrompt(prompt)
  if (!isValid) {
    return NextResponse.json({ error: "Prompt not supported by Manim" }, { status: 422 })
  }

  // Step 2: Call LLM to generate code
  try {
    const code = await generateManimCode(prompt)

    return NextResponse.json({ code })
  } catch (err) {
    console.error("LLM error:", err)
    return NextResponse.json({ error: "Code generation failed" }, { status: 500 })
  }
}
