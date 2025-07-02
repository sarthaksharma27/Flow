// app/my-videos/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ClientVideos from "@/components/ClientVideos";

export default async function MyVideosPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={session.user?.image ?? ""} />
              <AvatarFallback>{session.user?.name?.charAt(0) ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{session.user?.name}</h2>
              <p className="text-sm text-zinc-400">Your saved animations</p>
            </div>
          </div>
        </div>

        <ClientVideos />
      </div>
    </div>
  );
}
