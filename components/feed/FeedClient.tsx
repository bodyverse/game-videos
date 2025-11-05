"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";

export type FeedVideo = {
  id: string;
  src: string;
  title: string;
  description: string;
};

type FeedClientProps = {
  videos: FeedVideo[];
};

export function FeedClient({ videos }: FeedClientProps) {
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const videoElements = useRef<Map<string, HTMLVideoElement>>(new Map());
  const cardElements = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const initialCounts = useMemo(() => {
    const counts = new Map<string, number>();
    videos.forEach((video, index) => {
      counts.set(video.id, 120 + index * 17);
    });
    return counts;
  }, [videos]);

  const [loveCounts, setLoveCounts] = useState<Map<string, number>>(initialCounts);

  const registerVideo = useCallback((id: string, node: HTMLVideoElement | null) => {
    const map = videoElements.current;
    if (!node) {
      map.delete(id);
    } else {
      map.set(id, node);
    }
  }, []);

  const registerCard = useCallback((id: string, node: HTMLElement | null) => {
    const map = cardElements.current;
    const existing = map.get(id);
    if (existing && !node) {
      observerRef.current?.unobserve(existing);
      map.delete(id);
      return;
    }

    if (node) {
      map.set(id, node);
      if (observerRef.current) {
        observerRef.current.observe(node);
      }
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-feed-id");
          if (!id) return;
          const video = videoElements.current.get(id);
          if (!video) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => {
              if (!video.muted) {
                video.muted = true;
                video.play().catch(() => {
                  /* autoplay blocked even when muted */
                });
              }
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0.4, 0.6, 0.9] }
    );

    observerRef.current = observer;
    cardElements.current.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, []);

  const handleLove = (id: string) => {
    setLoveCounts((prev) => {
      const next = new Map(prev);
      next.set(id, (next.get(id) ?? 0) + 1);
      return next;
    });
  };

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden bg-black">
      <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto touch-pan-x">
        {videos.map((video, index) => (
          <FeedVideoCard
            key={video.id}
            video={video}
            index={index}
            loves={loveCounts.get(video.id) ?? 0}
            onLove={() => handleLove(video.id)}
            overlayOpen={activeOverlay === video.id}
            onOpenOverlay={() => setActiveOverlay(video.id)}
            onCloseOverlay={() => setActiveOverlay(null)}
            registerVideo={registerVideo}
            registerCard={registerCard}
          />
        ))}
      </div>
    </div>
  );
}

type FeedVideoCardProps = {
  video: FeedVideo;
  index: number;
  loves: number;
  onLove: () => void;
  overlayOpen: boolean;
  onOpenOverlay: () => void;
  onCloseOverlay: () => void;
  registerVideo: (id: string, node: HTMLVideoElement | null) => void;
  registerCard: (id: string, node: HTMLElement | null) => void;
};

function FeedVideoCard({
  video,
  index,
  loves,
  onLove,
  overlayOpen,
  onOpenOverlay,
  onCloseOverlay,
  registerVideo,
  registerCard
}: FeedVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pointerDataRef = useRef<{
    x: number;
    y: number;
    pointerId: number;
    isTap: boolean;
    timestamp: number;
  } | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    setControlsVisible(videoEl.paused);
    setIsPlaying(!videoEl.paused);
    videoEl.muted = isMuted;

    const handlePlay = () => {
      setIsPlaying(true);
      setControlsVisible(false);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setControlsVisible(true);
    };

    videoEl.addEventListener("play", handlePlay);
    videoEl.addEventListener("pause", handlePause);

    return () => {
      videoEl.removeEventListener("play", handlePlay);
      videoEl.removeEventListener("pause", handlePause);
    };
  }, [isMuted]);

  useEffect(() => {
    if (isPlaying) {
      setShowPlayOverlay(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowPlayOverlay(true);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [isPlaying]);

  useEffect(() => {
    const videoEl = videoRef.current;
    registerVideo(video.id, videoEl);
    return () => registerVideo(video.id, null);
  }, [registerVideo, video.id]);

  const cardRef = useCallback(
    (node: HTMLElement | null) => {
      registerCard(video.id, node ?? null);
    },
    [registerCard, video.id]
  );

  const togglePlayback = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = isMuted;
    if (videoEl.paused) {
      void videoEl.play();
    } else {
      videoEl.pause();
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.muted = next;
        if (!next) {
          void videoEl.play().catch(() => {
            videoEl.muted = true;
            setIsMuted(true);
          });
        }
      }
      return next;
    });
  }, []);

  return (
    <article
      ref={cardRef}
      data-feed-id={video.id}
      className="relative flex h-screen w-screen shrink-0 snap-center touch-pan-x items-center justify-center bg-black"
      onPointerDown={(event) => {
        const target = event.target as HTMLElement | null;
        const isVideo = target?.tagName === "VIDEO";
        const isCardSurface = target === event.currentTarget;
        if (!isVideo && !isCardSurface) {
          pointerDataRef.current = null;
          return;
        }

        pointerDataRef.current = {
          x: event.clientX,
          y: event.clientY,
          pointerId: event.pointerId,
          isTap: true,
          timestamp: performance.now()
        };
      }}
      onPointerMove={(event) => {
        const data = pointerDataRef.current;
        if (!data || data.pointerId !== event.pointerId) return;
        if (data.isTap) {
          const dx = Math.abs(event.clientX - data.x);
          const dy = Math.abs(event.clientY - data.y);
          if (dx > 12 || dy > 12) {
            data.isTap = false;
          }
        }
      }}
      onPointerUp={(event) => {
        const data = pointerDataRef.current;
        if (data && data.pointerId === event.pointerId && data.isTap) {
          const delta = performance.now() - data.timestamp;
          if (delta < 250) {
            togglePlayback();
          }
        }
        pointerDataRef.current = null;
      }}
      onPointerCancel={() => {
        pointerDataRef.current = null;
      }}
    >
      <video
        ref={videoRef}
        src={video.src}
        playsInline
        preload="metadata"
        loop
        autoPlay={index === 0}
        controls={controlsVisible}
        className="h-full w-full object-cover"
      />

      {showPlayOverlay ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            togglePlayback();
          }}
          className="pointer-events-auto absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full bg-black/60 text-white shadow-2xl backdrop-blur transition hover:bg-black/80"
        >
          ▶
          <span className="sr-only">Play</span>
        </button>
      ) : null}

      <div className="pointer-events-auto absolute bottom-24 right-6 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleMute();
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white shadow-lg shadow-brand-500/30 transition hover:bg-white/25"
        >
          {isMuted ? "🔇" : "🔊"}
          <span className="sr-only">{isMuted ? "Unmute video" : "Mute video"}</span>
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenOverlay();
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white shadow-lg shadow-brand-500/50 transition hover:bg-white/25"
        >
          ⚡️
          <span className="sr-only">Open reactions overlay</span>
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onLove();
          }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400"
        >
          <span className="text-2xl">❤</span>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
            {loves}
          </span>
        </button>
      </div>

      {overlayOpen ? (
        <div
          className="pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur"
          onClick={onCloseOverlay}
        >
          <div
            className="w-[min(520px,90vw)] space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-left text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-semibold">React in style</h2>
            <p className="text-sm text-slate-300">
              Send a dramatic reaction, drop into a watch room, or ping a friend to jump into this clip with you.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Laugh Riot", description: "Spam laugh track & confetti." },
                { label: "Summon Crew", description: "Invite your top 3 friends." },
                { label: "Avatar Flair", description: "Trigger avatar emotes." },
                { label: "Share Clip", description: "Copy + drop in Discord." }
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm transition hover:bg-white/20"
                >
                  <p className="font-medium">{action.label}</p>
                  <p className="text-xs text-slate-300">{action.description}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onCloseOverlay}
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/25"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
