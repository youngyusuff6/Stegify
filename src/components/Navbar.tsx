import { Shield, GitBranch } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 mb-6 border-b border-[#00ff9f20] bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-[#00ff9f]" />
          <span className="text-[#00ff9f] font-bold text-lg tracking-widest glow-green">STEGIFY</span>
          <span className="hidden sm:inline text-[#ffffff20] text-xs ml-2 tracking-wider">v1.0</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#ffffff60]">
          <a href="#encode" className="hover:text-[#00ff9f] transition-colors hidden sm:block">ENCODE</a>
          <a href="#decode" className="hover:text-[#00ff9f] transition-colors hidden sm:block">DECODE</a>
          <a href="#faq" className="hover:text-[#00ff9f] transition-colors hidden sm:block">FAQ</a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#00ff9f] transition-colors"
          >
            <GitBranch size={14} />
            <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
