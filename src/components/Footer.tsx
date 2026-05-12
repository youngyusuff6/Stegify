import { Shield, GitBranch } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#00ff9f15] py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <Shield size={16} className="text-[#00ff9f]" />
          <span className="text-[#00ff9f] font-bold tracking-widest glow-green">STEGIFY</span>
        </div>

        {/* Tagline */}
        <p className="text-center text-xs text-[#ffffff40] max-w-sm mx-auto">
          Browser-based LSB image steganography with optional AES-256 encryption.
          All processing is client-side. No servers. No uploads.
        </p>

        {/* Roadmap pills */}
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {['Video Steganography', 'Audio Steganography', 'Multi-file Support', 'QR Sharing'].map(item => (
            <span
              key={item}
              className="px-2.5 py-1 rounded-full border border-[#ffffff10] text-[#ffffff30]"
            >
              {item} <span className="text-[#ffffff20]">· roadmap</span>
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center justify-center gap-6 text-xs text-[#ffffff40]">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#00ff9f] transition-colors"
          >
            <GitBranch size={12} />
            Source Code
          </a>
          <span>·</span>
          <span>MIT License</span>
          <span>·</span>
          <span>© {new Date().getFullYear()} STEGIFY</span>
        </div>

        <p className="text-center text-[10px] text-[#ffffff20]">
          For educational and authorized use only. The user is responsible for all content encoded with this tool.
        </p>
      </div>
    </footer>
  );
}
