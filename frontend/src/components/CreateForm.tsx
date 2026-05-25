'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarPlus, Mic, Plus, Loader2 } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { api } from '@/lib/api';
import { Group } from '@/types/group';
import { UploadArea } from './UploadArea';
import { QuestionTypeRow } from './QuestionTypeRow';

interface FieldErrors {
  title?: string;
  dueDate?: string;
  questionTypes?: string;
  submit?: string;
}

export function CreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    form,
    setForm,
    setQuestionType,
    addQuestionType,
    removeQuestionType,
  } = useAssignmentStore();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    api
      .listGroups()
      .then(setGroups)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const gid = searchParams?.get('groupId');
    if (gid && !form.groupId) setForm({ groupId: gid });
  }, [searchParams, form.groupId, setForm]);

  const totalQuestions = form.questionTypes.reduce((s, t) => s + (t.count || 0), 0);
  const totalMarks = form.questionTypes.reduce(
    (s, t) => s + (t.count || 0) * (t.marksPerQuestion || 0),
    0,
  );

  function validate() {
    const e: FieldErrors = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    else {
      const d = new Date(form.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) e.dueDate = 'Due date cannot be in the past';
    }
    if (!form.questionTypes.length) e.questionTypes = 'Add at least one question type';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      if (form.subject) fd.append('subject', form.subject);
      if (form.gradeLevel) fd.append('gradeLevel', form.gradeLevel);
      fd.append('dueDate', form.dueDate);
      fd.append('questionTypes', JSON.stringify(form.questionTypes));
      if (form.additionalInstructions)
        fd.append('additionalInstructions', form.additionalInstructions);
      if (form.groupId) fd.append('groupId', form.groupId);
      if (form.file) fd.append('file', form.file);

      const { id } = await api.createAssignment(fd);
      router.push(`/assignment/${id}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to submit' });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Page header */}
      <div className="px-1">
        <div className="flex items-start gap-3 mb-4">
          <span className="mt-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
          <div>
            <h1 className="text-[22px] font-extrabold text-ink-900 dark:text-white leading-tight">
              Create Assignment
            </h1>
            <p className="text-[13px] text-ink-500 dark:text-ink-400 mt-0.5">
              Set up a new assignment for your students
            </p>
          </div>
        </div>
        <ProgressBar step={1} total={2} />
      </div>

      {/* Main card */}
      <section className="bg-gradient-to-b from-ink-100 to-surface dark:from-surface-dark-2 dark:to-surface-dark ring-1 ring-ink-200 dark:ring-inset-dark rounded-3xl p-5 md:p-8 shadow-card">
        <header className="mb-5">
          <h2 className="text-[18px] font-bold text-ink-900 dark:text-white">Assignment Details</h2>
          <p className="text-[13px] text-ink-500 dark:text-ink-400 mt-0.5">
            Basic information about your assignment
          </p>
        </header>

        <UploadArea
          file={form.file}
          onChange={(f) => setForm({ file: f })}
        />

        {/* Title (was missing in Figma but required by backend — present discreetly) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Assignment Title" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ title: e.target.value })}
              placeholder="e.g. Quiz on Electricity"
              className={pillInput(!!errors.title)}
            />
          </Field>
          <Field label="Subject">
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ subject: e.target.value })}
              placeholder="e.g. Science"
              className={pillInput(false)}
            />
          </Field>
          <Field label="Class / Grade">
            <input
              type="text"
              value={form.gradeLevel}
              onChange={(e) => setForm({ gradeLevel: e.target.value })}
              placeholder="e.g. Grade 8"
              className={pillInput(false)}
            />
          </Field>
          <Field label="Due Date" required error={errors.dueDate}>
            <div className="relative">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ dueDate: e.target.value })}
                placeholder="DD-MM-YYYY"
                className={pillInput(!!errors.dueDate) + ' pr-11'}
              />
              <CalendarPlus className="w-4 h-4 text-ink-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </Field>
          {groups.length > 0 && (
            <Field label="Group (optional)">
              <select
                value={form.groupId}
                onChange={(e) => setForm({ groupId: e.target.value })}
                className={pillInput(false)}
              >
                <option value="">— No group —</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {/* Question types */}
        <div className="mt-8">
          <div className="grid grid-cols-12 gap-2 items-center mb-3">
            <h3 className="col-span-12 md:col-span-6 text-[14px] font-bold text-ink-900 dark:text-white underline decoration-1 underline-offset-4">
              Question Type
            </h3>
            <div className="hidden md:block col-span-1" />
            <p className="hidden md:block col-span-2 text-[12px] font-semibold text-ink-700 dark:text-ink-300 text-center">
              No. of Questions
            </p>
            <p className="hidden md:block col-span-3 text-[12px] font-semibold text-ink-700 dark:text-ink-300 text-center">
              Marks
            </p>
          </div>

          <div className="space-y-3">
            {form.questionTypes.map((qt, i) => (
              <QuestionTypeRow
                key={i}
                value={qt}
                onChange={(v) => setQuestionType(i, v)}
                onRemove={() => removeQuestionType(i)}
                canRemove={form.questionTypes.length > 1}
              />
            ))}
          </div>

          {errors.questionTypes && (
            <p className="text-[12px] text-red-500 mt-2">{errors.questionTypes}</p>
          )}

          <button
            type="button"
            onClick={addQuestionType}
            className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-ink-900 dark:text-white hover:text-accent transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-ink-900 dark:bg-accent text-white flex items-center justify-center">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span className="underline decoration-1 underline-offset-4">
              Add Question Type
            </span>
          </button>

          <div className="mt-4 flex flex-col items-end gap-1 text-[14px] text-ink-900 dark:text-white">
            <p>
              <span className="font-semibold">Total Questions :</span>{' '}
              <span className="font-bold">{totalQuestions}</span>
            </p>
            <p>
              <span className="font-semibold">Total Marks :</span>{' '}
              <span className="font-bold">{totalMarks}</span>
            </p>
          </div>
        </div>

        {/* Additional information */}
        <div className="mt-8">
          <label className="block text-[14px] font-bold text-ink-900 dark:text-white mb-2">
            Additional Information{' '}
            <span className="font-normal text-ink-500 dark:text-ink-400">(For better output)</span>
          </label>
          <div className="relative">
            <textarea
              value={form.additionalInstructions}
              onChange={(e) => setForm({ additionalInstructions: e.target.value })}
              rows={4}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              className="w-full bg-surface dark:bg-inset-dark rounded-2xl ring-1 ring-ink-200 dark:ring-inset-dark px-4 py-3 pr-12 text-[14px] text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900 dark:focus:ring-accent resize-none"
            />
            <button
              type="button"
              className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-ink-100 dark:bg-surface-dark-2 hover:bg-ink-200 flex items-center justify-center text-ink-700 dark:text-ink-300"
              aria-label="Voice input"
              title="Voice input (coming soon)"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {errors.submit && (
        <div className="px-4 py-3 rounded-2xl bg-red-50 ring-1 ring-red-200 text-[13px] text-red-700">
          {errors.submit}
        </div>
      )}

      {/* Footer buttons */}
      <div className="flex items-center justify-between md:justify-center md:gap-6 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-surface dark:bg-surface-dark ring-1 ring-ink-200 dark:ring-inset-dark text-[14px] font-semibold text-ink-900 dark:text-white hover:bg-ink-100 dark:hover:bg-inset-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-pill bg-ink-900 dark:bg-accent text-white text-[14px] font-semibold hover:bg-ink-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-dark-pill transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
            </>
          ) : (
            <>
              Next <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[
            'h-1 flex-1 rounded-full',
            i < step ? 'bg-ink-900 dark:bg-accent' : 'bg-ink-200 dark:bg-inset-dark',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-ink-900 dark:text-white mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
    </div>
  );
}

function pillInput(invalid: boolean) {
  return [
    'w-full h-10 px-4 rounded-full bg-surface dark:bg-inset-dark ring-1 text-[14px] text-ink-900 dark:text-white placeholder:text-ink-400',
    'focus:outline-none focus:ring-2 focus:ring-ink-900 dark:focus:ring-accent transition-all',
    invalid ? 'ring-red-300' : 'ring-ink-200 dark:ring-inset-dark',
  ].join(' ');
}
