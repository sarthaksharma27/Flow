"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [prompt, setPrompt] = useState("") // state to track textarea content

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin") // redirect if not logged in
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="text-white p-8">Loading...</div>
  }

  const handleGenerate = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({ prompt }),
      headers: { "Content-Type": "application/json" },
    })

    const data = await res.json()
    console.log("Response from API:", data)

    setPrompt("") // <-- this clears the textarea after submit
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* User Info Header */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? "User"} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">
              Welcome, {session?.user?.name}
            </h2>
            <p className="text-sm text-zinc-400">Create math animations using simple prompts.</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-6 md:space-y-0">
          {/* Left: Input area */}
          <div className="flex-1 space-y-3">
            <label htmlFor="prompt" className="text-sm font-medium">
              Animation Prompt
            </label>
            <Textarea
              id="prompt"
              placeholder="e.g. Show the Pythagorean theorem visually..."
              className="text-white bg-zinc-800 resize-none h-[120px] border border-zinc-700 placeholder:text-zinc-400"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button
              className="mt-2 w-full md:w-auto border border-white hover:shadow-[0_0_10px_white]"
              onClick={handleGenerate}
            >
              Generate Animation
            </Button>
          </div>

          {/* Right: Video Preview and Download */}
          <div className="flex-1 space-y-4">
            <div className="aspect-[16/9] w-full bg-zinc-900 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-zinc-500">[Video Preview Placeholder]</span>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" className="bg-white text-black hover:bg-zinc-200">
                Download Video
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
