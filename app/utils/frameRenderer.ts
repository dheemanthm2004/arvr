import { SpectacleFrame, FrameCategory, FrameColor, FaceShape } from "../types";
import framesData from "../../public/frames/frames-metadata.json";

export const SPECTACLE_FRAMES: SpectacleFrame[] = framesData as SpectacleFrame[];

// ─── Image cache ─────────────────────────────────────────────────────────────
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => { imageCache.set(src, img); resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadFrames(frames: SpectacleFrame[]) {
  frames.forEach(f => loadImage(f.pngPath).catch(() => {}));
}

// ─── Exponential smoothing ────────────────────────────────────────────────────
// Two-stage: fast stage catches large movements, slow stage removes micro-jitter
interface State { cx: number; cy: number; w: number; angle: number; }
let prev: State | null = null;

// ALPHA: 0.18 = smooth but responsive. Lower = more stable, higher = more snappy.
const ALPHA = 0.18;

function smooth(cx: number, cy: number, w: number, angle: number): State {
  if (!prev) { prev = { cx, cy, w, angle }; return prev; }

  // Angle shortest-path interpolation
  let da = angle - prev.angle;
  if (da >  Math.PI) da -= 2 * Math.PI;
  if (da < -Math.PI) da += 2 * Math.PI;

  prev = {
    cx:    prev.cx    + ALPHA * (cx    - prev.cx),
    cy:    prev.cy    + ALPHA * (cy    - prev.cy),
    w:     prev.w     + ALPHA * (w     - prev.w),
    angle: prev.angle + ALPHA * da,
  };
  return prev;
}

export function resetSmoothing() { prev = null; }

// ─── Core draw ────────────────────────────────────────────────────────────────
/**
 * SCALING RATIONALE
 * -----------------
 * The SVG viewBox is 400×120 and the frame fills it edge-to-edge (x: 0→400).
 * The frame spans from temple to temple (x=0 to x=400 in SVG space).
 *
 * `width` passed in = eye-outer-corner span in canvas pixels.
 * Real glasses are ~10–15% wider than the eye span on each side.
 * So drawWidth = eyeSpan * FRAME_SCALE where FRAME_SCALE ≈ 1.28.
 *
 * This keeps frames snug to the face — never exceeding face width.
 */
const FRAME_SCALE = 1.28;   // eye-span → frame draw width
const DEFAULT_AR  = 400 / 120; // 3.333 — SVG aspect ratio

export function drawSpectacleFrame(
  ctx: CanvasRenderingContext2D,
  frameId: string,
  cx: number,
  cy: number,
  eyeSpan: number,   // distance between outer eye corners in canvas px
  angle: number
): void {
  const frame = SPECTACLE_FRAMES.find(f => f.id === frameId);
  if (!frame) return;

  const img = imageCache.get(frame.pngPath);
  if (!img) { loadImage(frame.pngPath).catch(() => {}); return; }

  const s = smooth(cx, cy, eyeSpan, angle);

  const drawW = s.w * FRAME_SCALE;
  const ar    = frame.aspectRatio ?? DEFAULT_AR;
  const drawH = drawW / ar;

  ctx.save();
  ctx.translate(s.cx, s.cy);
  ctx.rotate(s.angle);

  // Warm, subtle shadow — not cold blue
  ctx.shadowColor     = "rgba(20, 10, 0, 0.30)";
  ctx.shadowBlur      = 8;
  ctx.shadowOffsetY   = 2;
  ctx.shadowOffsetX   = 0;

  // Slight opacity reduction for natural blending with skin
  ctx.globalAlpha = frame.isSunglasses ? 0.93 : 0.97;

  // imageSmoothingQuality for anti-aliased rendering
  ctx.imageSmoothingEnabled  = true;
  ctx.imageSmoothingQuality  = "high";

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const FRAME_CATEGORIES: FrameCategory[] = [
  "rectangle", "round", "wayfarer", "aviator",
  "rimless", "sunglasses", "transparent", "thin-metal",
];

export const CATEGORY_LABELS: Record<FrameCategory, string> = {
  "rectangle":    "Rectangle",
  "round":        "Round",
  "oval":         "Oval",
  "wayfarer":     "Wayfarer",
  "aviator":      "Aviator",
  "rimless":      "Rimless",
  "cat-eye":      "Cat-Eye",
  "oversized":    "Oversized",
  "sunglasses":   "Sunglasses",
  "transparent":  "Clear",
  "thin-metal":   "Thin Metal",
  "thick-acetate":"Thick Acetate",
};

export const COLOR_HEX: Record<FrameColor, string> = {
  black:        "#1a1a1a",
  silver:       "#c0c0c0",
  gold:         "#c9a84c",
  brown:        "#5c3317",
  transparent:  "#c8d8e8",
  blue:         "#1e40af",
  "matte-dark": "#2a2a2a",
};

export function getRecommendedFrames(shape: FaceShape, frames: SpectacleFrame[]): SpectacleFrame[] {
  const preferred: Record<FaceShape, FrameCategory[]> = {
    oval:    ["rectangle", "round", "wayfarer", "aviator", "rimless", "transparent", "thin-metal", "sunglasses"],
    round:   ["rectangle", "wayfarer", "thin-metal"],
    wide:    ["rectangle", "rimless", "transparent", "thin-metal"],
    heart:   ["rimless", "round", "aviator", "transparent", "thin-metal"],
    unknown: ["rectangle", "round", "wayfarer"],
  };
  const order = preferred[shape];
  return [...frames]
    .sort((a, b) => {
      const ai = order.indexOf(a.category), bi = order.indexOf(b.category);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .slice(0, 4);
}
