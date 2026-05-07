import { SpectacleFrame } from "../types";

// SVG frame definitions rendered to canvas at runtime
export const SPECTACLE_FRAMES: SpectacleFrame[] = [
  {
    id: "classic-black",
    name: "Classic Black",
    category: "rectangle",
    svgPath: "classic-black",
    color: "#1a1a1a",
    description: "Timeless rectangular black frame",
  },
  {
    id: "round-gold",
    name: "Round Gold",
    category: "round",
    svgPath: "round-gold",
    color: "#c9a84c",
    description: "Elegant round gold frame",
  },
  {
    id: "angular-blue",
    name: "Angular Blue",
    category: "angular",
    svgPath: "angular-blue",
    color: "#2563eb",
    description: "Bold angular blue frame",
  },
  {
    id: "rimless",
    name: "Rimless",
    category: "rimless",
    svgPath: "rimless",
    color: "#9ca3af",
    description: "Minimalist rimless frame",
  },
  {
    id: "sunglasses",
    name: "Aviator Sun",
    category: "sunglasses",
    svgPath: "sunglasses",
    color: "#78350f",
    description: "Classic aviator sunglasses",
  },
];

/**
 * Polyfill for roundRect on older browsers.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws a spectacle frame on canvas using vector math.
 * All frames are drawn procedurally — no external image assets needed.
 */
export function drawSpectacleFrame(
  ctx: CanvasRenderingContext2D,
  frameId: string,
  cx: number,   // center x between eyes
  cy: number,   // center y (nose bridge level)
  width: number, // total frame width
  angle: number  // head tilt in radians
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const hw = width / 2;
  const lensW = hw * 0.42;
  const lensH = lensW * 0.55;
  const gap = hw * 0.08;
  const lx = -(gap + lensW); // left lens center x
  const rx = gap + lensW;    // right lens center x
  const lensY = 0;

  switch (frameId) {
    case "classic-black":
      drawRectFrame(ctx, lx, rx, lensY, lensW, lensH, "#1a1a1a", 3.5, hw);
      break;
    case "round-gold":
      drawRoundFrame(ctx, lx, rx, lensY, lensW, lensH, "#c9a84c", 3, hw);
      break;
    case "angular-blue":
      drawAngularFrame(ctx, lx, rx, lensY, lensW, lensH, "#2563eb", 3.5, hw);
      break;
    case "rimless":
      drawRimlessFrame(ctx, lx, rx, lensY, lensW, lensH, "#9ca3af", 1.5, hw);
      break;
    case "sunglasses":
      drawAviatorFrame(ctx, lx, rx, lensY, lensW, lensH, "#78350f", 3, hw);
      break;
    default:
      drawRectFrame(ctx, lx, rx, lensY, lensW, lensH, "#1a1a1a", 3.5, hw);
  }

  ctx.restore();
}

function drawRectFrame(
  ctx: CanvasRenderingContext2D,
  lx: number, rx: number, ly: number,
  lw: number, lh: number,
  color: string, lineWidth: number, hw: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.fillStyle = "rgba(0,0,0,0.08)";

  // Left lens
  roundRect(ctx, lx - lw, ly - lh, lw * 2, lh * 2, 4);
  ctx.fill();
  ctx.stroke();

  // Right lens
  roundRect(ctx, rx - lw, ly - lh, lw * 2, lh * 2, 4);
  ctx.fill();
  ctx.stroke();

  // Bridge
  ctx.beginPath();
  ctx.moveTo(lx + lw, ly - lh * 0.1);
  ctx.quadraticCurveTo(0, ly - lh * 0.4, rx - lw, ly - lh * 0.1);
  ctx.stroke();

  // Temples
  drawTemples(ctx, lx - lw, rx + lw, ly, lh, hw, color, lineWidth);
}

function drawRoundFrame(
  ctx: CanvasRenderingContext2D,
  lx: number, rx: number, ly: number,
  lw: number, lh: number,
  color: string, lineWidth: number, hw: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.fillStyle = "rgba(201,168,76,0.07)";

  const r = Math.min(lw, lh);

  ctx.beginPath();
  ctx.ellipse(lx, ly, r, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(rx, ly, r, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bridge
  ctx.beginPath();
  ctx.moveTo(lx + r, ly - r * 0.1);
  ctx.quadraticCurveTo(0, ly - r * 0.5, rx - r, ly - r * 0.1);
  ctx.stroke();

  drawTemples(ctx, lx - r, rx + r, ly, lh, hw, color, lineWidth);
}

function drawAngularFrame(
  ctx: CanvasRenderingContext2D,
  lx: number, rx: number, ly: number,
  lw: number, lh: number,
  color: string, lineWidth: number, hw: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "miter";
  ctx.fillStyle = "rgba(37,99,235,0.08)";

  // Hexagonal-ish angular lens
  const drawHex = (cx: number) => {
    ctx.beginPath();
    ctx.moveTo(cx - lw, ly);
    ctx.lineTo(cx - lw * 0.5, ly - lh);
    ctx.lineTo(cx + lw * 0.5, ly - lh);
    ctx.lineTo(cx + lw, ly);
    ctx.lineTo(cx + lw * 0.5, ly + lh);
    ctx.lineTo(cx - lw * 0.5, ly + lh);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  drawHex(lx);
  drawHex(rx);

  ctx.beginPath();
  ctx.moveTo(lx + lw, ly - lh * 0.1);
  ctx.quadraticCurveTo(0, ly - lh * 0.5, rx - lw, ly - lh * 0.1);
  ctx.stroke();

  drawTemples(ctx, lx - lw, rx + lw, ly, lh, hw, color, lineWidth);
}

function drawRimlessFrame(
  ctx: CanvasRenderingContext2D,
  lx: number, rx: number, ly: number,
  lw: number, lh: number,
  color: string, lineWidth: number, hw: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.fillStyle = "rgba(200,200,220,0.12)";

  // Just top rim
  ctx.beginPath();
  ctx.moveTo(lx - lw, ly - lh * 0.1);
  ctx.quadraticCurveTo(lx, ly - lh * 1.1, lx + lw, ly - lh * 0.1);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rx - lw, ly - lh * 0.1);
  ctx.quadraticCurveTo(rx, ly - lh * 1.1, rx + lw, ly - lh * 0.1);
  ctx.stroke();

  // Lens fill (very subtle)
  ctx.beginPath();
  ctx.ellipse(lx, ly, lw, lh, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(rx, ly, lw, lh, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bridge
  ctx.beginPath();
  ctx.moveTo(lx + lw, ly - lh * 0.1);
  ctx.quadraticCurveTo(0, ly - lh * 0.4, rx - lw, ly - lh * 0.1);
  ctx.stroke();

  drawTemples(ctx, lx - lw, rx + lw, ly, lh, hw, color, lineWidth);
}

function drawAviatorFrame(
  ctx: CanvasRenderingContext2D,
  lx: number, rx: number, ly: number,
  lw: number, lh: number,
  color: string, lineWidth: number, hw: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.fillStyle = "rgba(120,53,15,0.25)";

  // Teardrop aviator shape
  const drawAviator = (cx: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, ly - lh * 0.9);
    ctx.bezierCurveTo(cx + lw * 1.1, ly - lh * 0.9, cx + lw * 1.1, ly + lh * 0.9, cx, ly + lh * 1.0);
    ctx.bezierCurveTo(cx - lw * 1.1, ly + lh * 0.9, cx - lw * 1.1, ly - lh * 0.9, cx, ly - lh * 0.9);
    ctx.fill();
    ctx.stroke();
  };

  drawAviator(lx);
  drawAviator(rx);

  // Bridge
  ctx.beginPath();
  ctx.moveTo(lx + lw * 0.9, ly - lh * 0.5);
  ctx.quadraticCurveTo(0, ly - lh * 0.8, rx - lw * 0.9, ly - lh * 0.5);
  ctx.stroke();

  drawTemples(ctx, lx - lw, rx + lw, ly, lh, hw, color, lineWidth);
}

function drawTemples(
  ctx: CanvasRenderingContext2D,
  leftEdge: number, rightEdge: number,
  ly: number, lh: number,
  hw: number,
  color: string, lineWidth: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth * 0.85;

  // Left temple
  ctx.beginPath();
  ctx.moveTo(leftEdge, ly - lh * 0.1);
  ctx.lineTo(-hw * 1.15, ly - lh * 0.05);
  ctx.stroke();

  // Right temple
  ctx.beginPath();
  ctx.moveTo(rightEdge, ly - lh * 0.1);
  ctx.lineTo(hw * 1.15, ly - lh * 0.05);
  ctx.stroke();
}
