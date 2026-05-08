"use client";

import Image from "next/image";
import { FaceMeasurements, SpectacleFrame } from "../types";
import { getFaceShapeDescription } from "../utils/faceAnalysis";
import { SPECTACLE_FRAMES, getRecommendedFrames, CATEGORY_LABELS } from "../utils/frameRenderer";

interface RecommendationPanelProps {
  measurements: FaceMeasurements | null;
  onSelectFrame: (frame: SpectacleFrame) => void;
  selectedFrame: SpectacleFrame;
}

const SHAPE_ICONS: Record<string, string> = {
  oval: "🥚", round: "⭕", wide: "↔️", heart: "♡", unknown: "👤",
};

export default function RecommendationPanel({ measurements, onSelectFrame, selectedFrame }: RecommendationPanelProps) {
  const shape = measurements?.shape ?? "unknown";
  const recommended = measurements ? getRecommendedFrames(shape, SPECTACLE_FRAMES) : [];

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/4 backdrop-blur-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="font-semibold text-white text-sm">AI Recommendation</h3>
      </div>

      {/* Face shape */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
        <span className="text-xl">{SHAPE_ICONS[shape]}</span>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Face Shape</p>
          <p className="text-white font-medium capitalize text-sm">{shape}</p>
        </div>
        {measurements && (
          <div className="ml-auto text-right">
            <p className="text-[10px] text-white/30">W/H</p>
            <p className="text-white/60 text-xs font-mono">
              {(measurements.faceWidth / measurements.faceHeight).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-white/50 leading-relaxed">{getFaceShapeDescription(shape)}</p>

      {recommended.length > 0 && (
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Best Matches</p>
          <div className="flex flex-col gap-2">
            {recommended.map((frame, i) => (
              <button
                key={frame.id}
                onClick={() => onSelectFrame(frame)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
                  selectedFrame.id === frame.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/8 bg-white/4 hover:border-white/18 hover:bg-white/8"
                }`}
              >
                {/* Thumbnail */}
                <div className="w-14 h-6 relative flex-shrink-0 rounded overflow-hidden bg-white/5">
                  <Image src={frame.pngPath} alt={frame.name} fill className="object-contain" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{frame.name}</p>
                  <p className="text-white/35 text-[10px] capitalize">{CATEGORY_LABELS[frame.category]}</p>
                </div>
                {i === 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 flex-shrink-0">
                    Best
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!measurements && (
        <p className="text-xs text-white/30 text-center py-2">Start camera to detect your face shape</p>
      )}
    </div>
  );
}
