import path from "path";
import { promises as fs } from "fs";
import { FeedClient } from "@/components/feed/FeedClient";

async function loadVideos() {
  const publicDir = path.join(process.cwd(), "public", "videos");

  try {
    const entries = await fs.readdir(publicDir);
    const mp4s = entries.filter((file) => file.toLowerCase().endsWith(".mp4"));

    if (mp4s.length === 0) {
      throw new Error("No video files in public/videos");
    }

    return mp4s.map((file, index) => {
      const base = file.replace(/_/g, " ").replace(/\.[^.]+$/, "");
      const title = base.length > 48 ? `${base.slice(0, 45)}…` : base;

      return {
        id: `video-${index}`,
        src: `/videos/${file}`,
        title,
        description: "Swipe through curated BodyVerse shorts engineered for landscape-first viewing."
      };
    });
  } catch (error) {
    console.warn("[feed] Falling back to demo playlist", error);
    return [
      {
        id: "demo-1",
        src: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
        title: "Demo: Mt Baker",
        description: "A landscape-first highlight while we prepare your local library."
      },
      {
        id: "demo-2",
        src: "https://storage.googleapis.com/coverr-main/mp4/Street-Lights.mp4",
        title: "Demo: Street Lights",
        description: "Nighttime vibes to preview the feed experience."
      }
    ];
  }
}

export default async function FeedPage() {
  const videos = await loadVideos();

  return (
    <main className="min-h-screen bg-black text-white">
      <FeedClient videos={videos} />
    </main>
  );
}
