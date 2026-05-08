"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { SpectacleFrame, FrameCategory } from "../types";
import { SPECTACLE_FRAMES, CATEGORY_LABELS } from "../utils/frameRenderer";

interface FrameSelectorProps {
  selected: SpectacleFrame;
  onSelect: (frame: SpectacleFrame) => void;
}

// Only show categories that exist in the current catalogue
const ACTIVE_CATEGORIES: FrameCategory[] = [
  "rectangle", "round", "wayfarer", "aviator", "rimless", "sunglasses", "transparent", "thin-metal",
];

export default function FrameSelector({ selected, onSelect }: FrameSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<FrameCategory | "all">("all");

  const filtered = useMemo(() =>
    activeCategory === "all"
      ? SPECTACLE_FRAMES
      : SPECTACLE_FRAMES.filter(f => f.category === activeCategory),
    [activeCategory]
  );

  return (
    <div className="w-full space-y-3">
      <p className="text-[11px] font-medium text-white/30 uppercase tracking-widest">Frames</p>

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        <CategoryPill label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")}/>
        {ACTIVE_CATEGORIES.map(cat => (
          <CategoryPill
            key={cat}
            label={CATEGORY_LABELS[cat]}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* Frame grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {filtered.map(frame => {
          const sel = selected.id === frame.id;
          return (
            <button
              key={frame.id}
              onClick={() => onSelect(frame)}
              title={frame.name}
              className={`
                relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-150
                ${sel
                  ? "border-white/30 bg-white/8 scale-[1.04] shadow-md shadow-black/30"
                  : "border-white/6 bg-white/3 hover:border-white/15 hover:bg-white/6 hover:scale-[1.02]"
                }
              `}
            >
              {/* SVG thumbnail */}
              <div className="w-full aspect-[10/3] relative rounded overflow-hidden bg-black/20">
                <Image
                  src={frame.pngPath}
                  alt={frame.name}
                  fill
                  className="object-contain"
                  sizes="100px"
                  loading="lazy"
                  unoptimized
                />
              </div>

              <span className={`text-[9px] leading-tight text-center font-medium truncate w-full transition-colors ${
                sel ? "text-white/80" : "text-white/40"
              }`}>
                {frame.name}
              </span>

              {/* Color dot */}
              <div
                className="w-2 h-2 rounded-full border border-white/15 flex-shrink-0"
                style={{ backgroundColor: frame.hexColor }}
              />

              {sel && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white/60"/>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected info */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/3 border border-white/6">
        <div className="w-12 h-4 relative flex-shrink-0">
          <Image src={selected.pngPath} alt={selected.name} fill className="object-contain" unoptimized/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-xs font-medium truncate">{selected.name}</p>
          <p className="text-white/30 text-[10px] capitalize">{CATEGORY_LABELS[selected.category]}</p>
        </div>
        <div className="w-2.5 h-2.5 rounded-full border border-white/15 flex-shrink-0"
          style={{ backgroundColor: selected.hexColor }}/>
      </div>
    </div>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
        active
          ? "bg-white/12 text-white/80 border border-white/20"
          : "bg-white/3 text-white/35 border border-white/6 hover:bg-white/6 hover:text-white/55"
      }`}
    >
      {label}
    </button>
  );
}
