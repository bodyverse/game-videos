"use client";

import { useState } from "react";
import Image from "next/image";
import { FriendSyncForm, SyncedFriend } from "@/components/friends/FriendSyncForm";

function getAvatarUrl(friend: SyncedFriend) {
  if (friend.avatar) {
    return `https://cdn.discordapp.com/avatars/${friend.discordId}/${friend.avatar}.png?size=96`;
  }
  return "https://cdn.discordapp.com/embed/avatars/0.png";
}

type FriendsClientProps = {
  supabaseEnabled: boolean;
  initialFriends: SyncedFriend[];
  initialError?: string | null;
};

export function FriendsClient({ supabaseEnabled, initialFriends, initialError = null }: FriendsClientProps) {
  const [friends, setFriends] = useState<SyncedFriend[]>(initialFriends);
  const [error, setError] = useState<string | null>(initialError);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">Discord friends</h1>
        <p className="text-sm text-slate-300">
          Sync a Discord server you share with your crew and we&apos;ll pull the member list instantly.
          {supabaseEnabled
            ? " The roster is cached in Supabase so future sessions can reuse it."
            : " Data isn&apos;t persisted while Supabase is disabled."}
        </p>
      </header>

      <FriendSyncForm
        supabaseEnabled={supabaseEnabled}
        onResult={(members) => {
          setFriends(members);
          setError(null);
        }}
        onError={(message) => {
          setError(message || null);
        }}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          {friends.length > 0 ? `Members (${friends.length})` : "Members"}
        </h2>
        {error ? (
          <div className="rounded-2xl border border-dashed border-rose-300/40 bg-rose-400/10 p-10 text-center text-rose-200">
            {error}
          </div>
        ) : friends.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 p-10 text-center text-slate-400">
            No members loaded yet. Enter a Discord server ID above to fetch the roster.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {friends.map((friend) => (
              <li
                key={friend.discordId}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-sm"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-slate-800">
                  <Image src={getAvatarUrl(friend)} alt={friend.username} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="font-medium text-white">{friend.globalName ?? friend.username}</span>
                  <span className="text-xs text-slate-400">@{friend.username}</span>
                  <span className="text-xs text-slate-500">ID: {friend.discordId}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
