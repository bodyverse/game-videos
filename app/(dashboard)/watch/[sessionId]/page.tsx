import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { supabaseServerClient } from "@/lib/supabaseServerClient";
import { SessionPlayer } from "@/components/session/SessionPlayer";

const supabaseEnabled = process.env.SUPABASE_ENABLED === "true";

type SessionParams = {
  params: {
    sessionId: string;
  };
};

export default async function WatchSessionPage({ params }: SessionParams) {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  if (!supabaseEnabled) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Session control</h1>
          <p className="text-sm text-slate-300">
            Supabase is disabled in this environment. Enable it to load real session data.
          </p>
        </div>
      </div>
    );
  }

  const supabase = supabaseServerClient();

  const { data, error } = await supabase
    .from("video_sessions")
    .select("id, status, video:videos(id,title,playback_url,duration_seconds)")
    .eq("id", params.sessionId)
    .single();

  if (error || !data) {
    console.error("[WatchSessionPage] failed to load session", error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Session control</h1>
        <p className="text-sm text-slate-300">
          Status: <span className="uppercase tracking-wide text-brand-300">{data.status}</span>
        </p>
      </div>
      {data.video ? (
        <SessionPlayer sessionId={data.id} video={data.video} userUid={session.user.id} />
      ) : (
        <div className="rounded-2xl border border-dashed border-white/20 p-12 text-center text-slate-400">
          This session has no video linked yet.
        </div>
      )}
    </div>
  );
}
