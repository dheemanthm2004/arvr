export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <span className="font-bold text-white text-lg tracking-tight">SpecAR</span>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#try-on" className="hover:text-white transition-colors">Try On</a>
        <a href="#about" className="hover:text-white transition-colors">About</a>
      </div>
      <a
        href="#try-on"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Try Now
      </a>
    </nav>
  );
}
