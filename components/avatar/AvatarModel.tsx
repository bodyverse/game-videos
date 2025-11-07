"use client";

import { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { LoopRepeat } from "three";
import { AvatarScenePlayer } from "@/components/reactions/AvatarScenePlayer";

type AvatarModelProps = {
  modelPath: string;
  animationUrl?: string | null;
  timeScale?: number;
};

export function AvatarModel({ modelPath, animationUrl, timeScale = 1 }: AvatarModelProps) {
  const { scene } = useGLTF(modelPath, true);

  if (animationUrl) {
    return (
      <Suspense fallback={null}>
        <AvatarScenePlayer
          scenePath={animationUrl}
          targetNodeName="Armature"
          replacement={{ type: "gltf", path: modelPath }}
          autoplay
          timeScale={timeScale}
          loopMode={LoopRepeat}
        />
      </Suspense>
    );
  }

  return <primitive object={scene} dispose={null} />;
}
