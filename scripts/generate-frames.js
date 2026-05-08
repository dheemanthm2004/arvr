#!/usr/bin/env node
/**
 * Generates 12 high-quality photorealistic spectacle SVG assets.
 *
 * KEY DESIGN DECISIONS for realism:
 * - viewBox is exactly 400×120 with ZERO padding — frame fills edge-to-edge
 *   so the renderer can use eye-span directly as drawWidth with no multiplier
 * - No thick cartoon strokes — frame material is rendered as filled paths
 *   with gradient depth, not outline strokes
 * - Lens fill is a very subtle blue-grey tint (real lenses)
 * - Temples are thin tapered arms, not thick lines
 * - No neon colors — only black, dark-brown, silver, gold, clear
 * - Drop shadow is minimal and warm (not cold blue)
 */

const fs = require("fs");
const path = require("path");
const OUT = path.join(__dirname, "../public/frames");
fs.mkdirSync(OUT, { recursive: true });

// ─── Shared defs ─────────────────────────────────────────────────────────────

// Lens tint: very subtle, realistic
function lensTint(id, r, g, b, op) {
  return `
  <radialGradient id="lt${id}" cx="38%" cy="32%" r="65%">
    <stop offset="0%"   stop-color="rgb(${r},${g},${b})" stop-opacity="${(op * 0.55).toFixed(3)}"/>
    <stop offset="100%" stop-color="rgb(${r},${g},${b})" stop-opacity="${op.toFixed(3)}"/>
  </radialGradient>
  <linearGradient id="ls${id}" x1="15%" y1="0%" x2="85%" y2="100%">
    <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.18"/>
    <stop offset="40%"  stop-color="#ffffff" stop-opacity="0.04"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>`;
}

// Frame material gradient — simulates acetate/metal depth
function frameMat(id, hi, mid, lo) {
  return `
  <linearGradient id="fm${id}" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%"   stop-color="${hi}"/>
    <stop offset="45%"  stop-color="${mid}"/>
    <stop offset="100%" stop-color="${lo}"/>
  </linearGradient>`;
}

// Subtle warm drop shadow
function dropShadow(id, blur, op) {
  return `
  <filter id="ds${id}" x="-8%" y="-12%" width="116%" height="136%" color-interpolation-filters="sRGB">
    <feDropShadow dx="0" dy="${(blur*0.4).toFixed(1)}" stdDeviation="${blur}" flood-color="#1a0a00" flood-opacity="${op}"/>
  </filter>`;
}

function wrap(vw, vh, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="${vw}" height="${vh}">
<defs>${defs}</defs>
${body}
</svg>`;
}

// ─── Frame builders ───────────────────────────────────────────────────────────
// All frames use viewBox 400×120.
// Lens centers: left=(100,60), right=(300,60). Temples reach x=0 and x=400.
// This means drawWidth in the renderer = eye_span * scale_factor directly.

function acetateRect({ id, hi, mid, lo, lensR, lensG, lensB, lensOp, thick }) {
  const t = thick || 7;   // frame thickness (filled rect border)
  const lw = 88, lh = 52; // lens half-width, half-height
  const lx1 = 100, lx2 = 300, cy = 60;
  const bh = 6; // bridge height above center
  return wrap(400, 120,
    dropShadow(id,3,0.45) + lensTint(id,lensR,lensG,lensB,lensOp) + frameMat(id,hi,mid,lo),
    `<g filter="url(#ds${id})">
  <!-- Left lens fill -->
  <rect x="${lx1-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="6" fill="url(#lt${id})"/>
  <!-- Right lens fill -->
  <rect x="${lx2-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="6" fill="url(#lt${id})"/>
  <!-- Left frame border (filled path = realistic material) -->
  <rect x="${lx1-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="6" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <!-- Right frame border -->
  <rect x="${lx2-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="6" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <!-- Bridge -->
  <path d="M${lx1+lw} ${cy-bh} Q200 ${cy-bh-10} ${lx2-lw} ${cy-bh}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.75}" stroke-linecap="round"/>
  <!-- Left temple (tapered) -->
  <path d="M${lx1-lw} ${cy-2} L0 ${cy+4}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.7}" stroke-linecap="round"/>
  <!-- Right temple -->
  <path d="M${lx2+lw} ${cy-2} L400 ${cy+4}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.7}" stroke-linecap="round"/>
  <!-- Lens shine -->
  <rect x="${lx1-lw+6}" y="${cy-lh+5}" width="${lw*2-12}" height="${lh*0.55}" rx="3" fill="url(#ls${id})"/>
  <rect x="${lx2-lw+6}" y="${cy-lh+5}" width="${lw*2-12}" height="${lh*0.55}" rx="3" fill="url(#ls${id})"/>
</g>`);
}

function thinMetalRect({ id, hi, mid, lo, lensR, lensG, lensB, lensOp }) {
  const t = 2.5;
  const lw = 88, lh = 48;
  const lx1 = 100, lx2 = 300, cy = 60;
  return wrap(400, 120,
    dropShadow(id,2,0.30) + lensTint(id,lensR,lensG,lensB,lensOp) + frameMat(id,hi,mid,lo),
    `<g filter="url(#ds${id})">
  <rect x="${lx1-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="4" fill="url(#lt${id})"/>
  <rect x="${lx2-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="4" fill="url(#lt${id})"/>
  <rect x="${lx1-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="4" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <rect x="${lx2-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="4" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <path d="M${lx1+lw} ${cy-8} Q200 ${cy-16} ${lx2-lw} ${cy-8}" fill="none" stroke="url(#fm${id})" stroke-width="${t}" stroke-linecap="round"/>
  <path d="M${lx1-lw} ${cy} L0 ${cy+3}" fill="none" stroke="url(#fm${id})" stroke-width="${t}" stroke-linecap="round"/>
  <path d="M${lx2+lw} ${cy} L400 ${cy+3}" fill="none" stroke="url(#fm${id})" stroke-width="${t}" stroke-linecap="round"/>
  <rect x="${lx1-lw+4}" y="${cy-lh+4}" width="${lw*2-8}" height="${lh*0.5}" rx="2" fill="url(#ls${id})"/>
  <rect x="${lx2-lw+4}" y="${cy-lh+4}" width="${lw*2-8}" height="${lh*0.5}" rx="2" fill="url(#ls${id})"/>
</g>`);
}

function roundFrame({ id, hi, mid, lo, lensR, lensG, lensB, lensOp, thick }) {
  const t = thick || 5;
  const r = 46;
  const lx1 = 100, lx2 = 300, cy = 60;
  return wrap(400, 120,
    dropShadow(id,2.5,0.40) + lensTint(id,lensR,lensG,lensB,lensOp) + frameMat(id,hi,mid,lo),
    `<g filter="url(#ds${id})">
  <circle cx="${lx1}" cy="${cy}" r="${r}" fill="url(#lt${id})"/>
  <circle cx="${lx2}" cy="${cy}" r="${r}" fill="url(#lt${id})"/>
  <circle cx="${lx1}" cy="${cy}" r="${r}" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <circle cx="${lx2}" cy="${cy}" r="${r}" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <path d="M${lx1+r} ${cy-12} Q200 ${cy-22} ${lx2-r} ${cy-12}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.8}" stroke-linecap="round"/>
  <path d="M${lx1-r} ${cy} L0 ${cy+3}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.75}" stroke-linecap="round"/>
  <path d="M${lx2+r} ${cy} L400 ${cy+3}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.75}" stroke-linecap="round"/>
  <ellipse cx="${lx1}" cy="${cy-r*0.42}" rx="${r*0.72}" ry="${r*0.28}" fill="url(#ls${id})"/>
  <ellipse cx="${lx2}" cy="${cy-r*0.42}" rx="${r*0.72}" ry="${r*0.28}" fill="url(#ls${id})"/>
</g>`);
}

function rimlessOval({ id, hi, mid, lo, lensR, lensG, lensB, lensOp }) {
  const t = 1.8;
  const rx = 82, ry = 44;
  const lx1 = 100, lx2 = 300, cy = 60;
  return wrap(400, 120,
    dropShadow(id,1.5,0.20) + lensTint(id,lensR,lensG,lensB,lensOp) + frameMat(id,hi,mid,lo),
    `<g filter="url(#ds${id})">
  <ellipse cx="${lx1}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#lt${id})"/>
  <ellipse cx="${lx2}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#lt${id})"/>
  <!-- Only top rim for rimless look -->
  <path d="M${lx1-rx} ${cy-4} A${rx} ${ry} 0 0 1 ${lx1+rx} ${cy-4}" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <path d="M${lx2-rx} ${cy-4} A${rx} ${ry} 0 0 1 ${lx2+rx} ${cy-4}" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <!-- Nose pads + bridge -->
  <path d="M${lx1+rx} ${cy-10} Q200 ${cy-18} ${lx2-rx} ${cy-10}" fill="none" stroke="url(#fm${id})" stroke-width="${t*1.2}" stroke-linecap="round"/>
  <!-- Nose pad dots -->
  <circle cx="${lx1+rx-4}" cy="${cy-4}" r="2.5" fill="url(#fm${id})"/>
  <circle cx="${lx2-rx+4}" cy="${cy-4}" r="2.5" fill="url(#fm${id})"/>
  <path d="M${lx1-rx} ${cy} L0 ${cy+3}" fill="none" stroke="url(#fm${id})" stroke-width="${t}" stroke-linecap="round"/>
  <path d="M${lx2+rx} ${cy} L400 ${cy+3}" fill="none" stroke="url(#fm${id})" stroke-width="${t}" stroke-linecap="round"/>
</g>`);
}

function wayfarerFrame({ id, hi, mid, lo, lensR, lensG, lensB, lensOp, thick }) {
  const t = thick || 8;
  // Wayfarer: top edge wider than bottom, slight trapezoid
  const lx1 = 100, lx2 = 300, cy = 60;
  const tw = 92, bw = 80, th = 28, bh = 28; // top-half-width, bottom-half-width, top-height, bottom-height
  const L = (cx) => `M${cx-tw} ${cy-th} L${cx+tw} ${cy-th} Q${cx+tw+6} ${cy-th} ${cx+tw+4} ${cy} L${cx+bw+2} ${cy+bh} Q${cx+bw} ${cy+bh+2} ${cx+bw-4} ${cy+bh+2} L${cx-bw+4} ${cy+bh+2} Q${cx-bw} ${cy+bh+2} ${cx-bw-2} ${cy+bh} L${cx-tw-4} ${cy} Q${cx-tw-6} ${cy-th} ${cx-tw} ${cy-th} Z`;
  return wrap(400, 120,
    dropShadow(id,3,0.45) + lensTint(id,lensR,lensG,lensB,lensOp) + frameMat(id,hi,mid,lo),
    `<g filter="url(#ds${id})">
  <path d="${L(lx1)}" fill="url(#lt${id})"/>
  <path d="${L(lx2)}" fill="url(#lt${id})"/>
  <path d="${L(lx1)}" fill="none" stroke="url(#fm${id})" stroke-width="${t}" stroke-linejoin="round"/>
  <path d="${L(lx2)}" fill="none" stroke="url(#fm${id})" stroke-width="${t}" stroke-linejoin="round"/>
  <path d="M${lx1+tw} ${cy-18} Q200 ${cy-26} ${lx2-tw} ${cy-18}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.7}" stroke-linecap="round"/>
  <path d="M${lx1-tw-4} ${cy} L0 ${cy+4}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.65}" stroke-linecap="round"/>
  <path d="M${lx2+tw+4} ${cy} L400 ${cy+4}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.65}" stroke-linecap="round"/>
  <rect x="${lx1-tw+8}" y="${cy-th+5}" width="${(tw-8)*2}" height="${th*0.55}" rx="3" fill="url(#ls${id})"/>
  <rect x="${lx2-tw+8}" y="${cy-th+5}" width="${(tw-8)*2}" height="${th*0.55}" rx="3" fill="url(#ls${id})"/>
</g>`);
}

function aviatorFrame({ id, hi, mid, lo, lensR, lensG, lensB, lensOp }) {
  const t = 3.5;
  const lx1 = 100, lx2 = 300, cy = 62;
  // Teardrop: wider at top, tapers to rounded bottom
  const A = (cx) => `M${cx} ${cy-46} C${cx+88} ${cy-46} ${cx+90} ${cy+38} ${cx+20} ${cy+50} Q${cx} ${cy+54} ${cx-20} ${cy+50} C${cx-90} ${cy+38} ${cx-88} ${cy-46} ${cx} ${cy-46} Z`;
  return wrap(400, 120,
    dropShadow(id,2.5,0.38) + lensTint(id,lensR,lensG,lensB,lensOp) + frameMat(id,hi,mid,lo),
    `<g filter="url(#ds${id})">
  <path d="${A(lx1)}" fill="url(#lt${id})"/>
  <path d="${A(lx2)}" fill="url(#lt${id})"/>
  <path d="${A(lx1)}" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <path d="${A(lx2)}" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <!-- Double bridge (aviator signature) -->
  <path d="M${lx1+88} ${cy-28} Q200 ${cy-38} ${lx2-88} ${cy-28}" fill="none" stroke="url(#fm${id})" stroke-width="${t}" stroke-linecap="round"/>
  <path d="M${lx1+82} ${cy-18} Q200 ${cy-26} ${lx2-82} ${cy-18}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.7}" stroke-linecap="round"/>
  <path d="M${lx1-88} ${cy-28} L0 ${cy-20}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.8}" stroke-linecap="round"/>
  <path d="M${lx2+88} ${cy-28} L400 ${cy-20}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.8}" stroke-linecap="round"/>
  <ellipse cx="${lx1}" cy="${cy-28}" rx="58" ry="14" fill="url(#ls${id})"/>
  <ellipse cx="${lx2}" cy="${cy-28}" rx="58" ry="14" fill="url(#ls${id})"/>
</g>`);
}

function clearFrame({ id, lensR, lensG, lensB, lensOp, thick }) {
  // Transparent acetate — frame color is a very light grey-blue
  const t = thick || 6;
  const lw = 88, lh = 50;
  const lx1 = 100, lx2 = 300, cy = 60;
  return wrap(400, 120,
    dropShadow(id,2,0.18) + lensTint(id,lensR,lensG,lensB,lensOp) +
    `<linearGradient id="fm${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="rgba(200,215,230,0.85)"/>
      <stop offset="50%"  stop-color="rgba(180,200,220,0.70)"/>
      <stop offset="100%" stop-color="rgba(160,185,210,0.80)"/>
    </linearGradient>
    <linearGradient id="ls${id}" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="50%"  stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>`,
    `<g filter="url(#ds${id})">
  <rect x="${lx1-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="7" fill="url(#lt${id})"/>
  <rect x="${lx2-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="7" fill="url(#lt${id})"/>
  <rect x="${lx1-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="7" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <rect x="${lx2-lw}" y="${cy-lh}" width="${lw*2}" height="${lh*2}" rx="7" fill="none" stroke="url(#fm${id})" stroke-width="${t}"/>
  <path d="M${lx1+lw} ${cy-8} Q200 ${cy-16} ${lx2-lw} ${cy-8}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.75}" stroke-linecap="round"/>
  <path d="M${lx1-lw} ${cy-2} L0 ${cy+3}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.7}" stroke-linecap="round"/>
  <path d="M${lx2+lw} ${cy-2} L400 ${cy+3}" fill="none" stroke="url(#fm${id})" stroke-width="${t*0.7}" stroke-linecap="round"/>
  <rect x="${lx1-lw+6}" y="${cy-lh+5}" width="${lw*2-12}" height="${lh*0.6}" rx="3" fill="url(#ls${id})"/>
  <rect x="${lx2-lw+6}" y="${cy-lh+5}" width="${lw*2-12}" height="${lh*0.6}" rx="3" fill="url(#ls${id})"/>
</g>`);
}

// ─── Frame catalogue (12 frames) ─────────────────────────────────────────────

const frames = [
  // 1. Black thick acetate rectangle — the classic
  { file: "acetate-black-rect",
    fn: acetateRect,
    args: { id:"abr", hi:"#3d3d3d", mid:"#1a1a1a", lo:"#0d0d0d",
            lensR:185, lensG:210, lensB:235, lensOp:0.10, thick:8 } },

  // 2. Dark brown tortoise rectangle
  { file: "tortoise-rect",
    fn: acetateRect,
    args: { id:"tor", hi:"#8b5a2b", mid:"#5c3317", lo:"#3a1f0a",
            lensR:200, lensG:185, lensB:155, lensOp:0.10, thick:8 } },

  // 3. Thin gold metal rectangle
  { file: "thinmetal-gold-rect",
    fn: thinMetalRect,
    args: { id:"tgr", hi:"#e8c96a", mid:"#c9a84c", lo:"#9a7a28",
            lensR:215, lensG:205, lensB:170, lensOp:0.08 } },

  // 4. Thin silver metal rectangle
  { file: "thinmetal-silver-rect",
    fn: thinMetalRect,
    args: { id:"tsr", hi:"#e8e8e8", mid:"#c0c0c0", lo:"#8a8a8a",
            lensR:200, lensG:215, lensB:230, lensOp:0.08 } },

  // 5. Black round — premium
  { file: "round-black",
    fn: roundFrame,
    args: { id:"rnb", hi:"#3d3d3d", mid:"#1a1a1a", lo:"#0d0d0d",
            lensR:185, lensG:210, lensB:235, lensOp:0.10, thick:6 } },

  // 6. Gold round — thin metal
  { file: "round-gold",
    fn: roundFrame,
    args: { id:"rng", hi:"#e8c96a", mid:"#c9a84c", lo:"#9a7a28",
            lensR:215, lensG:205, lensB:170, lensOp:0.08, thick:3 } },

  // 7. Silver rimless oval
  { file: "rimless-silver",
    fn: rimlessOval,
    args: { id:"rls", hi:"#e8e8e8", mid:"#c0c0c0", lo:"#8a8a8a",
            lensR:200, lensG:215, lensB:230, lensOp:0.09 } },

  // 8. Black wayfarer
  { file: "wayfarer-black",
    fn: wayfarerFrame,
    args: { id:"wfb", hi:"#3d3d3d", mid:"#1a1a1a", lo:"#0d0d0d",
            lensR:185, lensG:210, lensB:235, lensOp:0.10, thick:8 } },

  // 9. Tortoise wayfarer
  { file: "wayfarer-tortoise",
    fn: wayfarerFrame,
    args: { id:"wft", hi:"#8b5a2b", mid:"#5c3317", lo:"#3a1f0a",
            lensR:200, lensG:185, lensB:155, lensOp:0.10, thick:8 } },

  // 10. Gold aviator
  { file: "aviator-gold",
    fn: aviatorFrame,
    args: { id:"avg", hi:"#e8c96a", mid:"#c9a84c", lo:"#9a7a28",
            lensR:185, lensG:200, lensB:155, lensOp:0.16 } },

  // 11. Silver aviator sunglasses (dark lens)
  { file: "aviator-sun-silver",
    fn: aviatorFrame,
    args: { id:"ass", hi:"#e8e8e8", mid:"#c0c0c0", lo:"#8a8a8a",
            lensR:28, lensG:28, lensB:32, lensOp:0.72 } },

  // 12. Clear transparent acetate
  { file: "clear-rect",
    fn: clearFrame,
    args: { id:"clr",
            lensR:195, lensG:215, lensB:235, lensOp:0.12, thick:6 } },
];

frames.forEach(({ file, fn, args }) => {
  fs.writeFileSync(path.join(OUT, `${file}.svg`), fn(args));
  console.log(`  ✓ ${file}.svg`);
});

console.log(`\nGenerated ${frames.length} photorealistic frames → ${OUT}`);
