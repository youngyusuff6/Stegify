import { Lock, Eye, EyeOff, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden cyber-grid">
      {/* Animated background blobs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#00ff9f08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-56 h-56 bg-[#9d4edd08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 w-96 h-32 bg-[#00d4ff06] rounded-full blur-3xl pointer-events-none -translate-x-1/2" />

      <div className="relative max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00ff9f30] bg-[#00ff9f08] text-[#00ff9f] text-xs mb-6 tracking-widest">
          <Zap size={10} />
          <span>BROWSER-ONLY · NO SERVER · NO UPLOADS</span>
          <Zap size={10} />
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-4">
          <span className="shimmer-text">STEGIFY</span>
        </h1>
        <p className="text-[#00ff9f] text-xs sm:text-sm tracking-[0.3em] mb-6 glow-pulse">
          IMAGE STEGANOGRAPHY TOOLKIT
        </p>

        {/* Description */}
        <p className="text-[#ffffff80] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-10">
          Hide secret files and messages inside ordinary PNG images using{' '}
          <span className="text-[#00d4ff]">LSB steganography</span>. Optionally encrypt with{' '}
          <span className="text-[#9d4edd]">AES-256</span>. Everything runs{' '}
          <span className="text-[#00ff9f]">locally in your browser</span> — your files never leave your device.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { icon: Lock, label: 'AES-256 Encryption', color: 'text-[#9d4edd]', border: 'border-[#9d4edd30]', bg: 'bg-[#9d4edd08]' },
            { icon: EyeOff, label: 'LSB Steganography', color: 'text-[#00ff9f]', border: 'border-[#00ff9f30]', bg: 'bg-[#00ff9f08]' },
            { icon: Eye, label: 'Zero Server Calls', color: 'text-[#00d4ff]', border: 'border-[#00d4ff30]', bg: 'bg-[#00d4ff08]' },
          ].map(({ icon: Icon, label, color, border, bg }) => (
            <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${border} ${bg} ${color} text-xs tracking-wider`}>
              <Icon size={12} />
              {label}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#encode"
            className="px-8 py-3 rounded-lg bg-[#00ff9f] text-[#0a0a0f] font-bold text-sm tracking-wider hover:bg-[#00ff9fdd] transition-all hover:shadow-[0_0_20px_#00ff9f60] active:scale-95"
          >
            START ENCODING
          </a>
          <a
            href="#decode"
            className="px-8 py-3 rounded-lg border border-[#00d4ff40] text-[#00d4ff] font-bold text-sm tracking-wider hover:border-[#00d4ff80] hover:bg-[#00d4ff08] transition-all active:scale-95"
          >
            DECODE IMAGE
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#ffffff30] text-xs">
        <span className="tracking-widest">SCROLL</span>
        <div className="w-px h-8 bg-gradient-to-b from-[#ffffff30] to-transparent" />
      </div>
    </section>
  );
}
