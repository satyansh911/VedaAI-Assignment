'use client';

import { Minus, Plus } from 'lucide-react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function Stepper({ value, onChange, min = 1, max = 999 }: Props) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="flex items-center justify-between bg-surface rounded-full ring-1 ring-ink-200 px-1.5 py-1 h-9 w-full">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        className="w-6 h-6 rounded-full flex items-center justify-center text-ink-700 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease"
      >
        <Minus className="w-3.5 h-3.5" strokeWidth={2.25} />
      </button>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
        className="stepper-input w-10 bg-transparent text-center text-[14px] font-semibold text-ink-900 focus:outline-none"
        min={min}
        max={max}
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        className="w-6 h-6 rounded-full flex items-center justify-center text-ink-700 hover:bg-ink-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
