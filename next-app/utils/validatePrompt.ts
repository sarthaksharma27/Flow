// utils/validatePrompt.ts

export function validatePrompt(prompt: string): { valid: boolean; reason?: string } {
  const lower = prompt.toLowerCase()
  const bannedWords = ["explode", "game", "3d", "chatbot", "api", "backend", "VR", "forget", "Forgot", "Forget",
    "system", "prompt", "execute", "kill", "bad"
  ]

  if (prompt.length < 10) {
    return { valid: false, reason: "Prompt is too short. Be more descriptive." }
  }

  for (const word of bannedWords) {
    if (lower.includes(word)) {
      return { valid: false, reason: `Prompt contains unsupported keyword: ${word}` }
    }
  }

  // Optional: Regex to detect non-math / irrelevant prompts
  const irrelevantPatterns = [/^(hi|hello|test|how are you)\b/i]
  for (const regex of irrelevantPatterns) {
    if (regex.test(prompt)) {
      return { valid: false, reason: "Prompt is too generic or unrelated to 2D animations." }
    }
  }

  return { valid: true }
}
