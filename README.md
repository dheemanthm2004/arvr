# SpecAR — WebAR Virtual Spectacle Try-On

A production-ready, browser-based Augmented Reality spectacle try-on application built with **Next.js 14**, **MediaPipe FaceMesh**, and **HTML5 Canvas**. No native app, no Unity — just the modern web.

---

## Live Demo

Deploy instantly to Vercel — see [Deploy](#deploy-to-vercel) below.

---

## Features

- Real-time face detection via MediaPipe FaceMesh (468 landmarks)
- Accurate AR spectacle overlay — aligned to eyes, nose bridge, and head tilt
- Adaptive scaling: frames resize as you move closer or further from the camera
- Two-stage stabilisation: temporal averaging + exponential smoothing
- 12 curated premium frame styles (SVG, transparent background)
- Heuristic face shape analysis (oval, round, wide, heart)
- Smart frame recommendations based on detected face shape
- Screenshot + download functionality
- Fully responsive — works on phones, tablets, and desktops
- 100% client-side — no video data ever leaves the browser

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AR / CV | MediaPipe FaceMesh |
| Rendering | HTML5 Canvas API |
| Deployment | Vercel |

---

## Frame Collection (12 styles)

| Style | Category |
|---|---|
| Classic Black | Rectangle |
| Tortoise Shell | Rectangle |
| Gold Metal | Thin Metal |
| Silver Metal | Thin Metal |
| Round Black | Round |
| Round Gold | Round |
| Rimless Silver | Rimless |
| Wayfarer Black | Wayfarer |
| Wayfarer Tortoise | Wayfarer |
| Aviator Gold | Aviator |
| Aviator Sunglasses | Sunglasses |
| Clear Frame | Transparent |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
cd arvr
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> Allow camera access when prompted. Use Chrome or Edge for best performance.

---

## Build for Production

```bash
npm run build
npm start
```

---

## Deploy to Vercel

### Option 1 — Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2 — GitHub Integration

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Click **Deploy** — no environment variables needed

No environment variables are required. All processing is client-side.

---

## Project Structure

```
arvr/
├── app/
│   ├── components/
│   │   ├── ARView.tsx              # Webcam + MediaPipe + Canvas AR overlay
│   │   ├── FrameSelector.tsx       # Frame picker UI
│   │   ├── RecommendationPanel.tsx # Face shape + recommendations
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── About.tsx
│   │   └── Footer.tsx
│   ├── types/
│   │   ├── index.ts                # TypeScript interfaces
│   │   └── mediapipe.d.ts          # MediaPipe type declarations
│   ├── utils/
│   │   ├── faceAnalysis.ts         # Landmark math + face shape logic
│   │   └── frameRenderer.ts        # SVG frame drawing + smoothing
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   └── frames/
│       ├── frames-metadata.json    # Frame catalogue
│       └── *.svg                   # 12 premium frame SVGs
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## How the AR Works

1. `getUserMedia` captures the webcam stream into a `<video>` element
2. Each animation frame, the video frame is sent to MediaPipe FaceMesh
3. FaceMesh returns 468 normalised (x, y, z) landmark coordinates
4. Key landmarks are used to compute:
   - **Frame centre X** — midpoint of outer eye corners
   - **Frame centre Y** — eye optical centre blended 20% toward nose bridge
   - **Frame width** — eye span ÷ 0.72 (eye span is ~72% of total frame width)
   - **Head tilt** — atan2 of the outer eye corner vector
5. A two-stage stabiliser (temporal history average → exponential smoothing) removes jitter
6. `drawSpectacleFrame()` renders the selected SVG frame on a Canvas overlay
7. Both video and canvas are CSS-mirrored (`scaleX(-1)`) for natural selfie view

---

## Face Shape Recommendation Logic

| Face Shape | Recommended Frames |
|---|---|
| Oval | All styles |
| Round | Rectangle, Wayfarer, Thin Metal |
| Wide | Rectangle, Rimless, Clear, Thin Metal |
| Heart | Rimless, Round, Aviator, Clear, Thin Metal |

Shape is determined by face width/height ratio and forehead-to-jaw ratio using MediaPipe landmarks.

---

## Browser Compatibility

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Firefox 90+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Chrome Android | ✅ Full |
| Mobile Safari (iOS) | ✅ Full |

---

## Performance Notes

- MediaPipe WASM assets are loaded from jsDelivr CDN — no bundling overhead
- SVG frames are cached in memory after first load
- Face shape analysis is throttled to once per 1.5 seconds
- Adaptive smoothing alpha: 0.14 normally, 0.22 on fast movement
- No heavy 3D libraries — pure Canvas 2D rendering

---

## Final Checklist

- [x] Webcam access works (getUserMedia with mobile fallback)
- [x] AR overlay works (MediaPipe + Canvas, real-time)
- [x] Deployment works (Vercel-ready, no env vars needed)
- [x] Responsiveness works (Tailwind responsive grid)
- [x] Build succeeds (`npm run build` — zero TypeScript errors)
- [x] Screenshot download works
- [x] Face shape detection works
- [x] Frame recommendations work
- [x] Error handling for camera denial / not found / in use
- [x] Mobile browser compatible (iOS Safari + Chrome Android)
- [x] Frames look realistic (no neon/cartoon effects)
- [x] Stabilisation implemented (no jitter)

---

*Final Year CSE Engineering Project — WebAR Virtual Spectacle Try-On and Recommendation System*
