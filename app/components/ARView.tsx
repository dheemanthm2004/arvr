"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";
import { FaceMeasurements, LandmarkPoint, SpectacleFrame } from "../types";
import { analyzeFaceShape, getLandmark, LANDMARKS } from "../utils/faceAnalysis";
import { drawSpectacleFrame } from "../utils/frameRenderer";

interface ARViewProps {
  selectedFrame: SpectacleFrame;
  onFaceMeasured: (m: FaceMeasurements) => void;
}

type CameraStatus = "idle" | "requesting" | "active" | "error";

export default function ARView({ selectedFrame, onFaceMeasured }: ARViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faceMeshRef = useRef<any>(null);
  const lastMeasureRef = useRef<number>(0);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ count: 0, last: Date.now() });

  const selectedFrameRef = useRef(selectedFrame);
  useEffect(() => { selectedFrameRef.current = selectedFrame; }, [selectedFrame]);

  const onFaceMeasuredRef = useRef(onFaceMeasured);
  useEffect(() => { onFaceMeasuredRef.current = onFaceMeasured; }, [onFaceMeasured]);

  const processResults = useCallback((results: any) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sync canvas size to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
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

    const landmarks: LandmarkPoint[] = results.multiFaceLandmarks[0];
    const W = canvas.width;
    const H = canvas.height;

    // Throttle face shape analysis to every 1.5s
    if (now - lastMeasureRef.current > 1500) {
      lastMeasureRef.current = now;
      const measurements = analyzeFaceShape(landmarks, W, H);
      onFaceMeasuredRef.current(measurements);
    }

    // Key landmarks for spectacle placement
    const leftEyeOuter = getLandmark(landmarks, LANDMARKS.LEFT_EYE_OUTER, W, H);
    const rightEyeOuter = getLandmark(landmarks, LANDMARKS.RIGHT_EYE_OUTER, W, H);
    const leftEyeInner = getLandmark(landmarks, LANDMARKS.LEFT_EYE_INNER, W, H);
    const rightEyeInner = getLandmark(landmarks, LANDMARKS.RIGHT_EYE_INNER, W, H);
    const noseBridge = getLandmark(landmarks, LANDMARKS.NOSE_BRIDGE, W, H);

    // Center between eyes
    const cx = (leftEyeOuter.x + rightEyeOuter.x) / 2;

    // Frame width = distance between outer eye corners * scale factor
    const eyeSpan = Math.hypot(
      rightEyeOuter.x - leftEyeOuter.x,
      rightEyeOuter.y - leftEyeOuter.y
    );
    const frameWidth = eyeSpan * 1.55;

    // Head tilt angle
    const tilt = Math.atan2(
      rightEyeOuter.y - leftEyeOuter.y,
      rightEyeOuter.x - leftEyeOuter.x
    );

    // Vertical offset: place frames slightly above nose bridge
    const eyeMidY = (leftEyeInner.y + rightEyeInner.y) / 2;
    const frameY = eyeMidY + (noseBridge.y - eyeMidY) * 0.15;

    drawSpectacleFrame(ctx, selectedFrameRef.current.id, cx, frameY, frameWidth, tilt);
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("requesting");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setStatus("active");

      // Dynamically import MediaPipe to avoid SSR issues
      const { FaceMesh } = await import("@mediapipe/face_mesh");
      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
      faceMesh.onResults(processResults);
      faceMeshRef.current = faceMesh;

      // Render loop
      const render = async () => {
        if (video.readyState >= 2 && faceMeshRef.current) {
          await faceMeshRef.current.send({ image: video });
        }
        animFrameRef.current = requestAnimationFrame(render);
      };
      animFrameRef.current = requestAnimationFrame(render);
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      setStatus("error");
      if (error.name === "NotAllowedError") {
        setErrorMsg("Camera permission denied. Please allow camera access and refresh.");
      } else if (error.name === "NotFoundError") {
        setErrorMsg("No camera found on this device.");
      } else {
        setErrorMsg("Could not access camera: " + (error.message ?? "Unknown error"));
      }
    }
  }, [processResults]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    faceMeshRef.current = null;
    setStatus("idle");
    setFps(0);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const captureScreenshot = useCallback(() => {
    const video = videoRef.current;
    const overlay = canvasRef.current;
    if (!video || !overlay) return;

    const capture = document.createElement("canvas");
    capture.width = video.videoWidth;
    capture.height = video.videoHeight;
    const ctx = capture.getContext("2d")!;
    // Mirror to match display
    ctx.translate(capture.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(overlay, 0, 0);

    const link = document.createElement("a");
    link.download = `spectacle-tryon-${Date.now()}.png`;
    link.href = capture.toDataURL("image/png");
    link.click();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Camera viewport */}
      <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {/* Mirrored video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
        />
        {/* AR overlay canvas — also mirrored to match video */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Idle state */}
        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <p className="text-white/70 text-sm">Camera not started</p>
          </div>
        )}

        {/* Requesting */}
        {status === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 gap-3">
            <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/70 text-sm">Loading AR engine...</p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 gap-3 px-6">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            <button onClick={startCamera} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Active: FPS badge */}
        {status === "active" && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md text-xs text-green-400 font-mono">
            {fps} FPS
          </div>
        )}

        {/* Face guide overlay */}
        {status === "active" && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-40 h-52 border-2 border-white/20 rounded-[50%]" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center">
        {status !== "active" ? (
          <button
            onClick={startCamera}
            disabled={status === "requesting"}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
              </svg>
              Stop
            </button>
            <button
              onClick={captureScreenshot}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Screenshot
            </button>
          </>
        )}
      </div>
    </div>
  );
}
