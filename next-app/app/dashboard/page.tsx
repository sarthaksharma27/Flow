"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Sparkles } from "lucide-react";
import { getSocket } from "@/lib/socket";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [validationError, setValidationError] = useState(""); // ✨ New state

  const magicPrompts = [
    "Animate a basic client-server interaction: a browser sends a request to a server, the server processes it and returns a response, highlighting HTTP flow and endpoints.",
    "Show a binary tree and animate an in-order traversal, highlighting each visited node in order (left, root, right).",
    "Show a simple neural network (input, hidden, and output layers), animating the forward pass of data with weights and activations.",
    "Animate the TCP handshake: SYN, SYN-ACK, ACK between client and server, highlighting packets and sequence numbers.",
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
       console.log("websocket connected");
       
    });

    socket.on("video:done", ({ videoUrl }) => {
      setLoading(false);
      console.log("video URL recived from server");
      setVideoUrl(videoUrl);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev === 0 ? 1 : 0));
    }, 10000);

    return () => clearInterval(interval);
  }, [loading]);

  // ✨ Auto-dismiss validation error
  useEffect(() => {
    if (validationError) {
      const timeout = setTimeout(() => setValidationError(""), 4000);
      return () => clearTimeout(timeout);
    }
  }, [validationError]);

  const handleGenerate = async () => {
    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);
    setVideoUrl("");
    setValidationError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      const data = await res.json();

      if (res.status === 422 || res.status === 400) {
        setLoading(false);
        setValidationError(data.error || "Prompt invalid");
        return;
      }

      const rawCode = data.code.replace(/^```(?:\w+)?\n/, "").replace(/```$/, "");

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
      setLoading(false);
      console.error("❌ Error:", err);
      setValidationError("Something went wrong while generating animation.");
    }
  };

  if (status === "loading") {
    return <div className="text-white p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <Button
            variant="link"
            className="p-0 text-white hover:underline"
            onClick={() => router.push("/")}
          >
            ← Go Back Home
          </Button>

          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? "User"} />
              <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">Welcome, {session?.user?.name}</h2>
              <p className="text-sm text-zinc-400">Create animations using simple prompts.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-8 space-y-6 md:space-y-0">
          <div className="flex-1 space-y-3">
            <label htmlFor="prompt" className="text-sm font-medium">
              Animation Prompt
            </label>

            <div className="relative">
              <Textarea
                id="prompt"
                placeholder="e.g. Animate the TCP handshake"
                className="text-white bg-zinc-800 resize-none h-[120px] border border-zinc-700 placeholder:text-zinc-400 pr-10"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              {/* ✨ Magic Prompt Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1 rounded-md hover:bg-zinc-700 transition"
                    title="Insert magic prompt"
                  >
                    <Sparkles className="w-5 h-5 text-zinc-300" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  className="bg-zinc-900 border-zinc-700 w-80 space-y-1 p-2 rounded-md shadow-lg"
                >
                  <p className="text-sm text-zinc-400 mb-1">Choose a sample prompt:</p>
                  {magicPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(item)}
                      className="text-left w-full text-sm text-zinc-200 hover:bg-zinc-800 rounded-md px-2 py-1"
                    >
                      {item}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* ✨ Validation Error Popover */}
              {validationError && (
                <Popover open={!!validationError}>
                  <PopoverTrigger asChild>
                    <div />
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    className="bg-red-900 border border-red-700 text-white max-w-sm rounded-md p-3"
                  >
                    <p className="text-sm">{validationError}</p>
                  </PopoverContent>
                </Popover>
              )}
            </div>

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

          {/* Preview Section */}
          <div className="flex-1 space-y-4">
            <div className="aspect-[16/9] w-full bg-zinc-900 rounded-xl flex items-center justify-center shadow-md">
              {loading ? (
                <div className="flex flex-col items-center justify-center space-y-3 text-zinc-400">
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm animate-pulse text-center">
                    {loadingMessageIndex === 0
                      ? "Generating animation preview..."
                      : "This may take some extra time as we are using the DeepSeek model."}
                  </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
