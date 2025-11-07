"use client";

import { useMemo } from "react";
import { AvatarLayer } from "@/components/avatar/AvatarLayer";
import { AvatarCameraControls } from "@/components/avatar/AvatarCameraControls";
import { useAvatarCameraStore } from "@/stores/avatarCameraStore";
import { useAvatarExperienceStore } from "@/stores/avatarExperienceStore";

const DEFAULT_AVATAR_PATH = "/avatar/Rafa 01.glb";
const DEFAULT_ANIMATION_PATH = "/animations/RPM_Female_Idle_01.glb";

export function AvatarSingleton() {
  const position = useAvatarCameraStore((state) => state.position);
  const fov = useAvatarCameraStore((state) => state.fov);
  const target = useAvatarCameraStore((state) => state.target);
  const controlsEnabled = useAvatarCameraStore((state) => state.controlsEnabled);
  const avatarVisible = useAvatarExperienceStore((state) => state.avatarVisible);

  const avatarConfig = useMemo(
    () => ({
      modelPath: DEFAULT_AVATAR_PATH,
      animationUrl: DEFAULT_ANIMATION_PATH,
      blendshapes: undefined
    }),
    []
  );

  return (
    <>
      <AvatarLayer
        className={`fixed inset-0 z-40 ${controlsEnabled ? "pointer-events-auto" : "pointer-events-none"}`}
        modelPath={avatarConfig.modelPath}
        animationUrl={avatarConfig.animationUrl}
        visible={avatarVisible}
        camera={{ position, target, fov }}
        controls={controlsEnabled}
      />
      <AvatarCameraControls />
    </>
  );
}
