'use client';

import { useState } from 'react';
import { marked } from 'marked';
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Loader2,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';

type ToolId = 'lesson_plan' | 'rubric' | 'study_notes';

const TOOLS: { id: ToolId; label: string; description: string; icon: React.ReactNode; example: string }[] = [
  {
    id: 'lesson_plan',
    label: 'Lesson Plan Generator',
    description: 'Produce a complete, classroom-ready lesson plan with objectives and activities.',
    icon: <ClipboardList className="w-5 h-5" />,
    example: 'Photosynthesis in green plants',
  },
  {
    id: 'rubric',
    label: 'Rubric Builder',
    description: 'Create a 4-level grading rubric for any assignment or project.',
    icon: <GraduationCap className="w-5 h-5" />,
    example: 'Group science fair project',
  },
  {
    id: 'study_notes',
    label: 'Study Notes Generator',
    description: 'Generate concise, student-friendly study notes with examples and practice.',
    icon: <BookOpen className="w-5 h-5" />,
    example: 'Pythagoras theorem with applications',
  },
];

export function ToolkitView() {
  const [tool, setTool] = useState<ToolId>('lesson_plan');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const active = TOOLS.find((t) => t.id === tool)!;

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setContent('');
    try {
      const res = await api.generateToolkit({
        tool,
        topic: topic.trim(),
        subject: subject.trim() || undefined,
        gradeLevel: gradeLevel.trim() || undefined,
        duration: duration ? Number(duration) : undefined,
        notes: notes.trim() || undefined,
      });
      setContent(res.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  function onCopy() {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-extrabold text-ink-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          AI Teacher’s Toolkit
        </h1>
        <p className="text-[13px] text-ink-500 dark:text-ink-400">
          Pick a tool, describe the topic, and let the assistant draft it for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTool(t.id);
              setContent('');
            }}
            className={[
              'text-left rounded-3xl p-5 transition-all ring-1',
              tool === t.id
                ? 'ring-accent shadow-accent-glow bg-surface dark:bg-surface-dark'
                : 'ring-ink-200 dark:ring-inset-dark bg-surface dark:bg-surface-dark hover:ring-accent/60',
            ].join(' ')}
          >
            <div className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
              {t.icon}
            </div>
            <h3 className="mt-3 text-[15px] font-extrabold text-ink-900 dark:text-white">
              {t.label}
            </h3>
            <p className="mt-1 text-[12px] text-ink-500 dark:text-ink-400">{t.description}</p>
          </button>
        ))}
      </div>

      <form
        onSubmit={onGenerate}
        className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-5 md:p-6 flex flex-col gap-3"
      >
        <Field
          label="Topic"
          value={topic}
          onChange={setTopic}
          placeholder={`e.g. "${active.example}"`}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Subject (optional)" value={subject} onChange={setSubject} placeholder="e.g. Biology" />
          <Field label="Grade level (optional)" value={gradeLevel} onChange={setGradeLevel} placeholder="e.g. 8th" />
          <Field
            label="Duration in minutes (optional)"
            type="number"
            value={duration}
            onChange={setDuration}
            placeholder="e.g. 45"
          />
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-ink-700 dark:text-ink-300">
            Additional context (optional)
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any specific focus areas, learner needs, etc."
            className="rounded-2xl bg-page dark:bg-inset-dark border border-transparent focus:border-accent focus:outline-none p-3 text-[14px] text-ink-900 dark:text-white"
          />
        </label>

        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 md:justify-end">
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="inline-flex items-center gap-2 px-5 h-11 rounded-pill bg-ink-900 dark:bg-accent text-white text-[13px] font-semibold hover:bg-ink-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent-400" />}
            {loading ? 'Generating…' : `Generate ${active.label}`}
          </button>
        </div>
      </form>

      {content && (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-extrabold text-ink-900 dark:text-white">Result</h2>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-2 px-3 h-9 rounded-pill bg-page dark:bg-inset-dark text-[12px] font-semibold text-ink-900 dark:text-white hover:bg-ink-100"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div
            className="md-content"
            dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
          />
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-semibold text-ink-700 dark:text-ink-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="h-11 rounded-pill bg-page dark:bg-inset-dark border border-transparent focus:border-accent focus:outline-none px-4 text-[14px] text-ink-900 dark:text-white"
      />
    </label>
  );
}
