// components/ClientVideos.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VideoEntry {
  jobId: string;
  videoUrl: string;
}

export default function ClientVideos() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadVideos = async () => {
      const stored = JSON.parse(localStorage.getItem("jobs") || "[]");

      if (!Array.isArray(stored) || stored.length === 0) {
        setError("You haven't created any 2D animation. Go to dashboard to create one.");
        return;
      }

      const sorted = stored.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      try {
        const urls = await Promise.all(
          sorted.map(async ({ jobId }) => {
            const res = await fetch(`/api/video-url?jobId=${jobId}`);
            const data = await res.json();

            // Expecting `videoUrl` from backend
            return res.ok && data.videoUrl ? { jobId, videoUrl: data.videoUrl } : null;
          })
        );

        const filtered = urls.filter(Boolean) as VideoEntry[];
        if (filtered.length === 0) {
          setError("No videos available. They might still be processing.");
        } else {
          setVideos(filtered);
        }
      } catch (err) {
        setError("Something went wrong while fetching videos.");
      }
    };

    loadVideos();
  }, []);

  if (error) {
    return (
      <div className="text-zinc-400 space-y-4">
        <p>{error}</p>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (videos.length === 0) {
    return <p className="text-zinc-400">Loading your videos...</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map(({ jobId, videoUrl }) => (
        <Card key={jobId} className="bg-zinc-900 border border-zinc-800 shadow-xl">
          <CardContent className="p-4">
            <div className="aspect-video mb-2">
              <video
                src={videoUrl}
                controls
                className="rounded-xl w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-zinc-500 break-all">Job ID: {jobId}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
