"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type SyncedFriend = {
  discordId: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
};

type FriendSyncFormProps = {
  onResult?: (friends: SyncedFriend[]) => void;
  onError?: (message: string) => void;
  supabaseEnabled?: boolean;
};

export function FriendSyncForm({ onResult, onError, supabaseEnabled = false }: FriendSyncFormProps) {
  const router = useRouter();
  const [guildId, setGuildId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function handleSync(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!guildId.trim()) {
      setMessage("Enter a Discord guild/server ID to sync.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/discord/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ guildId: guildId.trim() })
      });

      const payload = await response.json();
      console.log("[FriendSyncForm] response", response.status, payload);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to sync");
      }

      const members: SyncedFriend[] = Array.isArray(payload?.members) ? payload.members : [];
      onResult?.(members);
      onError?.("");

      setStatus("success");
      setMessage(
        members.length > 0
          ? `Fetched ${members.length} member${members.length === 1 ? "" : "s"} from Discord.`
          : `Sync succeeded.`
      );
      setGuildId("");

      if (supabaseEnabled) {
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      onError?.(message);
      setStatus("error");
      setMessage(message);
    }
  }

  return (
    <form onSubmit={handleSync} className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <div className="space-y-1">
        <label htmlFor="guildId" className="block text-sm font-medium text-white">
          Discord server (guild) ID
        </label>
        <input
          id="guildId"
          name="guildId"
          value={guildId}
          onChange={(event) => setGuildId(event.target.value)}
          placeholder="e.g. 123456789012345678"
          className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40"
        />
        <p className="text-xs text-slate-400">
          Use the Discord client or Developer Portal to copy the server ID. Members with access will be cached in Supabase.
        </p>
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Syncing…" : "Sync Discord friends"}
      </button>
      {message ? (
        <p
          className={`text-sm ${status === "error" ? "text-rose-300" : "text-emerald-300"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
