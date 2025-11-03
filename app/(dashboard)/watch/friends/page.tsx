export default function FriendsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Discord friends</h1>
      <p className="text-sm text-slate-300">
        Trigger a fresh sync from Discord to invite your guild members into sessions. We’ll cache profiles in Supabase so you
        can @mention friends quickly.
      </p>
      <div className="rounded-2xl border border-dashed border-white/20 p-12 text-center text-slate-400">
        Friend sync tools coming soon.
      </div>
    </div>
  );
}
