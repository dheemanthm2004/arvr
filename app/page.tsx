"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import FrameSelector from "./components/FrameSelector";
import RecommendationPanel from "./components/RecommendationPanel";
import About from "./components/About";
import Footer from "./components/Footer";
import { FaceMeasurements, SpectacleFrame } from "./types";
import { SPECTACLE_FRAMES } from "./utils/frameRenderer";

// Dynamically import ARView to avoid SSR issues with MediaPipe
const ARView = dynamic(() => import("./components/ARView"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-2xl aspect-video bg-gray-900 rounded-2xl flex items-center justify-center border border-white/10">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50 text-sm">Loading AR engine...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [selectedFrame, setSelectedFrame] = useState<SpectacleFrame>(SPECTACLE_FRAMES[0]);
  const [measurements, setMeasurements] = useState<FaceMeasurements | null>(null);

  const handleFaceMeasured = useCallback((m: FaceMeasurements) => {
    setMeasurements(m);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Hero />
      <Features />

      {/* AR Try-On Section */}
      <section id="try-on" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-blue-400 text-sm font-medium uppercase tracking-widest">Live Try-On</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Find Your Perfect Frame</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Allow camera access, then select a frame style. The AR overlay updates in real time.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left: AR view + frame selector */}
            <div className="lg:col-span-2 space-y-6">
              <ARView
                selectedFrame={selectedFrame}
                onFaceMeasured={handleFaceMeasured}
              />
              <FrameSelector selected={selectedFrame} onSelect={setSelectedFrame} />
            </div>

            {/* Right: Recommendation panel */}
            <div className="lg:col-span-1">
              <RecommendationPanel
                measurements={measurements}
                onSelectFrame={setSelectedFrame}
                selectedFrame={selectedFrame}
              />

              {/* Tips card */}
              <div className="mt-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15">
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">Tips</p>
                <ul className="space-y-1.5 text-white/50 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Face the camera directly in good lighting
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Keep your face within the oval guide
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    Use screenshot to save your look
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <About />
      <Footer />
    </main>
  );
}
