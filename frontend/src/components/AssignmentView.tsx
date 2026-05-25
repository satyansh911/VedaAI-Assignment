'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Loader2,
  AlertTriangle,
  RefreshCcw,
  FileDown,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useAssignmentSocket } from '@/hooks/useAssignmentSocket';
import { useAuth } from '@/context/AuthContext';
import { QuestionPaper } from './QuestionPaper';
import { Assignment } from '@/types/assignment';

interface Props {
  assignmentId: string;
}

export function AssignmentView({ assignmentId }: Props) {
  const { current, setCurrent, setStatus } = useAssignmentStore();
  const { user } = useAuth();
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savingLib, setSavingLib] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const refetch = useCallback(async () => {
    try {
      const fresh = await api.getAssignment(assignmentId);
      setCurrent(fresh);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load assignment');
    }
  }, [assignmentId, setCurrent]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useAssignmentSocket(assignmentId, (event) => {
    if (event.type === 'status') {
      setStatus(event.status, event.message);
      return;
    }
    if (event.type === 'completed') {
      refetch();
      return;
    }
    if (event.type === 'failed') {
      setStatus('failed', event.error);
    }
  });

  useEffect(() => {
    if (!current || current.status === 'completed' || current.status === 'failed') return;
    const t = setInterval(refetch, 4000);
    return () => clearInterval(t);
  }, [current, refetch]);

  async function onRegenerate() {
    setRegenerating(true);
    try {
      await api.regenerate(assignmentId);
      setStatus('pending');
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  }

  async function onToggleLibrary() {
    if (!current) return;
    setSavingLib(true);
    try {
      const next = !current.savedToLibrary;
      await api.toggleLibrary(assignmentId, next);
      setCurrent({ ...current, savedToLibrary: next });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLib(false);
    }
  }

  async function onDownload() {
    if (!paperRef.current || !current?.paper) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, jsPDFMod] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const { jsPDF } = jsPDFMod;

      const canvas = await html2canvas(paperRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const usableWidth = pageWidth - margin * 2;
      const ratio = usableWidth / canvas.width;
      const imgHeight = canvas.height * ratio;

      let position = margin;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      const filename = `${current.paper.title.replace(/[^a-z0-9]+/gi, '_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF export failed', err);
      alert('Failed to export PDF — please try again');
    } finally {
      setDownloading(false);
    }
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-surface dark:bg-surface-dark shadow-card">
        <p className="text-red-600 font-semibold">{loadError}</p>
      </div>
    );
  }
  if (!current) {
    return (
      <div className="max-w-3xl mx-auto p-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-ink-500" />
      </div>
    );
  }

  const isWorking = current.status === 'pending' || current.status === 'processing';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="max-w-5xl mx-auto px-1 flex flex-col gap-4">
      <DarkHeaderCard
        assignment={current}
        firstName={firstName}
        onDownload={onDownload}
        onRegenerate={onRegenerate}
        onToggleLibrary={onToggleLibrary}
        regenerating={regenerating}
        downloading={downloading}
        savingLib={savingLib}
        isWorking={isWorking}
      />

      {current.status === 'failed' && (
        <div className="flex items-start gap-3 p-4 rounded-3xl bg-red-50 ring-1 ring-red-200 text-red-800">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="text-[14px]">
            <p className="font-semibold mb-0.5">Generation failed</p>
            <p>{current.error ?? 'Something went wrong.'}</p>
            <button
              onClick={onRegenerate}
              disabled={regenerating}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface ring-1 ring-red-300 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Try again
            </button>
          </div>
        </div>
      )}

      {isWorking && <ProgressCard title={current.title} status={current.status as 'pending' | 'processing'} />}

      {current.status === 'completed' && current.paper && (
        <div className="bg-surface rounded-3xl shadow-card overflow-hidden">
          <QuestionPaper ref={paperRef} assignment={current} />
        </div>
      )}
    </div>
  );
}

function DarkHeaderCard({
  assignment,
  firstName,
  onDownload,
  onRegenerate,
  onToggleLibrary,
  regenerating,
  downloading,
  savingLib,
  isWorking,
}: {
  assignment: Assignment;
  firstName: string;
  onDownload: () => void;
  onRegenerate: () => void;
  onToggleLibrary: () => void;
  regenerating: boolean;
  downloading: boolean;
  savingLib: boolean;
  isWorking: boolean;
}) {
  const subject = assignment.paper?.subject ?? assignment.subject ?? 'class';
  const grade = assignment.gradeLevel ?? '';
  const completed = assignment.status === 'completed';
  const saved = !!assignment.savedToLibrary;

  const message = isWorking
    ? `Generating your customized Question Paper for your ${grade ? `${grade} ` : ''}${subject} class…`
    : `Certainly, ${firstName}! Here are customized Question Paper for your ${grade ? `${grade} ` : ''}${subject} class on the NCERT chapters:`;

  return (
    <section className="bg-ink-900 rounded-3xl p-5 md:p-7 text-white shadow-dark-pill">
      <div className="flex items-start gap-3">
        <span className="mt-1 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-accent-400">
          <SparkleIcon />
        </span>
        <p className="text-[14px] md:text-[15px] font-semibold leading-relaxed flex-1">
          {message}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownload}
          disabled={!completed || downloading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-surface text-ink-900 text-[13px] font-semibold hover:bg-ink-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          Download as PDF
        </button>
        {completed && (
          <>
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white/10 hover:bg-white/15 text-white text-[13px] font-semibold disabled:opacity-50 transition-colors"
            >
              {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              Regenerate
            </button>
            <button
              type="button"
              onClick={onToggleLibrary}
              disabled={savingLib}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white/10 hover:bg-white/15 text-white text-[13px] font-semibold disabled:opacity-50 transition-colors"
            >
              {savingLib ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <BookmarkCheck className="w-4 h-4 text-accent-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              {saved ? 'Saved to Library' : 'Save to Library'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function ProgressCard({ title, status }: { title: string; status: 'pending' | 'processing' }) {
  const label =
    status === 'pending' ? 'Queued for generation…' : 'Crafting your questions…';
  return (
    <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-10 text-center">
      <Loader2 className="w-10 h-10 mx-auto text-ink-900 dark:text-white animate-spin" />
      <h2 className="mt-4 text-[16px] font-bold text-ink-900 dark:text-white">{label}</h2>
      <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-400">
        Working on <span className="font-semibold text-ink-900 dark:text-white">{title}</span>. This
        usually takes 10–30 seconds.
      </p>
      <div className="mt-6 max-w-xs mx-auto h-1 bg-ink-100 dark:bg-inset-dark rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-ink-900 dark:bg-accent rounded-full animate-pulse" />
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 0.5 L8.5 5 L13 6.5 L8.5 8 L7 12.5 L5.5 8 L1 6.5 L5.5 5 Z"
        fill="currentColor"
      />
    </svg>
  );
}
