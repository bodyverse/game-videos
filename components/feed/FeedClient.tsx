"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { IconPlay, IconReaction, IconThumbDown, IconThumbUp } from "@/components/icons";
import { useAvatarReactionStore } from "@/stores/avatarReactionStore";
import { FeedActionStack } from "./ActionStack";

export type FeedVideo = {
  id: string;
  src: string;
  title: string;
  description: string;
};

type FeedClientProps = {
  videos: FeedVideo[];
};

const REACTION_SCENE_PATH = "/reactions/jumping person/RPM_NB_Jet2_Holiday_S_Anim_01.glb";

export function FeedClient({ videos }: FeedClientProps) {
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const videoElements = useRef<Map<string, HTMLVideoElement>>(new Map());
  const cardElements = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const queueReaction = useAvatarReactionStore((state) => state.queueReaction);
  const reactionActive = useAvatarReactionStore((state) => Boolean(state.scenePath));

  const initialCounts = useMemo(() => {
    const counts = new Map<string, { up: number; down: number }>();
    videos.forEach((video, index) => {
      counts.set(video.id, {
        up: 120 + index * 17,
        down: 12 + index * 5
      });
    });
    return counts;
  }, [videos]);

  const [voteCounts, setVoteCounts] = useState<Map<string, { up: number; down: number }>>(initialCounts);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(videos[0]?.id ?? null);
  const handleVote = useCallback((id: string, type: "up" | "down") => {
    setVoteCounts((prev) => {
      const next = new Map(prev);
      const current = next.get(id) ?? { up: 0, down: 0 };
      next.set(id, {
        ...current,
        [type]: current[type] + 1
      });
      return next;
    });
  }, [setActiveVideoId]);

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
    setActiveVideoId((prev) => {
      if (prev && videos.some((video) => video.id === prev)) {
        return prev;
      }
      return videos[0]?.id ?? null;
    });
  }, [videos]);

  useEffect(() => {
    if (activeOverlay && activeOverlay !== activeVideoId) {
      setActiveOverlay(null);
    }
  }, [activeOverlay, activeVideoId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-feed-id");
          if (!id) return;
          const video = videoElements.current.get(id);
          if (!video) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActiveVideoId((prev) => (prev === id ? prev : id));
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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let pointerId: number | null = null;
    let startX = 0;
    let scrollStart = 0;
    let lastDeltaFromStart = 0;
    let isDragging = false;
    let dragStarted = false;
    let animationFrame = 0;

    const stopAnimation = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const restoreSnap = () => {
      container.style.removeProperty("scroll-snap-type");
    };

    const animateTo = (target: number) => {
      stopAnimation();
      const from = container.scrollLeft;
      const distance = target - from;
      if (Math.abs(distance) < 1) {
        container.scrollLeft = target;
        restoreSnap();
        return;
      }
      const duration = 260;
      const startTime = performance.now();
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const step = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        container.scrollLeft = from + distance * easeOutCubic(t);
        if (t < 1) {
          animationFrame = requestAnimationFrame(step);
        } else {
          restoreSnap();
        }
      };

      animationFrame = requestAnimationFrame(step);
    };

    const snapToNearest = (deltaFromStart: number) => {
      const width = container.clientWidth || 1;
      const totalSlides = container.children.length;
      const rawIndex = container.scrollLeft / width;
      let targetIndex = Math.round(rawIndex);

      const threshold = width * 0.15;
      if (Math.abs(deltaFromStart) > threshold) {
        targetIndex = deltaFromStart > 0 ? Math.floor(rawIndex) : Math.ceil(rawIndex);
      }

      targetIndex = Math.max(0, Math.min(targetIndex, totalSlides - 1));
      const target = targetIndex * width;
      animateTo(target);
    };

    const cleanupPointer = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("button, a, [data-prevent-drag]")) return;

      pointerId = event.pointerId;
      startX = event.clientX;
      scrollStart = container.scrollLeft;
      lastDeltaFromStart = 0;
      isDragging = false;
      dragStarted = false;
      stopAnimation();
      container.style.scrollSnapType = "none";

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerEnd);
      window.addEventListener("pointercancel", handlePointerEnd);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const deltaFromStart = event.clientX - startX;

      if (!dragStarted) {
        if (Math.abs(deltaFromStart) < 6) {
          return;
        }
        dragStarted = true;
      }

      if (!isDragging) {
        isDragging = true;
        container.classList.add("cursor-grabbing");
      }

      event.preventDefault();
      container.scrollLeft = scrollStart - deltaFromStart;
      lastDeltaFromStart = deltaFromStart;
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      cleanupPointer();
      container.classList.remove("cursor-grabbing");

      if (isDragging) {
        snapToNearest(lastDeltaFromStart);
      } else {
        restoreSnap();
      }

      pointerId = null;
      isDragging = false;
      dragStarted = false;
      lastDeltaFromStart = 0;
    };

    container.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      cleanupPointer();
      stopAnimation();
      restoreSnap();
    };
  }, []);

  return (
    <>
      <div className="relative flex h-full min-h-screen w-full overflow-hidden bg-black">
        <div
          ref={scrollContainerRef}
          className="flex snap-x snap-mandatory gap-0 overflow-x-auto touch-pan-x cursor-grab"
        >
          {videos.map((video, index) => (
            <FeedVideoCard
              key={video.id}
              video={video}
              index={index}
              overlayOpen={activeOverlay === video.id}
              onCloseOverlay={() => setActiveOverlay(null)}
              registerVideo={registerVideo}
              registerCard={registerCard}
            />
          ))}
        </div>
      </div>
      <FeedActionStack
        key={activeVideoId ?? "none"}
        position="center"
        direction="column"
        className={`fixed right-6 z-50 gap-6 transition-all duration-200 ${
          activeVideoId ? "pointer-events-auto opacity-100 scale-100" : "pointer-events-none opacity-0 scale-90"
        }`}
      >
        <FeedActionStack.Button
          icon={<IconReaction size={23} />}
          label="Open reactions overlay"
          onClick={() => {
            if (activeVideoId) {
              setActiveOverlay(activeVideoId);
            }
          }}
          disabled={reactionActive}
        />
        <FeedActionStack.Button
          icon={<IconThumbUp size={23} />}
          label="Thumbs up"
          onClick={() => {
            if (activeVideoId) {
              handleVote(activeVideoId, "up");
            }
          }}
        />
        <FeedActionStack.Button
          icon={<IconThumbDown size={23} />}
          label="Thumbs down"
          onClick={() => {
            if (activeVideoId) {
              handleVote(activeVideoId, "down");
            }
          }}
        />
      </FeedActionStack>
    </>
  );
}

type FeedVideoCardProps = {
  video: FeedVideo;
  index: number;
  overlayOpen: boolean;
  onCloseOverlay: () => void;
  registerVideo: (id: string, node: HTMLVideoElement | null) => void;
  registerCard: (id: string, node: HTMLElement | null) => void;
};

function FeedVideoCard({
  video,
  index,
  overlayOpen,
  onCloseOverlay,
  registerVideo,
  registerCard
}: FeedVideoCardProps) {
  const queueReaction = useAvatarReactionStore((state) => state.queueReaction);
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
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    setControlsVisible(videoEl.paused);
    setIsPlaying(!videoEl.paused);
    videoEl.muted = false;

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
  }, []);

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
    if (videoEl) {
      videoEl.muted = false;
      videoEl.pause();
      videoEl.currentTime = 0;
    }
    return () => registerVideo(video.id, null);
  }, [registerVideo, video.id]);

  const cardRef = useCallback(
    (node: HTMLElement | null) => {
      registerCard(video.id, node ?? null);
    },
    [registerCard, video.id]
  );

  const togglePlayback = useCallback(
    (options?: { forcePlay?: boolean }) => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      if (options?.forcePlay) {
        videoEl.muted = false;
        videoEl.currentTime = Math.max(videoEl.currentTime, 0);
        videoEl.play().catch(() => { });
        return;
      }

      if (videoEl.paused) {
        videoEl.muted = false;
        void videoEl.play();
      } else {
        videoEl.pause();
      }
    },
    []
  );

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
            if (!hasInteracted) {
              setHasInteracted(true);
              togglePlayback({ forcePlay: true });
            } else {
              togglePlayback();
            }
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
        autoPlay={false}
        controls={controlsVisible}
        className="h-full w-full object-cover"
      />

      {showPlayOverlay ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (!hasInteracted) {
              setHasInteracted(true);
              togglePlayback({ forcePlay: true });
            } else {
              togglePlayback();
            }
          }}
          className="pointer-events-auto absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full bg-black/60 text-white shadow-2xl backdrop-blur transition hover:bg-black/80"
        >
          <IconPlay size={34} />
          <span className="sr-only">Play</span>
        </button>
      ) : null}

      {overlayOpen ? (
        <div
          className="pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur"
          onClick={onCloseOverlay}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              queueReaction(REACTION_SCENE_PATH);
              onCloseOverlay();
            }}
            className="rounded-3xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10"
          >
            <Image
              src="/images/reactions/ReactionJumping.png"
              alt="Jumping reaction"
              width={220}
              height={220}
              className="h-48 w-48 rounded-[3px] object-cover"
              priority
            />
          </button>
        </div>
      ) : null}
    </article>
  );
}
