declare module "three" {
  export const LoopOnce: number;
  export const LoopRepeat: number;
  export const MOUSE: {
    LEFT: number;
    MIDDLE: number;
    RIGHT: number;
    PAN: number;
    ROTATE: number;
    DOLLY: number;
  };
  export const TOUCH: {
    ROTATE: number;
    PAN: number;
    DOLLY_PAN: number;
    DOLLY_ROTATE: number;
  };

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    sub(vector: Vector3): this;
    lerp(vector: Vector3, alpha: number): this;
    clone(): Vector3;
  }

  export class Box3 {
    setFromObject(object: unknown): this;
    getCenter(target: Vector3): Vector3;
    getSize(target: Vector3): Vector3;
  }

  export class Color {
    constructor(color?: string | number);
  }

  export class Object3D {
    name?: string;
    parent: Object3D | null;
    position: Vector3;
    rotation: Vector3;
    scale: {
      setScalar(value: number): void;
    };
    children: Object3D[];
    visible: boolean;
    add(...object: Object3D[]): this;
    remove(...object: Object3D[]): this;
    clear(): this;
    clone(deep?: boolean): this;
    traverse(callback: (child: unknown) => void): void;
    getObjectByName(name: string): Object3D | undefined;
  }

  export class Group extends Object3D {}

  export class Mesh extends Group {
    isMesh?: boolean;
    morphTargetDictionary?: Record<string, number>;
    morphTargetInfluences?: number[];
  }

  export class AnimationClip {
    name: string;
    duration: number;
    clone(): AnimationClip;
  }

  export class AnimationAction {
    time: number;
    timeScale: number;
    enabled: boolean;
    paused: boolean;
    reset(): this;
    setLoop(loopMode: number, repetitions: number): this;
    fadeIn(duration: number): this;
    fadeOut(duration: number): this;
    play(): this;
    stop(): this;
    getClip(): AnimationClip;
    clampWhenFinished: boolean;
  }

  export class AnimationMixer {
    constructor(root: Object3D);
    clipAction(clip: AnimationClip, root?: Object3D): AnimationAction;
    update(delta: number): void;
    stopAllAction(): void;
    uncacheAction(clip: AnimationClip, root?: Object3D): void;
    setTime(time: number): void;
  }

  export class PerspectiveCamera extends Group {
    fov: number;
    updateProjectionMatrix(): void;
  }

  export class Light extends Group {
    intensity: number;
    color: Color;
  }

  export class AmbientLight extends Light {}

  export class DirectionalLight extends Light {
    castShadow: boolean;
  }

  export class SpotLight extends Light {
    angle: number;
    penumbra: number;
  }
}
