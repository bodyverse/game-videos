"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Object3D, AnimationAction, AnimationClip } from "three";
import { AnimationMixer } from "three";
import { SkeletonUtils } from "three-stdlib";

type GltfReplacement = { type: "gltf"; path: string };
type SceneReplacement = { type: "sceneNode"; nodeName: string };

export type AvatarReplacementSource = GltfReplacement | SceneReplacement;

export type AvatarScenePlayerState = {
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
};

export type AvatarScenePlayerHandle = {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  getState: () => AvatarScenePlayerState;
};

export type AvatarScenePlayerProps = {
  scenePath: string;
  targetNodeName: string;
  replacement?: AvatarReplacementSource;
  animationIndex?: number;
  autoplay?: boolean;
  timeScale?: number;
  loopMode?: number;
  onStateChange?: (state: AvatarScenePlayerState) => void;
  audioUrl?: string | null;
};

const LOOP_CONSTANTS = THREE as unknown as { LoopOnce?: number; LoopRepeat?: number };
const LOOP_ONCE = LOOP_CONSTANTS.LoopOnce ?? 2200;
const LOOP_REPEAT = LOOP_CONSTANTS.LoopRepeat ?? 2201;
const initialState: AvatarScenePlayerState = {
  isReady: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  progress: 0
};

type ThreeAudioModule = typeof THREE & {
  Audio?: new (listener: unknown) => {
    setBuffer: (buffer: AudioBuffer) => void;
    setLoop: (loop: boolean) => void;
    setPlaybackRate: (value: number) => void;
    play: () => void;
    stop: () => void;
  };
  AudioListener?: new () => { position?: THREE.Vector3 };
  AudioLoader?: new () => {
    load: (
      url: string,
      onLoad: (buffer: AudioBuffer) => void,
      onProgress?: (event: ProgressEvent<EventTarget>) => void,
      onError?: (error: unknown) => void
    ) => void;
  };
};

const THREE_AUDIO = THREE as ThreeAudioModule;

function ReplacementLoader({ path, onLoaded }: { path: string; onLoaded: (scene: Object3D | null) => void }) {
  const gltf = useGLTF(path);
  useEffect(() => {
    onLoaded(SkeletonUtils.clone(gltf.scene));
    return () => onLoaded(null);
  }, [gltf, onLoaded]);
  return null;
}

export const AvatarScenePlayer = forwardRef<AvatarScenePlayerHandle, AvatarScenePlayerProps>(function AvatarScenePlayer(
  { scenePath, targetNodeName, replacement, animationIndex = 0, autoplay = true, timeScale = 1, loopMode, onStateChange, audioUrl },
  ref
) {
  const { camera } = useThree();
  const sceneGLTF = useGLTF(scenePath);
  const clonedScene = useMemo(() => SkeletonUtils.clone(sceneGLTF.scene), [sceneGLTF.scene]);
  const placeholderRef = useRef<Object3D | null>(null);
  const mountedCloneRef = useRef<Object3D | null>(null);
  const [avatarTemplate, setAvatarTemplate] = useState<Object3D | null>(null);
  const [avatarInstance, setAvatarInstance] = useState<Object3D | null>(null);
  const [, setPlayerState] = useState<AvatarScenePlayerState>(initialState);
  const stateRef = useRef(initialState);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionRef = useRef<AnimationAction | null>(null);
  const playingRef = useRef(false);
  const lastEmitRef = useRef(0);
  const audioListenerRef = useRef<unknown>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioRef = useRef<unknown>(null);
  const clipDurationRef = useRef(0);

  const emitState = useCallback(
    (next: AvatarScenePlayerState) => {
      stateRef.current = next;
      setPlayerState(next);
      onStateChange?.(next);
    },
    [onStateChange]
  );

  const stopAudio = useCallback(() => {
    const current = audioRef.current as { stop?: () => void } | null;
    if (current?.stop) {
      current.stop();
    }
    audioRef.current = null;
  }, []);

  const playAudio = useCallback(() => {
    if (!audioBufferRef.current || !audioListenerRef.current || !THREE_AUDIO.Audio) return;
    const listener = audioListenerRef.current as unknown;
    const audio = new THREE_AUDIO.Audio(listener);
    audio.setBuffer(audioBufferRef.current);
    audio.setLoop(false);
    audio.setPlaybackRate(timeScale);
    audio.play();
    audioRef.current = audio;
  }, [timeScale]);

  useEffect(() => {
    if (!THREE_AUDIO.AudioListener) return;
    const listener = new THREE_AUDIO.AudioListener();
    camera.add(listener as THREE.Object3D);
    audioListenerRef.current = listener;
    return () => {
      camera.remove(listener as THREE.Object3D);
      audioListenerRef.current = null;
    };
  }, [camera]);

  useEffect(() => {
    if (!audioUrl || !THREE_AUDIO.AudioLoader) {
      audioBufferRef.current = null;
      return;
    }
    let cancelled = false;
    const loader = new THREE_AUDIO.AudioLoader();
    loader.load(
      audioUrl,
      (buffer: AudioBuffer) => {
        if (cancelled) return;
        audioBufferRef.current = buffer;
        if (clipDurationRef.current > 0 && buffer.duration > clipDurationRef.current + 0.05) {
          console.warn(
            `[AvatarScenePlayer] Audio (${buffer.duration.toFixed(2)}s) longer than clip (${clipDurationRef.current.toFixed(2)}s). Audio will be truncated.`
          );
        }
        if (playingRef.current) {
          playAudio();
        }
      },
      undefined,
      (error: unknown) => {
        if (!cancelled) {
          console.warn("[AvatarScenePlayer] Failed to load audio", error);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [audioUrl, playAudio]);

  useEffect(() => {
    const target = clonedScene.getObjectByName(targetNodeName);
    if (!target) {
      console.warn(`[AvatarScenePlayer] target node "${targetNodeName}" not found.`);
      return;
    }
    placeholderRef.current = target;
    return () => {
      placeholderRef.current = null;
    };
  }, [clonedScene, targetNodeName]);

  const handleReplacementLoaded = useCallback(
    (scene: Object3D | null) => {
      if (replacement?.type === "gltf") {
        setAvatarTemplate(scene);
      }
    },
    [replacement?.type]
  );

  useEffect(() => {
    if (!replacement) {
      setAvatarTemplate(null);
      return;
    }

    if (replacement.type === "sceneNode") {
      const sourceNode = sceneGLTF.scene.getObjectByName(replacement.nodeName);
      if (!sourceNode) {
        console.warn(`[AvatarScenePlayer] replacement node "${replacement.nodeName}" not found.`);
        setAvatarTemplate(null);
        return;
      }
      setAvatarTemplate(SkeletonUtils.clone(sourceNode));
    }
  }, [replacement, sceneGLTF.scene]);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    if (!placeholder || !avatarTemplate) return;

    if (mountedCloneRef.current) {
      placeholder.remove(mountedCloneRef.current);
      mountedCloneRef.current = null;
    }

    const clone = SkeletonUtils.clone(avatarTemplate);
    placeholder.clear();
    placeholder.add(clone);
    mountedCloneRef.current = clone;
    setAvatarInstance(clone);

    return () => {
      placeholder.remove(clone);
      if (mountedCloneRef.current === clone) {
        mountedCloneRef.current = null;
      }
      setAvatarInstance(null);
    };
  }, [avatarTemplate]);

  useEffect(() => {
    if (avatarTemplate) return;
    if (mountedCloneRef.current && placeholderRef.current) {
      placeholderRef.current.remove(mountedCloneRef.current);
      mountedCloneRef.current = null;
    }
    setAvatarInstance(null);
  }, [avatarTemplate]);

  const retargetedClips = useMemo(() => {
    if (!avatarInstance) return [];
    return sceneGLTF.animations.map((clip: AnimationClip) => {
      try {
        const sourceClip = clip.clone();
        const result = SkeletonUtils.retargetClip(avatarInstance, sceneGLTF.scene, sourceClip);
        result.name = clip.name;
        return result;
      } catch (error) {
        console.warn("[AvatarScenePlayer] Failed to retarget clip, using original.", error);
        return clip;
      }
    });
  }, [avatarInstance, sceneGLTF.animations, sceneGLTF.scene]);

  useEffect(() => {
    if (!avatarInstance || retargetedClips.length === 0) {
      emitState(initialState);
      mixerRef.current = null;
      actionRef.current = null;
      playingRef.current = false;
      stopAudio();
      return;
    }

    const mixer = new AnimationMixer(avatarInstance);
    mixerRef.current = mixer;
    const clip = retargetedClips[Math.min(animationIndex, retargetedClips.length - 1)];
    clipDurationRef.current = clip.duration / timeScale;
    const action = mixer.clipAction(clip, avatarInstance);
    action.timeScale = timeScale;
    const resolvedLoopMode = loopMode ?? LOOP_REPEAT;
    const repetitions = resolvedLoopMode === LOOP_ONCE ? 1 : Infinity;
    action.setLoop(resolvedLoopMode, repetitions);
    action.clampWhenFinished = resolvedLoopMode === LOOP_ONCE;
    action.enabled = true;
    actionRef.current = action;

    if (autoplay) {
      action.reset().play();
      playingRef.current = true;
      playAudio();
    } else {
      action.play();
      action.paused = true;
      playingRef.current = false;
    }

    emitState({
      isReady: true,
      isPlaying: autoplay,
      currentTime: 0,
      duration: clip.duration,
      progress: 0
    });

    return () => {
      action.stop();
      mixer.stopAllAction();
      mixer.uncacheAction(clip, avatarInstance);
      actionRef.current = null;
      mixerRef.current = null;
      playingRef.current = false;
      stopAudio();
    };
  }, [avatarInstance, retargetedClips, animationIndex, autoplay, loopMode, timeScale, emitState, playAudio, stopAudio]);

  const play = useCallback(() => {
    const action = actionRef.current;
    if (!action) return;
    action.paused = false;
    action.play();
    playingRef.current = true;
    playAudio();
    emitState({ ...stateRef.current, isPlaying: true });
  }, [emitState, playAudio]);

  const pause = useCallback(() => {
    const action = actionRef.current;
    if (!action) return;
    action.paused = true;
    playingRef.current = false;
    stopAudio();
    emitState({ ...stateRef.current, isPlaying: false });
  }, [emitState, stopAudio]);

  const stop = useCallback(() => {
    const action = actionRef.current;
    const mixer = mixerRef.current;
    if (!action || !mixer) return;
    action.stop();
    action.reset();
    action.play();
    action.paused = true;
    mixer.setTime(0);
    playingRef.current = false;
    stopAudio();
    emitState({ ...stateRef.current, isPlaying: false, currentTime: 0, progress: 0 });
  }, [emitState, stopAudio]);

  const seek = useCallback(
    (seconds: number) => {
      const action = actionRef.current;
      const mixer = mixerRef.current;
      if (!action || !mixer) return;
      const duration = action.getClip()?.duration ?? 0;
      const clamped = duration > 0 ? Math.max(0, Math.min(seconds, duration)) : 0;
      action.time = clamped;
      mixer.setTime(clamped);
      emitState({
        ...stateRef.current,
        currentTime: clamped,
        duration,
        progress: duration > 0 ? clamped / duration : 0
      });
    },
    [emitState]
  );

  useImperativeHandle(
    ref,
    () => ({
      play,
      pause,
      stop,
      seek,
      getState: () => stateRef.current
    }),
    [pause, play, seek, stop]
  );

  useFrame((_, delta) => {
    const mixer = mixerRef.current;
    const action = actionRef.current;
    if (!mixer || !action) return;

    if (playingRef.current) {
      mixer.update(delta);
    }

    const clip = action.getClip();
    if (!clip) return;
    const duration = clip.duration;
    const resolvedLoopMode = loopMode ?? LOOP_REPEAT;
    const time = resolvedLoopMode === LOOP_ONCE ? Math.min(action.time, duration) : action.time % duration;

    if (playingRef.current && resolvedLoopMode === LOOP_ONCE && time >= duration - 1e-3) {
      playingRef.current = false;
      action.paused = true;
      stopAudio();
      emitState({
        isReady: stateRef.current.isReady,
        isPlaying: false,
        currentTime: duration,
        duration,
        progress: 1
      });
      return;
    }

    const now = performance.now();
    if (now - lastEmitRef.current > 40) {
      lastEmitRef.current = now;
      emitState({
        isReady: stateRef.current.isReady,
        isPlaying: playingRef.current,
        currentTime: time,
        duration,
        progress: duration > 0 ? time / duration : 0
      });
    }
  });

  return (
    <>
      {replacement?.type === "gltf" ? (
        <ReplacementLoader path={replacement.path} onLoaded={handleReplacementLoaded} />
      ) : null}
      <primitive object={clonedScene} />
    </>
  );
});
