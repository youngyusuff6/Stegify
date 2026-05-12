import { Shield, Eye, Lock, Cpu, Wifi, AlertTriangle } from 'lucide-react';

const features = [
  {
    icon: Cpu,
    title: 'LSB Steganography',
    desc: 'Modifies only the 2 least significant bits of each R, G, B channel — invisible to the human eye. The image looks identical before and after encoding.',
    color: 'text-[#00ff9f]',
    bg: 'bg-[#00ff9f10]',
    border: 'border-[#00ff9f20]',
  },
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    desc: 'Optional CryptoJS AES encryption applied before embedding. Without the passphrase, hidden data is cryptographically unreadable even if extraction is attempted.',
    color: 'text-[#9d4edd]',
    bg: 'bg-[#9d4edd10]',
    border: 'border-[#9d4edd20]',
  },
  {
    icon: Wifi,
    title: 'Zero Network Traffic',
    desc: 'All processing runs in your browser using the HTML5 Canvas API and WebCrypto. No file ever leaves your device. No server, no logs, no tracking.',
    color: 'text-[#00d4ff]',
    bg: 'bg-[#00d4ff10]',
    border: 'border-[#00d4ff20]',
  },
  {
    icon: Eye,
    title: 'Visual Imperceptibility',
    desc: 'The 2-bit modification is below the noise threshold of most displays and JPEG artifacts. Casual inspection — and most steganalysis tools — will not detect the embedding.',
    color: 'text-[#f72585]',
    bg: 'bg-[#f7258510]',
    border: 'border-[#f7258520]',
  },
];

export default function SecurityInfo() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-[#00ff9f] text-xs tracking-widest mb-2">
          <Shield size={12} />
          <span>SECURITY</span>
        </div>
        <h2 className="text-2xl font-bold text-white">How it Works</h2>
        <p className="text-[#ffffff50] text-sm max-w-lg mx-auto">
          STEGIFY combines two layers of protection: steganographic concealment and optional cryptographic encryption.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
          <div key={title} className={`panel-glass p-5 space-y-3 border ${border}`}>
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={16} className={color} />
            </div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-xs text-[#ffffff60] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Warning box */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#ffaa0008] border border-[#ffaa0030]">
        <AlertTriangle size={16} className="text-[#ffaa00] mt-0.5 flex-shrink-0" />
        <div className="space-y-1 text-xs">
          <p className="text-[#ffaa00] font-semibold">Important: Transmission Warning</p>
          <p className="text-[#ffffff70] leading-relaxed">
            PNG files must be transferred <strong className="text-white">without recompression</strong>. Lossy formats (JPEG) and
            social platforms (WhatsApp, Instagram, Twitter, Facebook) re-encode images on upload and will permanently destroy
            any hidden data. Use <strong className="text-white">Telegram file attachment</strong>, direct file transfer,
            email attachment, or cloud storage (Google Drive, Dropbox) to preserve the original PNG bytes.
          </p>
        </div>
      </div>
    </section>
  );
}
