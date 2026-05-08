"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";
import { FaceMeasurements, LandmarkPoint, SpectacleFrame } from "../types";
import { analyzeFaceShape, getLandmark, LANDMARKS } from "../utils/faceAnalysis";
import { drawSpectacleFrame, preloadFrames, resetSmoothing, SPECTACLE_FRAMES } from "../utils/frameRenderer";

interface ARViewProps {
  selectedFrame: SpectacleFrame;
  onFaceMeasured: (m: FaceMeasurements) => void;
}

type CameraStatus = "idle" | "requesting" | "active" | "error";

// Temporal history for pre-smoothing (removes single-frame spikes)
const HISTORY = 5;
type RawPlacement = { cx: number; cy: number; eyeSpan: number; angle: number };
const history: RawPlacement[] = [];

function averagedPlacement(raw: RawPlacement): RawPlacement {
  history.push(raw);
  if (history.length > HISTORY) history.shift();
  const n = history.length;
  let cx = 0, cy = 0, eyeSpan = 0, sinA = 0, cosA = 0;
  for (const h of history) {
    cx      += h.cx;
    cy      += h.cy;
    eyeSpan += h.eyeSpan;
    sinA    += Math.sin(h.angle);
    cosA    += Math.cos(h.angle);
  }
  return { cx: cx/n, cy: cy/n, eyeSpan: eyeSpan/n, angle: Math.atan2(sinA/n, cosA/n) };
}

export default function ARView({ selectedFrame, onFaceMeasured }: ARViewProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef   = useRef<number>(0);
  const meshRef   = useRef<any>(null);
  const lastAnalRef = useRef<number>(0);

  const [status,   setStatus]   = useState<CameraStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fps,      setFps]      = useState(0);
  const fpsRef = useRef({ count: 0, last: Date.now() });

  const frameRef = useRef(selectedFrame);
  useEffect(() => {
    frameRef.current = selectedFrame;
    resetSmoothing();
    history.length = 0;
  }, [selectedFrame]);

  const cbRef = useRef(onFaceMeasured);
  useEffect(() => { cbRef.current = onFaceMeasured; }, [onFaceMeasured]);

  useEffect(() => { preloadFrames(SPECTACLE_FRAMES); }, []);

  const processResults = useCallback((results: any) => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sync canvas resolution to actual video dimensions
    const vw = video.videoWidth  || 640;
    const vh = video.videoHeight || 480;
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width  = vw;
      canvas.height = vh;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // FPS counter
    fpsRef.current.count++;
    const now = Date.now();
    if (now - fpsRef.current.last >= 1000) {
      setFps(fpsRef.current.count);
      fpsRef.current = { count: 0, last: now };
    }

    if (!results.multiFaceLandmarks?.length) return;

    const lms: LandmarkPoint[] = results.multiFaceLandmarks[0];
    const W = canvas.width, H = canvas.height;

    // Throttle face shape analysis to every 1.5 s
    if (now - lastAnalRef.current > 1500) {
      lastAnalRef.current = now;
      cbRef.current(analyzeFaceShape(lms, W, H));
    }

    // ── Key landmarks ──────────────────────────────────────────────────────
    const lOuter  = getLandmark(lms, LANDMARKS.LEFT_EYE_OUTER,  W, H);
    const rOuter  = getLandmark(lms, LANDMARKS.RIGHT_EYE_OUTER, W, H);
    const lUpper  = getLandmark(lms, 159, W, H); // left upper eyelid centre
    const rUpper  = getLandmark(lms, 386, W, H); // right upper eyelid centre
    const lLower  = getLandmark(lms, 145, W, H); // left lower eyelid centre
    const rLower  = getLandmark(lms, 374, W, H); // right lower eyelid centre
    const noseBridge = getLandmark(lms, LANDMARKS.NOSE_BRIDGE, W, H);

    // ── Eye span: outer corner to outer corner ─────────────────────────────
    const eyeSpan = Math.hypot(rOuter.x - lOuter.x, rOuter.y - lOuter.y);

    // Ignore if face is too far away or not properly detected
    if (eyeSpan < W * 0.06) return;

    // ── Centre X: midpoint of outer eye corners ────────────────────────────
    const cx = (lOuter.x + rOuter.x) / 2;

    // ── Head tilt ──────────────────────────────────────────────────────────
    const angle = Math.atan2(rOuter.y - lOuter.y, rOuter.x - lOuter.x);

    // ── Vertical placement ─────────────────────────────────────────────────
    // Eye optical centre = average of upper + lower eyelid midpoints
    const eyeCentreY = (lUpper.y + rUpper.y + lLower.y + rLower.y) / 4;
    // Blend 20% toward nose bridge so frame sits naturally on nose
    const cy = eyeCentreY + (noseBridge.y - eyeCentreY) * 0.20;

    // ── Temporal averaging → exponential smoothing ─────────────────────────
    const avg = averagedPlacement({ cx, cy, eyeSpan, angle });
    drawSpectacleFrame(ctx, frameRef.current.id, avg.cx, avg.cy, avg.eyeSpan, avg.angle);
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("requesting");
    setErrorMsg("");
    try {
      // Mobile-safe constraints: ideal resolution, fallback gracefully
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "user",
          width:  { ideal: 1280, max: 1920 },
          height: { ideal: 720,  max: 1080 },
        },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback: minimal constraints for older/restricted mobile browsers
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      }

      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;

      // playsInline + muted required for iOS autoplay
      video.playsInline = true;
      video.muted = true;

      await video.play();
      setStatus("active");

      const { FaceMesh } = await import("@mediapipe/face_mesh");
      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence:  0.6,
      });
      faceMesh.onResults(processResults);
      meshRef.current = faceMesh;

      const render = async () => {
        if (video.readyState >= 2 && meshRef.current) {
          await meshRef.current.send({ image: video });
        }
        animRef.current = requestAnimationFrame(render);
      };
      animRef.current = requestAnimationFrame(render);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      setStatus("error");
      setErrorMsg(
        e.name === "NotAllowedError"  ? "Camera permission denied. Please allow access and refresh." :
        e.name === "NotFoundError"    ? "No camera found on this device." :
        e.name === "NotReadableError" ? "Camera is in use by another app." :
        "Could not access camera: " + (e.message ?? "Unknown error")
      );
    }
  }, [processResults]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    meshRef.current   = null;
    resetSmoothing();
    history.length = 0;
    setStatus("idle");
    setFps(0);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const captureScreenshot = useCallback(() => {
    const video   = videoRef.current;
    const overlay = canvasRef.current;
    if (!video || !overlay) return;
    const cap = document.createElement("canvas");
    cap.width  = video.videoWidth;
    cap.height = video.videoHeight;
    const ctx  = cap.getContext("2d")!;
    // Mirror the video (matches CSS scaleX(-1))
    ctx.translate(cap.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(overlay, 0, 0);
    const a = document.createElement("a");
    a.download = `specar-${Date.now()}.png`;
    a.href = cap.toDataURL("image/png");
    a.click();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Viewport */}
      <div className="relative w-full max-w-2xl bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-white/8"
           style={{ aspectRatio: "16/9" }}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          playsInline muted autoPlay
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/96 gap-4">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
            </div>
            <p className="text-white/30 text-sm">Camera not started</p>
          </div>
        )}

        {status === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/96 gap-3">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"/>
            <p className="text-white/40 text-sm">Initialising AR engine…</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/96 gap-3 px-8">
            <p className="text-red-400/80 text-sm text-center">{errorMsg}</p>
            <button onClick={startCamera}
              className="px-4 py-2 bg-white/8 hover:bg-white/12 border border-white/12 text-white/70 text-sm rounded-lg transition-colors">
              Retry
            </button>
          </div>
        )}

        {status === "active" && (
          <>
            <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/40 rounded text-[10px] text-white/30 font-mono select-none">
              {fps} fps
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-xs text-white/50 select-none">
              {selectedFrame.name}
            </div>
            {/* Subtle face guide oval */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-36 h-48 border border-white/10 rounded-[50%] -translate-y-2"/>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {status !== "active" ? (
          <button
            onClick={startCamera}
            disabled={status === "requesting"}
            className="px-6 py-2.5 bg-white text-gray-950 font-semibold rounded-xl text-sm hover:bg-white/90 disabled:opacity-40 transition-all shadow-lg"
          >
            Start Try-On
          </button>
        ) : (
          <>
            <button onClick={stopCamera}
              className="px-5 py-2.5 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 rounded-xl text-sm transition-all">
              Stop
            </button>
            <button onClick={captureScreenshot}
              className="px-5 py-2.5 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 rounded-xl text-sm transition-all flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Save Look
            </button>
          </>
        )}
      </div>
    </div>
  );
}
