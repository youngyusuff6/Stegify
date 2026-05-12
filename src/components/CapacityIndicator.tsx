import { HardDrive, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatBytes } from '../utils/fileHelpers';
import { getImageCapacity } from '../utils/steganography';

interface CapacityIndicatorProps {
  imageWidth: number;
  imageHeight: number;
  payloadBytes: number;
}

export default function CapacityIndicator({ imageWidth, imageHeight, payloadBytes }: CapacityIndicatorProps) {
  const capacity = getImageCapacity(imageWidth, imageHeight);
  const percent = Math.min((payloadBytes / capacity) * 100, 100);
  const remaining = capacity - payloadBytes;
  const isOver = payloadBytes > capacity;

  const barColor = isOver
    ? 'from-[#ff4444] to-[#ff8888]'
    : percent > 80
    ? 'from-[#ffaa00] to-[#ff6b00]'
    : 'from-[#00ff9f] to-[#00d4ff]';

  const StatusIcon = isOver ? AlertTriangle : CheckCircle;
  const statusColor = isOver ? 'text-[#ff4444]' : percent > 80 ? 'text-[#ffaa00]' : 'text-[#00ff9f]';

  return (
    <div className="panel-glass p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#ffffff60]">
          <HardDrive size={12} />
          <span>IMAGE CAPACITY</span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${statusColor}`}>
          <StatusIcon size={12} />
          <span>{isOver ? 'OVER LIMIT' : 'OK'}</span>
        </div>
      </div>

      <div className="h-2 bg-[#1a1a3e] rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <div className="text-[#00ff9f] font-mono">{formatBytes(capacity)}</div>
          <div className="text-[#ffffff40]">Capacity</div>
        </div>
        <div>
          <div className={`font-mono ${isOver ? 'text-[#ff4444]' : 'text-[#00d4ff]'}`}>{formatBytes(payloadBytes)}</div>
          <div className="text-[#ffffff40]">Payload</div>
        </div>
        <div>
          <div className={`font-mono ${isOver ? 'text-[#ff4444]' : 'text-[#ffffff80]'}`}>
            {isOver ? `-${formatBytes(-remaining)}` : formatBytes(remaining)}
          </div>
          <div className="text-[#ffffff40]">Remaining</div>
        </div>
      </div>

      <div className="text-xs text-[#ffffff30] text-center">
        {imageWidth}×{imageHeight}px · ~{formatBytes(imageWidth * imageHeight * 3 / 8)} usable
      </div>
    </div>
  );
}
