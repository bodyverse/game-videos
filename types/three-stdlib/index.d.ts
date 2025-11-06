import type { PerspectiveCamera } from "three";

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

export { OrbitControls };
export default OrbitControls;
