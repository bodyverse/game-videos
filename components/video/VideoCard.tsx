import Image from "next/image";
import Link from "next/link";

export type VideoSummary = {
  id: string;
  title: string;
  playback_url: string;
  duration_seconds: number;
  thumbnail_url: string | null;
  tags: string[] | null;
};

export function VideoCard({ video }: { video: VideoSummary }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
      <div className="relative aspect-video w-full bg-slate-800">
        {video.thumbnail_url ? (
          <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover" sizes="(min-width: 768px) 280px, 100vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">Preview coming soon</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold text-white">{video.title}</h3>
          <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-300">
            {Math.round(video.duration_seconds)}s
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {video.tags?.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300">
              #{tag}
            </span>
          ))}
        </div>
        <Link
          href={`/watch/${video.id}`}
          className="mt-auto inline-flex items-center justify-center rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-400"
        >
          Start session
        </Link>
      </div>
    </article>
  );
}
