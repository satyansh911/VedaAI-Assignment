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
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-12 md:col-span-6 relative">
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

      <div className="col-span-1 md:col-span-1 flex justify-center">
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="w-7 h-7 rounded-full flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Remove row"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="col-span-5 md:col-span-2">
        <Stepper
          value={value.count}
          onChange={(n) => onChange({ ...value, count: n })}
          min={1}
          max={50}
        />
      </div>

      <div className="col-span-6 md:col-span-3">
        <Stepper
          value={value.marksPerQuestion}
          onChange={(n) => onChange({ ...value, marksPerQuestion: n })}
          min={1}
          max={100}
        />
      </div>
    </div>
  );
}
