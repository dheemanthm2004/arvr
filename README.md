# SpecAR — WebAR Virtual Spectacle Try-On System

A production-ready, browser-based Augmented Reality spectacle try-on application built with **Next.js 14**, **MediaPipe FaceMesh**, and **HTML5 Canvas**. No native app, no Unity — just the modern web.

---

## Features

- Real-time face detection via MediaPipe FaceMesh (468 landmarks)
- AR spectacle overlay with accurate eye/nose-bridge alignment
- Head tilt tracking and face-width-based frame scaling
- 5 procedurally rendered frame styles (no external image assets)
- Heuristic face shape analysis (oval, round, wide, heart)
- Smart frame recommendations based on face shape
- Screenshot + download functionality
- Mobile responsive, dark premium UI
- 100% client-side — no video data leaves the browser

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

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone or navigate to project
cd arvr

# Install dependencies
npm install

# Run development server
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

Follow the prompts. Vercel auto-detects Next.js.

### Option 2 — GitHub Integration

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Click **Deploy** — no environment variables needed

---

## Environment Variables

No environment variables are required. All processing is client-side.

---

## Project Structure

```
arvr/
├── app/
│   ├── components/
│   │   ├── ARView.tsx          # Webcam + MediaPipe + Canvas AR overlay
│   │   ├── FrameSelector.tsx   # Frame picker UI
│   │   ├── RecommendationPanel.tsx  # Face shape + recommendations
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── About.tsx
│   │   └── Footer.tsx
│   ├── types/
│   │   ├── index.ts            # TypeScript interfaces
│   │   └── mediapipe.d.ts      # MediaPipe type declarations
│   ├── utils/
│   │   ├── faceAnalysis.ts     # Landmark math + face shape logic
│   │   └── frameRenderer.ts    # Procedural SVG-style frame drawing
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## How the AR Works

1. `getUserMedia` captures webcam stream into a `<video>` element
2. Each animation frame, the video frame is sent to MediaPipe FaceMesh
3. FaceMesh returns 468 normalized (x, y, z) landmark coordinates
4. Key landmarks (eye corners, nose bridge) are used to compute:
   - Frame center position
   - Frame width (proportional to eye span)
   - Head tilt angle (atan2 of eye vector)
5. `drawSpectacleFrame()` renders the selected frame on a Canvas overlay
6. Both video and canvas are CSS-mirrored (`scaleX(-1)`) for natural selfie view

---

## Face Shape Recommendation Logic

| Face Shape | Recommended Frames |
|---|---|
| Oval | All styles |
| Round | Angular, Rectangle |
| Wide | Rectangle, Rimless |
| Heart | Rimless, Round |

Shape is determined by face width/height ratio and forehead-to-jaw ratio using MediaPipe landmarks.

---

## Final Checklist

- [x] Webcam access works (getUserMedia with permission handling)
- [x] AR overlay works (MediaPipe + Canvas, real-time)
- [x] Deployment works (Vercel-ready, no env vars needed)
- [x] Responsiveness works (Tailwind responsive grid)
- [x] Build succeeds (`npm run build` passes)
- [x] Screenshot download works
- [x] Face shape detection works
- [x] Frame recommendations work
- [x] Error handling for camera denial/not found
- [x] Mobile browser compatible

---

## Browser Compatibility

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Firefox 90+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Mobile Chrome | ✅ Full |
| Mobile Safari | ✅ Full |

---

*Final Year CSE Engineering Project — WebAR Virtual Spectacle Try-On and Recommendation System*
