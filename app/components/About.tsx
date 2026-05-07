export default function About() {
  return (
    <section id="about" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <p className="text-blue-400 text-sm font-medium uppercase tracking-widest">About the Project</p>
            <h2 className="text-4xl font-bold text-white leading-tight">
              WebAR Spectacle Try-On System
            </h2>
            <p className="text-white/60 leading-relaxed">
              A final-year Computer Science engineering project demonstrating the intersection of
              Augmented Reality, Computer Vision, and modern web technologies.
            </p>
            <p className="text-white/60 leading-relaxed">
              Built with Next.js 14, MediaPipe FaceMesh, and HTML5 Canvas — the system achieves
              real-time face landmark detection and accurate spectacle overlay without any native
              app or heavy AR SDK.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Next.js 14", "TypeScript", "MediaPipe", "Canvas API", "Tailwind CSS", "Vercel"].map((tech) => (
                <span key={tech} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Face Detection", value: "MediaPipe FaceMesh", detail: "468 landmarks" },
              { label: "AR Rendering", value: "HTML5 Canvas", detail: "Hardware accelerated" },
              { label: "Face Analysis", value: "Heuristic Algorithm", detail: "4 face shapes" },
              { label: "Performance", value: "30+ FPS", detail: "Real-time processing" },
              { label: "Privacy", value: "100% Local", detail: "No data upload" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">{item.label}</p>
                  <p className="text-white font-medium text-sm mt-0.5">{item.value}</p>
                </div>
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
