import { useState, useCallback } from 'react';
import { Lock, Unlock, FileText, File, Download, Cpu, AlertCircle } from 'lucide-react';
import DropZone from './DropZone';
import PasswordInput from './PasswordInput';
import ProgressBar from './ProgressBar';
import CapacityIndicator from './CapacityIndicator';
import { encodeIntoImage } from '../utils/steganography';
import { downloadBlob, formatBytes, textToBase64 } from '../utils/fileHelpers';
import type { ToastMessage } from '../types';

interface EncodePanelProps {
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
}

type SecretMode = 'file' | 'text';

interface ImageDimensions { width: number; height: number; }

export default function EncodePanel({ addToast }: EncodePanelProps) {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [imageDims, setImageDims] = useState<ImageDimensions | null>(null);

  const [secretMode, setSecretMode] = useState<SecretMode>('file');
  const [secretFile, setSecretFile] = useState<File | null>(null);
  const [secretText, setSecretText] = useState('');

  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');

  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleCoverImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Invalid file', 'Please upload a PNG or image file.');
      return;
    }
    setCoverImage(file);
    setResultBlob(null);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
    const img = new Image();
    img.onload = () => {
      setImageDims({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
      const newUrl = URL.createObjectURL(file);
      setCoverPreview(newUrl);
    };
    img.src = url;
  }, [addToast]);

  const clearCover = useCallback(() => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverImage(null);
    setCoverPreview('');
    setImageDims(null);
    setResultBlob(null);
  }, [coverPreview]);

  // Estimate payload size for capacity indicator
  const estimatedPayloadBytes = (() => {
    if (secretMode === 'file' && secretFile) {
      return Math.ceil(secretFile.size * 1.37) + 200; // base64 overhead + metadata
    }
    if (secretMode === 'text' && secretText) {
      const b64 = textToBase64(secretText);
      return b64.length + 200;
    }
    return 0;
  })();

  const handleEncode = async () => {
    if (!coverImage) { addToast('error', 'No cover image', 'Please upload a PNG cover image.'); return; }
    if (secretMode === 'file' && !secretFile) { addToast('error', 'No secret file', 'Please upload the file to hide.'); return; }
    if (secretMode === 'text' && !secretText.trim()) { addToast('error', 'No message', 'Please enter a secret message.'); return; }
    if (usePassword && !password) { addToast('error', 'No password', 'Enter a password or disable encryption.'); return; }
    if (!coverImage.type.includes('png') && !coverImage.name.endsWith('.png')) {
      addToast('warning', 'Non-PNG detected', 'For best results use a PNG. Other formats may lose data on re-save.');
    }

    setIsEncoding(true);
    setResultBlob(null);
    setProgress(0);

    try {
      const blob = await encodeIntoImage(
        coverImage,
        secretMode === 'file' ? secretFile! : undefined,
        secretMode === 'text' ? secretText : undefined,
        usePassword ? password : undefined,
        (pct, msg) => { setProgress(pct); if (msg) setProgressMsg(msg); }
      );
      setResultBlob(blob);
      addToast('success', 'Encoding complete!', 'Your image is ready to download.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      addToast('error', 'Encoding failed', message);
    } finally {
      setIsEncoding(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const baseName = coverImage?.name.replace(/\.[^.]+$/, '') || 'encoded';
    downloadBlob(resultBlob, `${baseName}_stegify.png`);
    addToast('success', 'Downloaded!', 'Share the PNG via direct file transfer or Telegram.');
  };

  return (
    <section id="encode" className="max-w-2xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 text-[#00ff9f] text-xs tracking-widest mb-2">
          <Cpu size={12} />
          <span>ENCODE</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Hide Data in Image</h2>
        <p className="text-[#ffffff50] text-sm">Embed a secret file or message into a PNG image using LSB steganography</p>
      </div>

      <div className="panel-glass p-6 space-y-5">
        {/* Step 1: Cover image */}
        <div className="space-y-2">
          <label className="text-xs text-[#ffffff60] tracking-wider flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#00ff9f20] text-[#00ff9f] text-[10px] flex items-center justify-center font-bold">1</span>
            COVER IMAGE (PNG recommended)
          </label>
          <DropZone
            label="Upload cover PNG image"
            accept="image/*"
            acceptMimes={['image/']}
            file={coverImage}
            onFile={handleCoverImage}
            onClear={clearCover}
            preview={coverPreview}
            hint="The image that will visually hide your secret"
            color="green"
            icon="image"
          />
        </div>

        {/* Capacity indicator */}
        {imageDims && (
          <CapacityIndicator
            imageWidth={imageDims.width}
            imageHeight={imageDims.height}
            payloadBytes={estimatedPayloadBytes}
          />
        )}

        {/* Step 2: Secret content */}
        <div className="space-y-2">
          <label className="text-xs text-[#ffffff60] tracking-wider flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#00d4ff20] text-[#00d4ff] text-[10px] flex items-center justify-center font-bold">2</span>
            SECRET CONTENT
          </label>

          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[#ffffff15] text-xs">
            <button
              onClick={() => setSecretMode('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 transition-all ${
                secretMode === 'file'
                  ? 'bg-[#00d4ff15] text-[#00d4ff] border-r border-[#00d4ff30]'
                  : 'text-[#ffffff50] hover:text-white border-r border-[#ffffff10]'
              }`}
            >
              <File size={12} /> File
            </button>
            <button
              onClick={() => setSecretMode('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 transition-all ${
                secretMode === 'text'
                  ? 'bg-[#00d4ff15] text-[#00d4ff]'
                  : 'text-[#ffffff50] hover:text-white'
              }`}
            >
              <FileText size={12} /> Text
            </button>
          </div>

          {secretMode === 'file' ? (
            <DropZone
              label="Upload secret file to hide"
              file={secretFile}
              onFile={setSecretFile}
              onClear={() => setSecretFile(null)}
              hint="Any file type supported"
              color="blue"
            />
          ) : (
            <textarea
              value={secretText}
              onChange={e => setSecretText(e.target.value)}
              placeholder="Type your secret message here…"
              rows={4}
              className="w-full bg-[#0a0a0f] border border-[#00d4ff30] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#ffffff30] focus:outline-none focus:border-[#00d4ff60] resize-none transition-all"
            />
          )}
        </div>

        {/* Step 3: Encryption */}
        <div className="space-y-2">
          <label className="text-xs text-[#ffffff60] tracking-wider flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-[#9d4edd20] text-[#9d4edd] text-[10px] flex items-center justify-center font-bold">3</span>
            ENCRYPTION (optional)
          </label>
          <button
            onClick={() => { setUsePassword(p => !p); setPassword(''); }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm transition-all ${
              usePassword
                ? 'border-[#9d4edd60] bg-[#9d4edd10] text-[#9d4edd]'
                : 'border-[#ffffff15] text-[#ffffff50] hover:border-[#9d4edd40]'
            }`}
          >
            <div className="flex items-center gap-2">
              {usePassword ? <Lock size={14} /> : <Unlock size={14} />}
              <span>{usePassword ? 'AES-256 encryption enabled' : 'Enable AES-256 encryption'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-all ${usePassword ? 'bg-[#9d4edd]' : 'bg-[#ffffff20]'} relative`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${usePassword ? 'left-4' : 'left-0.5'}`} />
            </div>
          </button>
          {usePassword && (
            <PasswordInput
              value={password}
              onChange={setPassword}
              label="Passphrase"
              placeholder="Enter a strong passphrase…"
            />
          )}
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[#ffaa0008] border border-[#ffaa0030] text-xs text-[#ffaa00]">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          <span>
            Social media apps (WhatsApp, Instagram, Twitter) recompress images and will destroy hidden data.
            Share via <strong>direct file transfer</strong>, <strong>Telegram file attachment</strong>, or email.
          </span>
        </div>

        {/* Progress */}
        {isEncoding && (
          <ProgressBar percent={progress} message={progressMsg} color="green" />
        )}

        {/* Encode button */}
        <button
          onClick={handleEncode}
          disabled={isEncoding}
          className="w-full py-3 rounded-lg bg-[#00ff9f] text-[#0a0a0f] font-bold text-sm tracking-wider hover:bg-[#00ff9fdd] transition-all hover:shadow-[0_0_20px_#00ff9f40] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isEncoding ? 'ENCODING…' : 'ENCODE & HIDE DATA'}
        </button>

        {/* Result */}
        {resultBlob && (
          <div className="p-4 rounded-xl border border-[#00ff9f30] bg-[#00ff9f08] space-y-3">
            <div className="flex items-center gap-2 text-[#00ff9f] text-sm">
              <Download size={14} />
              <span>Encoded image ready — {formatBytes(resultBlob.size)}</span>
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-2.5 rounded-lg border border-[#00ff9f60] text-[#00ff9f] text-sm font-medium hover:bg-[#00ff9f15] transition-all"
            >
              DOWNLOAD ENCODED PNG
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
