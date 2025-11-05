declare module "three" {
  export const LoopOnce: number;
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
    position: Vector3;
    rotation: Vector3;
    add(...object: Object3D[]): this;
    clone(deep?: boolean): this;
    traverse(callback: (child: unknown) => void): void;
  }

  export class Group extends Object3D {
    scale: {
      setScalar(value: number): void;
    };
  }

  export class Mesh extends Group {
    isMesh?: boolean;
    morphTargetDictionary?: Record<string, number>;
    morphTargetInfluences?: number[];
  }

  export class AnimationAction {
    reset(): this;
    setLoop(loopMode: number, repetitions: number): this;
    fadeIn(duration: number): this;
    fadeOut(duration: number): this;
    play(): this;
    stop(): this;
    clampWhenFinished: boolean;
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
