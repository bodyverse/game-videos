import type * as THREE from "three";
import type { Object3DNode } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements {
    group: Object3DNode<THREE.Group, typeof THREE.Group>;
    primitive: Object3DNode<THREE.Object3D, typeof THREE.Object3D> & { object?: unknown };
    ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
    directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>;
    spotLight: Object3DNode<THREE.SpotLight, typeof THREE.SpotLight>;
  }
}

export {};
