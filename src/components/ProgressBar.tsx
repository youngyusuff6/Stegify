interface ProgressBarProps {
  percent: number;
  message?: string;
  color?: 'green' | 'blue' | 'purple';
}

const colors = {
  green: 'from-[#00ff9f] to-[#00d4ff]',
  blue: 'from-[#00d4ff] to-[#9d4edd]',
  purple: 'from-[#9d4edd] to-[#f72585]',
};

export default function ProgressBar({ percent, message, color = 'green' }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[#ffffff60]">{message || 'Processing…'}</span>
        <span className="text-[#00ff9f] font-mono">{Math.round(percent)}%</span>
      </div>
      <div className="h-2 bg-[#1a1a3e] rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-300 relative overflow-hidden`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        >
          {percent < 100 && (
            <div className="absolute inset-0 progress-stripes opacity-30" />
          )}
        </div>
      </div>
    </div>
  );
}
