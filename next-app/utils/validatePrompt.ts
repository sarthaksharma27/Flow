// utils/validatePrompt.ts
export function validatePrompt(prompt: string): boolean {
  const bannedWords = ["explode", "game", "3d", "chatbot", "api", "backend", "VR"]
  const lower = prompt.toLowerCase()

  for (const word of bannedWords) {
    if (lower.includes(word)) return false
  }

  return prompt.length > 10 // must be descriptive
}
