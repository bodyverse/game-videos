import Link from "next/link";
import { listFeaturedVideos } from "@/lib/videos";
import { VideoCard } from "@/components/video/VideoCard";

export default async function WatchIndexPage() {
  const videos = await listFeaturedVideos();

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Featured watch rooms</h1>
          <p className="text-sm text-slate-300">
            Pick a clip to launch a synced session. You can invite your Discord friends once you&apos;re inside.
          </p>
        </div>
        <Link
          href="/watch/library"
          className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-white/30 hover:text-white"
        >
          Manage library
        </Link>
      </header>
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {videos.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/20 p-12 text-center text-slate-400">
            No videos yet. Use the admin tools or Supabase dashboard to seed your clip collection.
          </div>
        ) : (
          videos.map((video) => <VideoCard key={video.id} video={video} />)
        )}
      </section>
    </div>
  );
}
