declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        group: any;
        primitive: any;
        ambientLight: any;
        directionalLight: any;
        spotLight: any;
      }
    }
  }
}

export {};
