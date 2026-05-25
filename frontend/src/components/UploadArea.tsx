'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = '.pdf,.txt,application/pdf,text/plain';

export function UploadArea({ file, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handleFile(f: File | null) {
    if (!f) return;
    if (f.size > MAX_BYTES) return;
    onChange(f);
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null);
  }

  if (file) {
    return (
      <div className="flex items-center justify-between bg-surface rounded-2xl ring-1 ring-ink-200 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center text-accent">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-ink-900 truncate">{file.name}</p>
            <p className="text-[12px] text-ink-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="w-8 h-8 rounded-full hover:bg-ink-100 flex items-center justify-center text-ink-500"
          aria-label="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className={[
          'rounded-2xl border-2 border-dashed bg-surface/60 px-6 py-8 flex flex-col items-center text-center transition-colors',
          drag ? 'border-accent bg-accent-50/50' : 'border-ink-300',
        ].join(' ')}
      >
        <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 mb-3">
          <UploadCloud className="w-5 h-5" strokeWidth={2} />
        </div>
        <p className="text-[15px] font-semibold text-ink-900">
          Choose a file or drag &amp; drop it here
        </p>
        <p className="text-[12px] text-ink-500 mt-1">PDF or TXT, up to 10 MB</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 px-5 py-2 rounded-full bg-surface ring-1 ring-ink-300 text-[13px] font-semibold text-ink-900 hover:bg-ink-100 transition-colors"
        >
          Browse Files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onPick}
          className="hidden"
        />
      </div>
      <p className="text-center text-[12px] text-ink-500 mt-2">
        Upload images of your preferred document/image
      </p>
      {error && <p className="text-center text-[12px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
