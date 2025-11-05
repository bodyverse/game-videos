"use client";

import { useMemo } from "react";
import { AvatarLayer } from "@/components/avatar/AvatarLayer";
import { AvatarCameraControls } from "@/components/avatar/AvatarCameraControls";
import { useAvatarCameraStore } from "@/stores/avatarCameraStore";

const DEFAULT_AVATAR_PATH = "/avatar/Rafa 01.glb";

export function AvatarSingleton() {
  const position = useAvatarCameraStore((state) => state.position);
  const fov = useAvatarCameraStore((state) => state.fov);
  const target = useAvatarCameraStore((state) => state.target);
  const controlsEnabled = useAvatarCameraStore((state) => state.controlsEnabled);

  const avatarConfig = useMemo(
    () => ({
      modelPath: DEFAULT_AVATAR_PATH,
      animation: null,
      blendshapes: undefined
    }),
    []
  );

  return (
    <>
      <AvatarLayer
        className={`fixed inset-0 z-40 ${controlsEnabled ? "pointer-events-auto" : "pointer-events-none"}`}
        modelPath={avatarConfig.modelPath}
        animation={avatarConfig.animation}
        blendshapes={avatarConfig.blendshapes}
        camera={{ position, target, fov }}
        controls={controlsEnabled}
      />
      <AvatarCameraControls />
    </>
  );
}
