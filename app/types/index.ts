export interface SpectacleFrame {
  id: string;
  name: string;
  category: "rectangle" | "round" | "angular" | "rimless" | "sunglasses";
  svgPath: string;
  color: string;
  description: string;
}

export type FaceShape = "oval" | "round" | "wide" | "heart" | "unknown";

export interface FaceMeasurements {
  faceWidth: number;
  faceHeight: number;
  foreheadWidth: number;
  jawWidth: number;
  shape: FaceShape;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}
