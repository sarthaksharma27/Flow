"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { Card, CardContent } from "@/components/ui/card"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 border border-zinc-800 bg-zinc-900 text-white shadow-xl">
        <CardContent className="space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-semibold">Sign in to Flow</h1>
            <p className="text-sm text-zinc-400">Use your Google account to continue</p>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 hover:shadow-md"
            onClick={() => signIn("google")}
          >
            <FcGoogle className="h-5 w-5" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
