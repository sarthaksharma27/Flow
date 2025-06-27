import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* User Info */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={session.user?.image ?? ""} alt={session.user?.name ?? "User"} />
            <AvatarFallback>
              {session.user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">
              Welcome, {session.user?.name}
            </h2>
            <p className="text-sm text-zinc-400">Create math animations using simple prompts.</p>
          </div>
        </div>

        {/* Main Interaction Area */}
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-6 md:space-y-0">

          {/* Prompt Input Area */}
        <div className="flex-1 space-y-3">
          <label htmlFor="prompt" className="text-sm font-medium">
            Animation Prompt
          </label>
          <Textarea
            id="prompt"
            placeholder="e.g. Show the Pythagorean theorem visually..."
            className="text-white bg-zinc-800 resize-none h-[120px] border border-zinc-700 placeholder:text-zinc-400"
          />
          <Button
            className="mt-2 w-full md:w-auto border border-white hover:shadow-[0_0_10px_white]"
          >
            Generate Animation
          </Button>
        </div>


          {/* Video Preview and Download */}
          <div className="flex-1 space-y-4">
            <div className="aspect-[16/9] w-full max-w-full bg-zinc-900 rounded-xl flex items-center justify-center shadow-md">
              {/* Replace with actual video later */}
              <span className="text-zinc-500">[Video Preview Placeholder]</span>
              {/* <video src="..." controls className="w-full h-full rounded-xl" /> */}
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
