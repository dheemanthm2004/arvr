// Type declarations for MediaPipe packages
declare module "@mediapipe/face_mesh" {
  export interface Results {
    multiFaceLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
    image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
  }

  export interface FaceMeshOptions {
    maxNumFaces?: number;
    refineLandmarks?: boolean;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  }

  export class FaceMesh {
    constructor(config: { locateFile: (file: string) => string });
    setOptions(options: FaceMeshOptions): void;
    onResults(callback: (results: Results) => void): void;
    send(inputs: { image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement }): Promise<void>;
    close(): void;
  }
}

declare module "@mediapipe/camera_utils" {
  export class Camera {
    constructor(
      videoElement: HTMLVideoElement,
      config: {
        onFrame: () => Promise<void>;
        width?: number;
        height?: number;
      }
    );
    start(): Promise<void>;
    stop(): void;
  }
}

// Extend CanvasRenderingContext2D with roundRect (available in modern browsers)
interface CanvasRenderingContext2D {
  roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radii?: number | DOMPointInit | (number | DOMPointInit)[]
  ): void;
}
