'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AssignmentSummary } from '@/types/assignment';

function formatDate(s: string): string {
  const d = new Date(s);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-sky-50 text-sky-700 ring-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
};

export function AssignmentCard({ assignment }: { assignment: AssignmentSummary }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleDelete() {
    if (!confirm(`Delete "${assignment.title}"?`)) return;
    setDeleting(true);
    try {
      await api.deleteAssignment(assignment._id);
      router.refresh();
    } catch (err) {
      alert('Failed to delete assignment');
      setDeleting(false);
    }
  }

  return (
    <div className="relative bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-5 md:p-6 hover:shadow-panel transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/assignment/${assignment._id}`}
          className="text-[18px] md:text-[20px] font-extrabold text-ink-900 dark:text-white underline decoration-1 underline-offset-4 hover:text-accent transition-colors"
        >
          {assignment.title}
        </Link>
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="w-8 h-8 rounded-full hover:bg-ink-100 dark:hover:bg-inset-dark flex items-center justify-center text-ink-500 dark:text-ink-400"
            aria-label="Menu"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {open && (
            <div className="absolute right-0 top-9 z-20 w-44 bg-surface dark:bg-surface-dark rounded-2xl shadow-panel ring-1 ring-ink-200 dark:ring-inset-dark py-1.5">
              <Link
                href={`/assignment/${assignment._id}`}
                className="block px-4 py-2 text-[13px] font-medium text-ink-900 dark:text-white hover:bg-ink-100 dark:hover:bg-inset-dark"
                onClick={() => setOpen(false)}
              >
                View Assignment
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  handleDelete();
                }}
                disabled={deleting}
                className="block w-full text-left px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[13px] text-ink-700 dark:text-ink-300">
        <p>
          <span className="font-bold text-ink-900 dark:text-white">Assigned on</span> :{' '}
          {formatDate(assignment.createdAt)}
        </p>
        <p>
          <span className="font-bold text-ink-900 dark:text-white">Due</span> :{' '}
          {formatDate(assignment.dueDate)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {assignment.status !== 'completed' && (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ring-1 ring-inset ${
              statusStyles[assignment.status] ?? statusStyles.pending
            }`}
          >
            {assignment.status}
          </span>
        )}
        {assignment.savedToLibrary && (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent/10 text-accent">
            In library
          </span>
        )}
      </div>
    </div>
  );
}
