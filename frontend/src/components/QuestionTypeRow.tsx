'use client';

import { ChevronDown, X } from 'lucide-react';
import { Stepper } from './Stepper';
import { QuestionTypeRequest } from '@/types/assignment';

const TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'True / False',
  'Fill in the Blanks',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Match the Following',
];

interface Props {
  value: QuestionTypeRequest;
  onChange: (v: QuestionTypeRequest) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function QuestionTypeRow({ value, onChange, onRemove, canRemove }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Type selector row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <select
            value={value.type}
            onChange={(e) => onChange({ ...value, type: e.target.value })}
            className="w-full appearance-none bg-surface rounded-full ring-1 ring-ink-200 pl-4 pr-10 h-9 text-[14px] font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-ink-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Remove row"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Steppers row */}
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <Stepper
            value={value.count}
            onChange={(n) => onChange({ ...value, count: n })}
            min={1}
            max={50}
          />
        </div>
        <div className="flex-1 min-w-0">
          <Stepper
            value={value.marksPerQuestion}
            onChange={(n) => onChange({ ...value, marksPerQuestion: n })}
            min={1}
            max={100}
          />
        </div>
      </div>
    </div>
  );
}
