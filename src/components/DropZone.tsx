import { useRef } from 'react';
import { Upload, X, Image as ImageIcon, File } from 'lucide-react';
import { useDragDrop } from '../hooks/useDragDrop';
import { formatBytes } from '../utils/fileHelpers';

interface DropZoneProps {
  label: string;
  accept?: string;
  acceptMimes?: string[];
  file: File | null;
  onFile: (file: File) => void;
  onClear: () => void;
  preview?: string;
  hint?: string;
  color?: 'green' | 'blue' | 'purple';
  icon?: 'image' | 'file';
}

const colorMap = {
  green: {
    border: 'border-[#00ff9f30]',
    hoverBorder: 'hover:border-[#00ff9f60]',
    text: 'text-[#00ff9f]',
    bg: 'bg-[#00ff9f08]',
    iconBg: 'bg-[#00ff9f15]',
  },
  blue: {
    border: 'border-[#00d4ff30]',
    hoverBorder: 'hover:border-[#00d4ff60]',
    text: 'text-[#00d4ff]',
    bg: 'bg-[#00d4ff08]',
    iconBg: 'bg-[#00d4ff15]',
  },
  purple: {
    border: 'border-[#9d4edd30]',
    hoverBorder: 'hover:border-[#9d4edd60]',
    text: 'text-[#9d4edd]',
    bg: 'bg-[#9d4edd08]',
    iconBg: 'bg-[#9d4edd15]',
  },
};

export default function DropZone({
  label, accept, acceptMimes, file, onFile, onClear, preview, hint,
  color = 'green', icon = 'file'
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const c = colorMap[color];

  const { isDragging, handleDragEnter, handleDragLeave, handleDragOver, handleDrop } = useDragDrop({
    onDrop: (files) => onFile(files[0]),
    accept: acceptMimes,
  });

  const Icon = icon === 'image' ? ImageIcon : File;

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer
        ${isDragging ? 'border-[#00ff9f] bg-[#00ff9f08] shadow-[0_0_20px_#00ff9f30]' : `${c.border} ${c.hoverBorder}`}
        ${file ? 'bg-[#0d0d1a]' : 'bg-transparent hover:' + c.bg}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      {file ? (
        <div className="p-4 flex items-center gap-4">
          {/* Preview or icon */}
          {preview ? (
            <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-[#ffffff10]" />
          ) : (
            <div className={`w-12 h-12 rounded-lg ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={c.text} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{file.name}</p>
            <p className="text-xs text-[#ffffff50]">{formatBytes(file.size)} · {file.type || 'unknown type'}</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClear(); }}
            className="p-1.5 rounded-lg hover:bg-[#ff000020] text-[#ffffff40] hover:text-[#ff6b6b] transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="p-8 flex flex-col items-center gap-3 text-center">
          <div className={`w-12 h-12 rounded-xl ${c.iconBg} flex items-center justify-center`}>
            <Upload size={20} className={c.text} />
          </div>
          <div>
            <p className="text-sm text-[#ffffff80]">{label}</p>
            {hint && <p className="text-xs text-[#ffffff40] mt-1">{hint}</p>}
          </div>
          <p className="text-xs text-[#ffffff30]">
            {isDragging ? 'Drop it!' : 'Drag & drop or click to browse'}
          </p>
        </div>
      )}
    </div>
  );
}
