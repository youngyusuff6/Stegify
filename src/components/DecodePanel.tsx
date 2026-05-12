import { useState, useCallback } from 'react';
import { Search, Download, Copy, CheckCheck, FileText, File } from 'lucide-react';
import DropZone from './DropZone';
import PasswordInput from './PasswordInput';
import ProgressBar from './ProgressBar';
import { decodeFromImage } from '../utils/steganography';
import { downloadBlob, getMimeIcon } from '../utils/fileHelpers';
import type { DecodeResult, ToastMessage } from '../types';

interface DecodePanelProps {
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
}

export default function DecodePanel({ addToast }: DecodePanelProps) {
  const [encodedImage, setEncodedImage] = useState<File | null>(null);
  const [encodedPreview, setEncodedPreview] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);

  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);

  const [result, setResult] = useState<DecodeResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImage = useCallback((file: File) => {
    setEncodedImage(file);
    setResult(null);
    const url = URL.createObjectURL(file);
    setEncodedPreview(url);
  }, []);

  const clearImage = useCallback(() => {
    if (encodedPreview) URL.revokeObjectURL(encodedPreview);
    setEncodedImage(null);
    setEncodedPreview('');
    setResult(null);
    setNeedsPassword(false);
  }, [encodedPreview]);

  const handleDecode = async (pwd?: string) => {
    if (!encodedImage) { addToast('error', 'No image', 'Please upload an encoded image first.'); return; }

    setIsDecoding(true);
    setResult(null);
    setProgress(0);

    try {
      const decoded = await decodeFromImage(
        encodedImage,
        pwd,
        (pct, msg) => { setProgress(pct); if (msg) setProgressMsg(msg); }
      );
      setResult(decoded);
      setNeedsPassword(false);
      addToast('success', 'Decoded!', `Found: ${decoded.filename}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.toLowerCase().includes('password')) {
        setNeedsPassword(true);
        addToast('warning', 'Password required', 'This image is encrypted. Enter the passphrase.');
      } else {
        addToast('error', 'Decoding failed', message);
      }
    } finally {
      setIsDecoding(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.data.buffer as ArrayBuffer], { type: result.mimeType });
    downloadBlob(blob, result.filename);
    addToast('success', 'Downloaded!', result.filename);
  };

  const handleCopy = async () => {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    addToast('success', 'Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="decode" className="w-full max-w-2xl mx-auto px-4 scroll-mt-24 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 text-[#00d4ff] text-xs tracking-widest mb-2">
          <Search size={12} />
          <span>DECODE</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Extract Hidden Data</h2>
        <p className="text-[#ffffff50] text-sm">Upload a STEGIFY-encoded PNG to reveal and download the hidden content</p>
      </div>

      <div className="panel-glass p-6 space-y-5">
        {/* Image upload */}
        <div className="space-y-2">
          <label className="text-xs text-[#ffffff60] tracking-wider">ENCODED IMAGE</label>
          <DropZone
            label="Upload encoded PNG image"
            accept="image/png"
            acceptMimes={['image/']}
            file={encodedImage}
            onFile={handleImage}
            onClear={clearImage}
            preview={encodedPreview}
            hint="The image containing hidden data"
            color="blue"
            icon="image"
          />
        </div>

        {/* Password field — shown if needed or user wants to pre-enter */}
        {(needsPassword || password) && (
          <PasswordInput
            value={password}
            onChange={setPassword}
            label="Decryption passphrase"
            placeholder="Enter the passphrase used during encoding…"
          />
        )}

        {!needsPassword && !password && encodedImage && (
          <button
            onClick={() => setNeedsPassword(true)}
            className="text-xs text-[#ffffff40] hover:text-[#9d4edd] transition-colors"
          >
            + Provide passphrase (if image is encrypted)
          </button>
        )}

        {/* Progress */}
        {isDecoding && (
          <ProgressBar percent={progress} message={progressMsg} color="blue" />
        )}

        {/* Decode button */}
        <button
          onClick={() => handleDecode(password || undefined)}
          disabled={isDecoding || !encodedImage}
          className="w-full py-3 rounded-lg bg-[#00d4ff] text-[#0a0a0f] font-bold text-sm tracking-wider hover:bg-[#00d4ffdd] transition-all hover:shadow-[0_0_20px_#00d4ff40] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isDecoding ? 'DECODING…' : 'DECODE IMAGE'}
        </button>

        {/* Result */}
        {result && (
          <div className="p-4 rounded-xl border border-[#00d4ff30] bg-[#00d4ff08] space-y-4 slide-up">
            {/* File info */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getMimeIcon(result.mimeType)}</div>
              <div>
                <p className="text-sm text-white font-medium">{result.filename}</p>
                <p className="text-xs text-[#ffffff50]">{result.mimeType}</p>
              </div>
            </div>

            {/* Text preview */}
            {result.type === 'text' && result.text && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-[#ffffff60]">
                  <FileText size={10} />
                  <span>MESSAGE CONTENT</span>
                </div>
                <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#ffffff10] max-h-40 overflow-y-auto">
                  <pre className="text-xs text-[#ffffff80] whitespace-pre-wrap break-all">{result.text}</pre>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-xs text-[#00d4ff] hover:text-white transition-colors"
                >
                  {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>
              </div>
            )}

            {result.type === 'file' && (
              <div className="flex items-center gap-2 text-xs text-[#ffffff60]">
                <File size={10} />
                <span>File decoded successfully and ready to download</span>
              </div>
            )}

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#00d4ff60] text-[#00d4ff] text-sm font-medium hover:bg-[#00d4ff15] transition-all"
            >
              <Download size={14} />
              DOWNLOAD {result.filename}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
