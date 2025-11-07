import type { PerspectiveCamera, Object3D, AnimationClip } from "three";

declare class OrbitControls {
  object: PerspectiveCamera;
  target: { x: number; y: number; z: number };
  domElement?: HTMLElement;
  mouseButtons: Record<string, any>;
  enablePan: boolean;
  enableRotate: boolean;
  addEventListener(event: string, handler: (...args: unknown[]) => void): void;
  removeEventListener(event: string, handler: (...args: unknown[]) => void): void;
}

declare const SkeletonUtils: {
  clone<T extends Object3D>(source: T): T;
  retargetClip(target: Object3D, source: Object3D, clip: AnimationClip): AnimationClip;
};

export { OrbitControls, SkeletonUtils };
export default OrbitControls;
