"use client";

import { SpectacleFrame } from "../types";
import { SPECTACLE_FRAMES } from "../utils/frameRenderer";

interface FrameSelectorProps {
  selected: SpectacleFrame;
  onSelect: (frame: SpectacleFrame) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  rectangle: "▬",
  round: "◯",
  angular: "⬡",
  rimless: "◌",
  sunglasses: "◑",
};

export default function FrameSelector({ selected, onSelect }: FrameSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-widest mb-3">
        Choose Frame
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {SPECTACLE_FRAMES.map((frame) => (
          <button
            key={frame.id}
            onClick={() => onSelect(frame)}
            className={`
              relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200
              ${selected.id === frame.id
                ? "border-blue-500 bg-blue-500/15 shadow-lg shadow-blue-500/20"
                : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
              }
            `}
          >
            {/* Color swatch */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: frame.color + "33", border: `2px solid ${frame.color}` }}
            >
              <span style={{ color: frame.color }} className="text-xs font-bold">
                {CATEGORY_ICONS[frame.category]}
              </span>
            </div>
            <span className="text-xs text-white/70 text-center leading-tight font-medium">
              {frame.name}
            </span>
            {selected.id === frame.id && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
