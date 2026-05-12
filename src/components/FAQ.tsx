import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Can anyone tell my image has hidden data in it?',
    a: 'Visually, no. LSB steganography changes only the least significant bits of pixel values, which is imperceptible to human vision. However, statistical steganalysis tools can detect patterns in large images. For maximum deniability, enable AES-256 encryption — the payload then appears as random noise, which is statistically indistinguishable from unmodified pixels.',
  },
  {
    q: 'What file types can I hide inside the image?',
    a: 'Any file type is supported — documents, ZIP archives, other images, executables, text files, etc. The file is converted to Base64 before embedding, so binary content is fully preserved.',
  },
  {
    q: 'How much data can I hide?',
    a: 'Approximately 0.75 bytes per pixel (using 2 LSBs across 3 channels). A 1920×1080 image (~2 megapixels) can hold roughly 500 KB of payload. Use a larger or higher-resolution PNG cover image for larger payloads.',
  },
  {
    q: 'What happens if I use the wrong password during decoding?',
    a: 'Decryption will fail with an error — the AES algorithm cannot produce valid JSON with the wrong key. No partial data is revealed.',
  },
  {
    q: 'Is it safe to share the encoded image publicly?',
    a: 'Without a password, anyone with STEGIFY can attempt to decode the image. Always use AES-256 encryption if the content is sensitive. Even with encryption, consider the risk of the image being identified as a steganography carrier.',
  },
  {
    q: 'Why does it only support PNG?',
    a: 'PNG uses lossless compression, which preserves every pixel value exactly. JPEG uses lossy compression that modifies pixel values during save — this would corrupt the hidden LSB data. Always keep your encoded image as PNG.',
  },
  {
    q: 'Does this work offline?',
    a: 'Yes. Once the page loads, everything runs in your browser with no internet connection required. You can even save the page for offline use.',
  },
  {
    q: 'Are my files safe? Is anything uploaded?',
    a: 'Absolutely nothing is uploaded. All processing uses the HTML5 Canvas API and JavaScript running in your browser tab. Your files never leave your device. You can verify this by inspecting the network tab in DevTools — you will see zero requests during encoding or decoding.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-[#00ff9f] text-xs tracking-widest mb-2">
          <HelpCircle size={12} />
          <span>FAQ</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Common Questions</h2>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`panel-glass transition-all ${open === i ? 'border-[#00ff9f30]' : 'border-[#ffffff08]'}`}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between gap-4 p-4 text-left"
            >
              <span className="text-sm text-white font-medium">{faq.q}</span>
              <ChevronDown
                size={14}
                className={`text-[#00ff9f] flex-shrink-0 mt-0.5 transition-transform ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && (
              <div className="px-4 pb-4">
                <p className="text-xs text-[#ffffff70] leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
