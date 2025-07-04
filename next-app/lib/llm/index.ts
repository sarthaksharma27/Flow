// lib/llm/index.ts
export async function generateManimCode(userPrompt: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000", // Optional but recommended
      "X-Title": "Manim Generator",            // Optional but recommended
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat-v3-0324:free", // exact model name on OpenRouter
      messages: [
        {
          role: "system",
          content: `
You are a Manim expert. Always return valid Python code using Manim Community Edition.

Strict Rules:
- Define a Scene subclass named MyScene.
- You must use at least one self.play(...) to trigger actual animation.
- Avoid static scenes or scenes without animation.
- No explanations, no markdown — only raw Python code.
- Keep scenes short and visually clear.
- Output only the Python code inside one scene class.
          `.trim(),
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("OpenRouter error:", error)
    throw new Error("Failed to get response from LLM")
  }

  const data = await response.json()
  const code = data.choices?.[0]?.message?.content
  if (!code) throw new Error("No code returned by the model")

  return code.trim()
}
