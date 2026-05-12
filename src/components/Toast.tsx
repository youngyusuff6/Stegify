import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const config = {
  success: { icon: CheckCircle, border: 'border-[#00ff9f40]', bg: 'bg-[#00ff9f08]', iconColor: 'text-[#00ff9f]' },
  error: { icon: AlertCircle, border: 'border-[#ff444440]', bg: 'bg-[#ff444408]', iconColor: 'text-[#ff4444]' },
  warning: { icon: AlertTriangle, border: 'border-[#ffaa0040]', bg: 'bg-[#ffaa0008]', iconColor: 'text-[#ffaa00]' },
  info: { icon: Info, border: 'border-[#00d4ff40]', bg: 'bg-[#00d4ff08]', iconColor: 'text-[#00d4ff]' },
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:w-80 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => {
        const { icon: Icon, border, bg, iconColor } = config[toast.type];
        return (
          <div
            key={toast.id}
            className={`slide-up pointer-events-auto flex items-start gap-3 p-3 rounded-xl border ${border} ${bg} backdrop-blur-md shadow-2xl`}
          >
            <Icon size={16} className={`${iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">{toast.title}</p>
              {toast.message && <p className="text-xs text-[#ffffff60] mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-[#ffffff30] hover:text-white transition-colors flex-shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
