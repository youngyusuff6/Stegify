import { Shield, GitBranch, ExternalLink } from 'lucide-react';

const GITHUB_URL = 'https://github.com/youngyusuff6/Stegify';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#00ff9f15] bg-black/20 py-12 px-4">
      <div className="mx-auto max-w-2xl flex flex-col items-center space-y-8 text-center">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2 group">
            <Shield size={18} className="text-[#00ff9f] drop-shadow-[0_0_8px_rgba(0,255,159,0.5)]" />
            <span className="text-[#00ff9f] font-bold tracking-[0.3em] text-sm md:text-base">
              STEGIFY
            </span>
          </div>
          <p className="text-xs text-white/50 max-w-md leading-relaxed">
            Secure, browser-based LSB steganography. 
            <span className="block text-[#00ff9f]/60 mt-1">
              No servers. No uploads. 100% Client-side.
            </span>
          </p>
        </div>

        {/* Roadmap - Better spacing and interactive feel */}
        <div className="flex flex-wrap justify-center gap-2">
          {['Video', 'Audio', 'Multi-file', 'QR Sharing'].map(item => (
            <span
              key={item}
              className="px-3 py-1 rounded-full border border-white/5 text-[10px] uppercase tracking-wider text-white/30 bg-white/[0.02]"
            >
              {item} <span className="opacity-40 italic ml-1">— roadmap</span>
            </span>
          ))}
        </div>

        {/* Links & Credits */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium text-white/40">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#00ff9f] transition-all duration-300"
            >
              <GitBranch size={13} />
              Source Code
            </a>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span className="uppercase tracking-tighter">MIT License</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>© {new Date().getFullYear()} STEGIFY</span>
          </div>

          <p className="max-w-sm text-[9px] uppercase tracking-[0.1em] text-white/20 leading-loose">
            For educational and authorized use only. The user is responsible for all content encoded with this tool.
          </p>
        </div>
        
      </div>
    </footer>
  );
}