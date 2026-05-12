import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export default function PasswordInput({ value, onChange, placeholder = 'Enter passphrase…', label }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs text-[#ffffff60] flex items-center gap-1.5">
          <Lock size={10} className="text-[#9d4edd]" />
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#0a0a0f] border border-[#9d4edd30] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#ffffff30] focus:outline-none focus:border-[#9d4edd80] focus:shadow-[0_0_10px_#9d4edd20] transition-all pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ffffff40] hover:text-[#9d4edd] transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}
