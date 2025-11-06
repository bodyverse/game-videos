"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PerspectiveCamera } from "three";

type Vector3Tuple = [number, number, number];

type AvatarCameraState = {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov: number;
  controlsEnabled: boolean;
  setPosition: (axis: 0 | 1 | 2, value: number) => void;
  setFov: (value: number) => void;
  setControlsEnabled: (enabled: boolean) => void;
  setFromOrbit: (camera: PerspectiveCamera, target: Vector3Tuple) => void;
  setStaticView: () => void;
  reset: () => void;
};

const DEFAULT_POSITION: Vector3Tuple = [0, 1.45, 2.1];
const DEFAULT_TARGET: Vector3Tuple = [0, 1.25, 0];
const DEFAULT_FOV = 42;
const STATIC_POSITION: Vector3Tuple = [0, 1.6, 2.8];
const STATIC_TARGET: Vector3Tuple = [0, 1.35, 0];
const STATIC_FOV = 38;

export const useAvatarCameraStore = create<AvatarCameraState>()(
  persist(
    (set, get) => ({
      position: DEFAULT_POSITION,
      target: DEFAULT_TARGET,
      fov: DEFAULT_FOV,
      controlsEnabled: false,
      setPosition: (axis, value) =>
        set((state) => {
          const next = [...state.position] as [number, number, number];
          next[axis] = value;
          return { position: next };
        }),
      setFov: (value) => set({ fov: value }),
      setControlsEnabled: (enabled) => set({ controlsEnabled: enabled }),
      setFromOrbit: (camera, target) =>
        set(() => ({
          position: [camera.position.x, camera.position.y, camera.position.z],
          target,
          fov: camera.fov
        })),
      setStaticView: () =>
        set((state) => ({
          position: STATIC_POSITION,
          target: STATIC_TARGET,
          fov: STATIC_FOV,
          controlsEnabled: state.controlsEnabled
        })),
      reset: () =>
        set({
          position: DEFAULT_POSITION,
          target: DEFAULT_TARGET,
          fov: DEFAULT_FOV,
          controlsEnabled: get().controlsEnabled
        })
    }),
    {
      name: "avatar-camera-state",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        position: state.position,
        target: state.target,
        fov: state.fov
      })
    }
  )
);
