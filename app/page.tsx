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

const ARView = dynamic(() => import("./components/ARView"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-2xl aspect-video bg-gray-950 rounded-2xl flex items-center justify-center border border-white/8">
      <div className="w-7 h-7 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"/>
    </div>
  ),
});

export default function Home() {
  const [selectedFrame, setSelectedFrame] = useState<SpectacleFrame>(SPECTACLE_FRAMES[0]);
  const [measurements,  setMeasurements]  = useState<FaceMeasurements | null>(null);

  const handleFaceMeasured = useCallback((m: FaceMeasurements) => setMeasurements(m), []);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Hero />
      <Features />

      <section id="try-on" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <p className="text-white/30 text-xs font-medium uppercase tracking-widest">Virtual Try-On</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Find Your Perfect Frame</h2>
            <p className="text-white/35 max-w-md mx-auto text-sm">
              Allow camera access and select a frame. The overlay updates in real time.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-5">
              <ARView selectedFrame={selectedFrame} onFaceMeasured={handleFaceMeasured}/>
              <FrameSelector selected={selectedFrame} onSelect={setSelectedFrame}/>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <RecommendationPanel
                measurements={measurements}
                onSelectFrame={setSelectedFrame}
                selectedFrame={selectedFrame}
              />
              <div className="p-4 rounded-2xl bg-white/2 border border-white/6">
                <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider mb-2">Tips</p>
                <ul className="space-y-1.5 text-white/35 text-xs">
                  <li>• Face the camera in good, even lighting</li>
                  <li>• Keep your face centred in the oval guide</li>
                  <li>• Move closer for better frame detail</li>
                  <li>• Use &ldquo;Save Look&rdquo; to download your photo</li>
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
