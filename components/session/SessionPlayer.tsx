"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { sessionChannel } from "@/lib/realtime";
import { IconBurst, IconFlame, IconLaugh, IconTear } from "@/components/icons";
import { useSessionStore } from "@/stores/sessionStore";
import type { ReactionKind } from "@/stores/sessionStore";

type SessionPlayerProps = {
  sessionId: string;
  video: {
    id: string;
    title: string;
    playback_url: string;
    duration_seconds: number;
  };
  userUid: string;
};

export function SessionPlayer({ sessionId, video, userUid }: SessionPlayerProps) {
  if (process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "true") {
    return (
      <div className="space-y-4 rounded-2xl border border-dashed border-white/20 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-white">Realtime disabled</h2>
        <p className="text-sm text-slate-300">
          Supabase realtime is disabled in this environment, so the shared player is running in solo mode.
        </p>
        <video src={video.playback_url} controls className="w-full rounded-2xl border border-white/10" />
      </div>
    );
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { isPlaying, currentTime, reactions, participants, setPlaying, setCurrentTime, addReaction, setParticipants } =
    useSessionStore();

  const reactionOptions = useMemo(
    () => [
      { key: "laugh" as ReactionKind, label: "Laugh", Icon: IconLaugh },
      { key: "cry" as ReactionKind, label: "Cry", Icon: IconTear },
      { key: "fire" as ReactionKind, label: "Fire", Icon: IconFlame },
      { key: "wow" as ReactionKind, label: "Wow", Icon: IconBurst }
    ],
    []
  );

  const reactionIconByKey = useMemo(
    () =>
      reactionOptions.reduce<Record<ReactionKind, (typeof IconLaugh)>>(
        (acc, option) => {
          acc[option.key] = option.Icon;
          return acc;
        },
        {
          laugh: IconLaugh,
          cry: IconTear,
          fire: IconFlame,
          wow: IconBurst
        }
      ),
    [reactionOptions]
  );

  useEffect(() => {
    const channel = sessionChannel(sessionId);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "playback" }, ({ payload }) => {
        if (payload.action === "play") setPlaying(true);
        if (payload.action === "pause") setPlaying(false);
        if (typeof payload.currentTime === "number" && videoRef.current) {
          videoRef.current.currentTime = payload.currentTime;
          setCurrentTime(payload.currentTime);
        }
      })
      .on("broadcast", { event: "reaction" }, ({ payload }) => {
        if (payload.emoji && payload.userUid) {
          addReaction({
            id: payload.id ?? nanoid(),
            emoji: payload.emoji,
            userUid: payload.userUid,
            timestamp: Date.now()
          });
        }
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, { userUid: string }[]>;
        const members = Object.values(state).flatMap((entries) => entries.map((entry) => entry.userUid));
        setParticipants(Array.from(new Set(members)));
      });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ userUid });
      }
    });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [sessionId, userUid, setCurrentTime, setParticipants, setPlaying, addReaction]);

  const broadcastPlayback = useCallback(
    (action: "play" | "pause") => {
      const channel = channelRef.current;
      channel?.send({
        type: "broadcast",
        event: "playback",
        payload: { action, currentTime: videoRef.current?.currentTime ?? 0, userUid }
      });
    },
    [userUid]
  );

  const handleReaction = useCallback(
    (reactionType: ReactionKind) => {
      const channel = channelRef.current;
      const reaction = {
        id: nanoid(),
        emoji: reactionType,
        userUid,
        timestamp: Date.now()
      };
      addReaction(reaction);
      channel?.send({ type: "broadcast", event: "reaction", payload: reaction });
    },
    [addReaction, userUid]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
          <video
            ref={videoRef}
            src={video.playback_url}
            controls
            playsInline
            className="w-full"
            onPlay={() => {
              setPlaying(true);
              broadcastPlayback("play");
            }}
            onPause={() => {
              setPlaying(false);
              broadcastPlayback("pause");
            }}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
          />
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{video.title}</h2>
            <p className="text-xs text-slate-400">
              {Math.floor(currentTime)}s / {video.duration_seconds}s · {isPlaying ? "Playing" : "Paused"}
            </p>
          </div>
          <div className="flex gap-2">
            {reactionOptions.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/40"
                onClick={() => handleReaction(key)}
              >
                <Icon size={20} />
                <span className="sr-only">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Crew online</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {participants.length === 0 ? (
              <li className="text-slate-400">Waiting for friends to join.</li>
            ) : (
              participants.map((participant) => (
                <li key={participant} className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                  {participant === userUid ? "You" : participant}
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Live reactions</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {reactions.length === 0 ? (
              <li className="text-slate-400">No reactions yet. Tap a reaction to send one.</li>
            ) : (
              reactions.map((event) => {
                const ReactionIcon = reactionIconByKey[event.emoji];
                return (
                  <li
                    key={event.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
                  >
                    <ReactionIcon size={18} />
                    <span className="text-xs text-slate-400">
                      {event.userUid === userUid ? "You" : event.userUid}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}
