import { SpectacleFrame, FrameCategory, FrameColor, FaceShape } from "../types";
import framesData from "../../public/frames/frames-metadata.json";

export const SPECTACLE_FRAMES: SpectacleFrame[] = framesData as SpectacleFrame[];

// ─── Image cache ──────────────────────────────────────────────────────────────
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
interface State { cx: number; cy: number; w: number; angle: number; }
let prev: State | null = null;

// 0.14 = smooth & stable; raises to 0.22 on large jumps (catches fast movement)
function smooth(cx: number, cy: number, w: number, angle: number): State {
  if (!prev) { prev = { cx, cy, w, angle }; return prev; }

  let da = angle - prev.angle;
  if (da >  Math.PI) da -= 2 * Math.PI;
  if (da < -Math.PI) da += 2 * Math.PI;

  const dist = Math.hypot(cx - prev.cx, cy - prev.cy);
  const alpha = dist > 30 ? 0.22 : 0.14;

  prev = {
    cx:    prev.cx    + alpha * (cx    - prev.cx),
    cy:    prev.cy    + alpha * (cy    - prev.cy),
    w:     prev.w     + alpha * (w     - prev.w),
    angle: prev.angle + alpha * da,
  };
  return prev;
}

export function resetSmoothing() { prev = null; }

// ─── Core draw ────────────────────────────────────────────────────────────────
/**
 * All SVGs use viewBox="0 0 600 180".
 * The frame content spans x: 0→600 (temple to temple).
 * Eye span (outer corner to outer corner) ≈ 72% of total frame width.
 * So: drawWidth = eyeSpan / 0.72
 *
 * Vertical: the SVG frame sits at y≈28–152 (centre y=90) out of 180.
 * The optical centre of the lenses is at y=90/180 = 50% of SVG height.
 * We pass `cy` = eye-level canvas coordinate, so no extra vertical shift needed.
 */
const EYE_SPAN_RATIO = 0.72; // eye span / total frame width
const SVG_AR = 600 / 180;    // 3.333 — all frames share this

export function drawSpectacleFrame(
  ctx: CanvasRenderingContext2D,
  frameId: string,
  cx: number,
  cy: number,
  eyeSpan: number,
  angle: number
): void {
  const frame = SPECTACLE_FRAMES.find(f => f.id === frameId);
  if (!frame) return;

  const img = imageCache.get(frame.pngPath);
  if (!img) { loadImage(frame.pngPath).catch(() => {}); return; }

  const s = smooth(cx, cy, eyeSpan, angle);

  const drawW = s.w / EYE_SPAN_RATIO;
  const ar    = frame.aspectRatio ?? SVG_AR;
  const drawH = drawW / ar;

  ctx.save();
  ctx.translate(s.cx, s.cy);
  ctx.rotate(s.angle);

  ctx.shadowColor   = "rgba(10, 5, 0, 0.28)";
  ctx.shadowBlur    = 6;
  ctx.shadowOffsetY = 2;
  ctx.shadowOffsetX = 0;

  ctx.globalAlpha = frame.isSunglasses ? 0.92 : 0.96;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const FRAME_CATEGORIES: FrameCategory[] = [
  "rectangle", "round", "wayfarer", "aviator",
  "rimless", "sunglasses", "transparent", "thin-metal",
];

export const CATEGORY_LABELS: Record<FrameCategory, string> = {
  "rectangle":     "Rectangle",
  "round":         "Round",
  "oval":          "Oval",
  "wayfarer":      "Wayfarer",
  "aviator":       "Aviator",
  "rimless":       "Rimless",
  "cat-eye":       "Cat-Eye",
  "oversized":     "Oversized",
  "sunglasses":    "Sunglasses",
  "transparent":   "Clear",
  "thin-metal":    "Thin Metal",
  "thick-acetate": "Thick Acetate",
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
