"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Html, OrbitControls } from "@react-three/drei";
import {
  AvatarScenePlayer,
  AvatarScenePlayerHandle,
  AvatarScenePlayerState
} from "@/components/reactions/AvatarScenePlayer";
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconChevronDown } from "@/components/icons";

const AVATAR_PATH = "/avatar/Rafa 01.glb";
const TARGET_NODE_NAME = "Armature";

export default function ReactionPreviewPage() {
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerState, setPlayerState] = useState<AvatarScenePlayerState | null>(null);
  const playerRef = useRef<AvatarScenePlayerHandle>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFiles = async () => {
      try {
        setFilesLoading(true);
        setFilesError(null);
        const response = await fetch("/api/reactions");
        if (!response.ok) throw new Error("Failed to load reactions.");
        const data = (await response.json()) as { files: string[] };
        if (!isMounted) return;
        setAvailableFiles(data.files ?? []);
      } catch (error) {
        if (!isMounted) return;
        setFilesError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        if (isMounted) {
          setFilesLoading(false);
        }
      }
    };
    fetchFiles();
    return () => {
      isMounted = false;
    };
  }, []);

  const resetPlayerState = useCallback(() => {
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
    setPlayerState(null);
  }, []);

  const handleSelection = useCallback(
    (value: string) => {
      setSelectedPath(value);
      if (!value) {
        setLoadedPath(null);
        resetPlayerState();
        return;
      }
      setLoadedPath(normalizePublicPath(value));
      resetPlayerState();
    },
    [resetPlayerState]
  );

  const handlePlayerStateChange = useCallback((state: AvatarScenePlayerState) => {
    setPlayerState(state);
    setIsPlaying(state.isPlaying);
    setDuration(state.duration);
    setCurrentTime(state.currentTime);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !playerState?.isReady) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  }, [isPlaying, playerState?.isReady]);

  const handleStop = useCallback(() => {
    if (!playerRef.current || !playerState?.isReady) return;
    playerRef.current.stop();
  }, [playerState?.isReady]);

  const handleScrub = useCallback(
    (value: number) => {
      if (!playerRef.current || !playerState?.isReady) return;
      playerRef.current.seek(value);
    },
    [playerState?.isReady]
  );

  const transportDisabled = !playerState?.isReady;

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <section className="relative grow">
        {loadedPath ? (
          <Canvas
            camera={{ position: [0, 1, 3], fov: 45 }}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 6, 5]} intensity={1.1} castShadow />
            <Suspense
              fallback={
                <Html center>
                  <p className="rounded-full bg-black/70 px-4 py-2 text-sm text-white/80">Loading {loadedPath}…</p>
                </Html>
              }
            >
              <AvatarScenePlayer
                key={loadedPath}
                ref={playerRef}
                scenePath={loadedPath}
                targetNodeName={TARGET_NODE_NAME}
                replacement={{ type: "gltf", path: AVATAR_PATH }}
                autoplay
                onStateChange={handlePlayerStateChange}
              />
              <Environment preset="city" />
              <OrbitControls enablePan enableZoom enableRotate zoomSpeed={0.4} target={[0, 1, 0]} />
            </Suspense>
          </Canvas>
        ) : null}
      </section>
      <footer className="border-t border-white/10 bg-black/70 px-6 py-5">
        {loadedPath ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlayPause}
                disabled={transportDisabled}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40"
              >
                {isPlaying ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
                <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
              </button>
              <button
                type="button"
                onClick={handleStop}
                disabled={transportDisabled}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-40"
              >
                <IconPlayerStop size={18} />
                <span className="sr-only">Stop</span>
              </button>
            </div>
            <div className="flex grow items-center gap-3 text-xs text-white/70">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 0.001)}
                step={0.01}
                value={currentTime}
                onChange={(event) => handleScrub(Number(event.target.value))}
                disabled={transportDisabled}
                className="h-1 w-full cursor-pointer accent-white disabled:cursor-not-allowed"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Reaction file
                <div className="relative mt-1">
                  <select
                    value={selectedPath}
                    onChange={(event) => handleSelection(event.target.value)}
                    className="appearance-none w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 pr-10 text-sm"
                    disabled={filesLoading}
                  >
                    <option value="">None</option>
                    {availableFiles.map((file) => {
                      const label = file.split("/").pop() ?? file;
                      return (
                        <option key={file} value={file}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/60">
                    <IconChevronDown size={16} strokeWidth={1.4} />
                  </span>
                </div>
              </label>
              {filesLoading ? (
                <p className="mt-2 text-xs text-white/60">Scanning public/reactions…</p>
              ) : filesError ? (
                <p className="mt-2 text-xs text-rose-300">{filesError}</p>
              ) : null}
            </div>
          </div>
        )}
      </footer>
    </main>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function normalizePublicPath(input: string) {
  if (!input) return input;
  if (input.startsWith("/public/")) return input.replace(/^\/public\//, "/");
  if (input.startsWith("public/")) return `/${input.replace(/^public\//, "")}`;
  return input;
}
