import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={session.user?.image ?? ""} alt={session.user?.name ?? "User"} />
        <AvatarFallback>
          {session.user?.name?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <h1 className="text-2xl font-semibold">
        Welcome, {session.user?.name}
      </h1>
    </div>
  )
}
