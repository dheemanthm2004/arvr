export type FrameCategory =
  | "rectangle"
  | "round"
  | "oval"
  | "wayfarer"
  | "aviator"
  | "rimless"
  | "cat-eye"
  | "oversized"
  | "sunglasses"
  | "transparent"
  | "thin-metal"
  | "thick-acetate";

export type FrameColor =
  | "black"
  | "silver"
  | "gold"
  | "brown"
  | "transparent"
  | "blue"
  | "matte-dark";

export interface SpectacleFrame {
  id: string;
  name: string;
  category: FrameCategory;
  color: FrameColor;
  hexColor: string;
  pngPath: string;
  description: string;
  recommendedFaceShapes: FaceShape[];
  aspectRatio?: number;   // width/height of the SVG viewBox, default 400/120 = 3.333
  isSunglasses?: boolean;
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
