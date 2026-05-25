import Link from 'next/link';
import { Plus } from 'lucide-react';

export function EmptyAssignments() {
  return (
    <div className="flex flex-col items-center text-center py-12 md:py-20 px-6">
      <EmptyIllustration />
      <h2 className="mt-8 text-[20px] md:text-[22px] font-extrabold text-ink-900 dark:text-white">
        No assignments yet
      </h2>
      <p className="mt-2 text-[14px] text-ink-500 dark:text-ink-400 max-w-md">
        Create your first assignment to start collecting and grading student submissions. You
        can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <Link
        href="/create"
        className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-pill bg-ink-900 dark:bg-accent text-white text-[14px] font-semibold hover:bg-ink-800 shadow-dark-pill transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Create Your First Assignment
      </Link>
    </div>
  );
}

function EmptyIllustration() {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="110" cy="110" r="92" fill="#F5F5F5" />
      <circle cx="110" cy="110" r="76" fill="#FFFFFF" />
      {/* squiggle */}
      <path
        d="M44 110 C 56 86, 72 100, 64 116 S 50 134, 60 142"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* document */}
      <rect x="86" y="58" width="68" height="92" rx="6" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="2" />
      <rect x="96" y="72" width="34" height="6" rx="3" fill="#1A1A1A" />
      <rect x="96" y="86" width="48" height="3" rx="1.5" fill="#E5E5E5" />
      <rect x="96" y="94" width="48" height="3" rx="1.5" fill="#E5E5E5" />
      <rect x="96" y="102" width="38" height="3" rx="1.5" fill="#E5E5E5" />
      {/* magnifier */}
      <circle cx="140" cy="128" r="22" fill="#FFFFFF" stroke="#8B7DD8" strokeWidth="3" />
      <path
        d="M132 120 L148 136 M148 120 L132 136"
        stroke="#EF4444"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="156"
        y1="144"
        x2="172"
        y2="160"
        stroke="#8B7DD8"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* sparkles */}
      <path
        d="M70 150 L72 156 L78 158 L72 160 L70 166 L68 160 L62 158 L68 156 Z"
        fill="#60A5FA"
      />
      <circle cx="170" cy="92" r="3" fill="#60A5FA" />
      <rect x="158" y="74" width="20" height="8" rx="4" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1.5" />
      <line x1="162" y1="78" x2="174" y2="78" stroke="#E5E5E5" strokeWidth="1.5" />
    </svg>
  );
}
