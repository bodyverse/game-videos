"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, OrbitControls } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useAvatarCameraStore } from "@/stores/avatarCameraStore";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { AvatarModel } from "@/components/avatar/AvatarModel";
import { AvatarScenePlayer } from "@/components/reactions/AvatarScenePlayer";
import { useAvatarReactionStore } from "@/stores/avatarReactionStore";

type TouchMapping = {
  ROTATE: number;
  PAN: number;
  DOLLY_PAN: number;
  DOLLY_ROTATE: number;
};

const TOUCH: TouchMapping =
  (THREE as unknown as { TOUCH?: TouchMapping }).TOUCH ?? {
    ROTATE: 0,
    PAN: 1,
    DOLLY_PAN: 2,
    DOLLY_ROTATE: 3
  };

type Vector3Tuple = [number, number, number];
const DEFAULT_TARGET: Vector3Tuple = [0, 1.25, 0];

export type AvatarLayerProps = {
  modelPath: string;
  animationUrl?: string | null;
  visible?: boolean;
  camera?: {
    position?: Vector3Tuple;
    target?: Vector3Tuple;
    fov?: number;
  };
  controls?: boolean;
  className?: string;
};

const CAMERA_LERP = 0.12;

function CameraRig({
  position,
  target,
  fov,
  controlsActive
}: {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov: number;
  controlsActive: boolean;
}) {
  const { camera } = useThree();
  const targetPosition = useRef<THREE.Vector3>(new THREE.Vector3(...position));
  const desiredTarget = useRef<THREE.Vector3>(new THREE.Vector3(...target));
  const currentTarget = useRef<THREE.Vector3>(new THREE.Vector3(...target));
  const targetFov = useRef(fov);

  useEffect(() => {
    targetPosition.current.set(position[0], position[1], position[2]);
  }, [position]);

  useEffect(() => {
    desiredTarget.current.set(target[0], target[1], target[2]);
  }, [target]);

  useEffect(() => {
    targetFov.current = fov;
  }, [fov]);

  useFrame(() => {
    if (controlsActive) return;

    camera.position.lerp(targetPosition.current, CAMERA_LERP);
    currentTarget.current.lerp(desiredTarget.current, CAMERA_LERP);
    camera.lookAt(currentTarget.current);

    if (Math.abs(camera.fov - targetFov.current) > 0.01) {
      camera.fov += (targetFov.current - camera.fov) * CAMERA_LERP;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function AvatarLayer({
  modelPath,
  animationUrl,
  visible = true,
  camera,
  controls = false,
  className
}: AvatarLayerProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [holdShift, setHoldShift] = useState(false);
  const holdShiftRef = useRef(holdShift);
  const setCameraFromOrbit = useAvatarCameraStore((state) => state.setFromOrbit);
  const ambientIntensity = 0.45;
  const keyLightIntensity = 1.25;
  const fillLightIntensity = 0.6;
  const rimLightIntensity = 1.0;
  const cameraPosition = camera?.position ?? [0, 1.45, 2.1];
  const cameraTarget = camera?.target ?? DEFAULT_TARGET;
  const cameraFov = camera?.fov ?? 42;
  const reactionScene = useAvatarReactionStore((state) => state.scenePath);
  const clearReaction = useAvatarReactionStore((state) => state.clearReaction);

  const handleReactionStateChange = useCallback(
    (state: { isPlaying: boolean; duration: number; currentTime: number }) => {
      if (!state.isPlaying && state.duration > 0 && state.currentTime >= state.duration - 0.05) {
        clearReaction();
      }
    },
    [clearReaction]
  );

  useEffect(() => {
    if (!controls || typeof window === "undefined") return;

    const updateShift = (pressed: boolean) => {
      if (holdShiftRef.current === pressed) return;
      holdShiftRef.current = pressed;
      setHoldShift(pressed);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        updateShift(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        updateShift(false);
      }
    };

    const handleWindowBlur = () => updateShift(false);
    const handlePointer = (event: PointerEvent) => {
      updateShift(event.shiftKey);
    };
    const handlePointerEnd = () => updateShift(false);

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleWindowBlur);

    let domElement: HTMLElement | null = null;
    let frame = 0;

    const attachPointerListeners = () => {
      const element = controlsRef.current?.domElement ?? null;
      if (!element) {
        frame = window.requestAnimationFrame(attachPointerListeners);
        return;
      }

      domElement = element;
      element.addEventListener("pointerdown", handlePointer, true);
      element.addEventListener("pointermove", handlePointer, true);
      element.addEventListener("pointerup", handlePointerEnd, true);
      element.addEventListener("pointercancel", handlePointerEnd, true);
      element.addEventListener("pointerleave", handlePointerEnd, true);
    };

    attachPointerListeners();

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleWindowBlur);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      if (domElement) {
        domElement.removeEventListener("pointerdown", handlePointer, true);
        domElement.removeEventListener("pointermove", handlePointer, true);
        domElement.removeEventListener("pointerup", handlePointerEnd, true);
        domElement.removeEventListener("pointercancel", handlePointerEnd, true);
        domElement.removeEventListener("pointerleave", handlePointerEnd, true);
      }
    };
  }, [controls]);

  const handleOrbitEnd = useCallback(
    (event: { target: OrbitControlsImpl }) => {
      const orbit = event.target;
      const perspective = orbit.object as THREE.PerspectiveCamera;
      setCameraFromOrbit(perspective, [orbit.target.x, orbit.target.y, orbit.target.z]);
    },
    [setCameraFromOrbit]
  );

  return (
    <div className={className ?? "pointer-events-none absolute inset-0"}>
      <Canvas
        frameloop="always"
        camera={{
          position: cameraPosition,
          fov: cameraFov
        }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent", pointerEvents: controls ? "auto" : "none" }}
      >
        <Suspense fallback={<Html center className="text-white text-xs">Loading avatar…</Html>}>
          <ambientLight intensity={ambientIntensity} />

          <directionalLight
            position={[-1.4, 2.6, 2.2]}
            intensity={keyLightIntensity}
            color={new THREE.Color("#ffd8a8")}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight
            position={[2.6, 1.2, 1.6]}
            intensity={fillLightIntensity}
            color={new THREE.Color("#a5d8ff")}
          />
          <directionalLight
            position={[-0.3, 1.8, -2.6]}
            intensity={rimLightIntensity}
            color={new THREE.Color("#fff4e6")}
          />

          <spotLight
            position={[0, 3.6, 1.2]}
            angle={0.55}
            penumbra={0.5}
            intensity={0.5}
            color={new THREE.Color("#ffe5ec")}
          />

          {visible ? (
            <AvatarModel
              modelPath={modelPath}
              animationUrl={animationUrl}
            />
          ) : null}
          {reactionScene ? (
            <Suspense
              fallback={
                <Html center>
                  <p className="rounded-full bg-black/70 px-4 py-2 text-xs text-white/80">Loading reaction…</p>
                </Html>
              }
            >
              <AvatarScenePlayer
                scenePath={reactionScene}
                targetNodeName="Armature"
                replacement={{ type: "gltf", path: modelPath }}
                autoplay
                timeScale={1}
                onStateChange={handleReactionStateChange}
              />
              <Html fullscreen>
                <div className="pointer-events-none flex h-full w-full items-end justify-center pb-10">
                  <div className="pointer-events-auto flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={clearReaction}
                      className="rounded-full border border-white/50 px-6 py-2 text-xs uppercase tracking-wide text-white transition hover:border-white hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Html>
            </Suspense>
          ) : null}
          <CameraRig position={cameraPosition} target={cameraTarget} fov={cameraFov} controlsActive={controls} />
          <Environment preset="city" background={false} />
          {controls ? (
            <OrbitControls
              ref={controlsRef}
              enableZoom
              zoomSpeed={0.4}
              enablePan
              enableRotate
              minDistance={0.6}
              maxDistance={6}
              zoomToCursor
              minPolarAngle={0.3}
              maxPolarAngle={Math.PI / 2.1}
              target={cameraTarget}
              onEnd={handleOrbitEnd}
              screenSpacePanning
              // mouseButtons={{
              //   LEFT: holdShift ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
              //   MIDDLE: THREE.MOUSE.DOLLY,
              //   RIGHT: THREE.MOUSE.PAN
              // }}
              touches={{
                ONE: !holdShift ? TOUCH.ROTATE : TOUCH.PAN,
                TWO: TOUCH.DOLLY_PAN
              }}
            />
          ) : null}
        </Suspense>
      </Canvas>
    </div>
  );
}

export default AvatarLayer;
