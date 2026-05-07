"use client";

import { FaceMeasurements, SpectacleFrame } from "../types";
import { getFaceShapeDescription, getRecommendedFrames } from "../utils/faceAnalysis";
import { SPECTACLE_FRAMES } from "../utils/frameRenderer";

interface RecommendationPanelProps {
  measurements: FaceMeasurements | null;
  onSelectFrame: (frame: SpectacleFrame) => void;
  selectedFrame: SpectacleFrame;
}

const SHAPE_ICONS: Record<string, string> = {
  oval: "🥚",
  round: "⭕",
  wide: "↔️",
  heart: "♡",
  unknown: "👤",
};

export default function RecommendationPanel({
  measurements,
  onSelectFrame,
  selectedFrame,
}: RecommendationPanelProps) {
  const shape = measurements?.shape ?? "unknown";
  const recommended = measurements
    ? getRecommendedFrames(shape, SPECTACLE_FRAMES)
    : [];

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="font-semibold text-white">AI Recommendation</h3>
      </div>

      {/* Face shape result */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
        <span className="text-2xl">{SHAPE_ICONS[shape]}</span>
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider">Detected Face Shape</p>
          <p className="text-white font-medium capitalize">{shape}</p>
        </div>
        {measurements && (
          <div className="ml-auto text-right">
            <p className="text-xs text-white/40">W/H ratio</p>
            <p className="text-white/70 text-sm font-mono">
              {(measurements.faceWidth / measurements.faceHeight).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-white/60 leading-relaxed">
        {getFaceShapeDescription(shape)}
      </p>

      {/* Recommended frames */}
      {recommended.length > 0 && (
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Best Matches</p>
          <div className="flex flex-col gap-2">
            {recommended.map((frame, i) => (
              <button
                key={frame.id}
                onClick={() => onSelectFrame(frame)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                  ${selectedFrame.id === frame.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }
                `}
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: frame.color + "40", border: `2px solid ${frame.color}` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{frame.name}</p>
                  <p className="text-white/40 text-xs truncate">{frame.description}</p>
                </div>
                {i === 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0">
                    Best
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!measurements && (
        <p className="text-sm text-white/40 text-center py-2">
          Start camera to detect your face shape
        </p>
      )}
    </div>
  );
}
