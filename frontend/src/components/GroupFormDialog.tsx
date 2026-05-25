'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Group } from '@/types/group';

interface Props {
  open: boolean;
  group?: Group;
  onClose: () => void;
  onSaved: () => void;
}

const COLORS = ['#FB7C30', '#4F46E5', '#10B981', '#EC4899', '#0EA5E9', '#F59E0B'];

export function GroupFormDialog({ open, group, onClose, onSaved }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [studentCount, setStudentCount] = useState<number>(0);
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(group?.name ?? '');
    setDescription(group?.description ?? '');
    setGradeLevel(group?.gradeLevel ?? '');
    setSubject(group?.subject ?? '');
    setStudentCount(group?.studentCount ?? 0);
    setColor(group?.color ?? COLORS[0]);
    setError(null);
  }, [open, group]);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { name, description, gradeLevel, subject, studentCount, color };
      if (group) {
        await api.updateGroup(group._id, payload);
      } else {
        await api.createGroup(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save group');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface dark:bg-surface-dark rounded-3xl shadow-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-extrabold text-ink-900 dark:text-white">
            {group ? 'Edit group' : 'New group'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-ink-100 dark:bg-inset-dark flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-ink-900 dark:text-white" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Field label="Name" value={name} onChange={setName} required />
          <Field
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="What is this class about?"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Grade level" value={gradeLevel} onChange={setGradeLevel} placeholder="e.g. 10th" />
            <Field label="Subject" value={subject} onChange={setSubject} placeholder="e.g. Science" />
          </div>
          <Field
            label="Number of students"
            type="number"
            value={String(studentCount)}
            onChange={(v) => setStudentCount(Math.max(0, Number(v) || 0))}
          />

          <div>
            <span className="text-[12px] font-semibold text-ink-700 dark:text-ink-300">
              Color
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={[
                    'w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-surface dark:ring-offset-surface-dark transition-all',
                    color === c ? 'ring-ink-900 dark:ring-white' : 'ring-transparent',
                  ].join(' ')}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 rounded-pill text-[13px] font-semibold text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-inset-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-pill bg-ink-900 dark:bg-accent text-white text-[13px] font-semibold hover:bg-ink-800 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {group ? 'Save changes' : 'Create group'}
            </button>
          </div>
        </form>
      </div>
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
