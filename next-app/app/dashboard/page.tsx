"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSocket } from "@/lib/socket"; // 👈 WebSocket client singleton

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket:", socket.id);
    });

    socket.on("video:done", ({ videoUrl }) => {
      console.log("🎥 Video Ready:", videoUrl);
      setVideoUrl(videoUrl);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleGenerate = async () => {
    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);
    setVideoUrl("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data = await res.json();
      const rawCode = data.code.replace(/^```(?:\w+)?\n/, "").replace(/```$/, "");
      console.log(rawCode);
      

      const videoRes = await fetch("/api/videoGenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: rawCode }),
      });

      const videoData = await videoRes.json();
      const jobId = videoData.jobId;

      const socket = getSocket();
      socket.emit("join", jobId);
    } catch (err) {
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="text-white p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* User Info Header */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? "User"} />
            <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">Welcome, {session?.user?.name}</h2>
            <p className="text-sm text-zinc-400">Create math animations using simple prompts.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-6 md:space-y-0">
          {/* Left: Input */}
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Animation"
              )}
            </Button>
          </div>

          {/* Right: Video Preview */}
          <div className="flex-1 space-y-4">
            <div className="aspect-[16/9] w-full bg-zinc-900 rounded-xl flex items-center justify-center shadow-md">
              {loading ? (
                <div className="flex flex-col items-center justify-center space-y-3 text-zinc-400">
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm animate-pulse">Generating animation preview...</p>
                </div>
              ) : videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <span className="text-zinc-500">Your preview will appear here</span>
              )}
            </div>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                className="bg-white text-black hover:bg-zinc-200"
                disabled={!videoUrl}
                onClick={() => {
                  if (videoUrl) {
                    const link = document.createElement("a");
                    link.href = videoUrl;
                    link.download = "generated-video.mp4";
                    link.click();
                  }
                }}
              >
                Download Video
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
