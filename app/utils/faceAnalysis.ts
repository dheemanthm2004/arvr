import { FaceMeasurements, FaceShape, LandmarkPoint } from "../types";

// MediaPipe FaceMesh landmark indices
export const LANDMARKS = {
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  NOSE_BRIDGE: 168,
  NOSE_TIP: 1,
  LEFT_TEMPLE: 234,
  RIGHT_TEMPLE: 454,
  FOREHEAD_LEFT: 103,
  FOREHEAD_RIGHT: 332,
  JAW_LEFT: 172,
  JAW_RIGHT: 397,
  CHIN: 152,
  TOP_HEAD: 10,
};

export function getLandmark(
  landmarks: LandmarkPoint[],
  index: number,
  width: number,
  height: number
): { x: number; y: number } {
  const lm = landmarks[index];
  return { x: lm.x * width, y: lm.y * height };
}

export function analyzeFaceShape(
  landmarks: LandmarkPoint[],
  width: number,
  height: number
): FaceMeasurements {
  const leftTemple = getLandmark(landmarks, LANDMARKS.LEFT_TEMPLE, width, height);
  const rightTemple = getLandmark(landmarks, LANDMARKS.RIGHT_TEMPLE, width, height);
  const foreheadLeft = getLandmark(landmarks, LANDMARKS.FOREHEAD_LEFT, width, height);
  const foreheadRight = getLandmark(landmarks, LANDMARKS.FOREHEAD_RIGHT, width, height);
  const jawLeft = getLandmark(landmarks, LANDMARKS.JAW_LEFT, width, height);
  const jawRight = getLandmark(landmarks, LANDMARKS.JAW_RIGHT, width, height);
  const topHead = getLandmark(landmarks, LANDMARKS.TOP_HEAD, width, height);
  const chin = getLandmark(landmarks, LANDMARKS.CHIN, width, height);

  const faceWidth = Math.abs(rightTemple.x - leftTemple.x);
  const faceHeight = Math.abs(chin.y - topHead.y);
  const foreheadWidth = Math.abs(foreheadRight.x - foreheadLeft.x);
  const jawWidth = Math.abs(jawRight.x - jawLeft.x);

  const ratio = faceHeight / faceWidth;
  const foreheadToJaw = foreheadWidth / jawWidth;

  let shape: FaceShape = "unknown";
  if (ratio < 1.1) {
    shape = "round";
  } else if (faceWidth / faceHeight > 0.95) {
    shape = "wide";
  } else if (foreheadToJaw > 1.2) {
    shape = "heart";
  } else if (ratio >= 1.1 && ratio <= 1.5) {
    shape = "oval";
  } else {
    shape = "oval";
  }

  return { faceWidth, faceHeight, foreheadWidth, jawWidth, shape };
}

export function getFaceShapeDescription(shape: FaceShape): string {
  const descriptions: Record<FaceShape, string> = {
    oval: "Oval face — most frame styles suit you perfectly.",
    round: "Round face — angular frames add definition.",
    wide: "Wide face — rectangular frames balance proportions.",
    heart: "Heart-shaped face — rimless or thin frames complement you.",
    unknown: "Detecting face shape...",
  };
  return descriptions[shape];
}
