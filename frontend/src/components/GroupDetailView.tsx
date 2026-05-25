'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Users, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { GroupDetail } from '@/types/group';
import { AssignmentCard } from './AssignmentCard';

export function GroupDetailView({ groupId }: { groupId: string }) {
  const [data, setData] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.getGroup(groupId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-10 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-ink-500" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-6">
        <p className="text-red-600">{error ?? 'Group not found'}</p>
        <Link href="/groups" className="mt-3 inline-block text-accent font-semibold">
          ← Back to groups
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/groups"
        className="inline-flex items-center gap-2 text-[13px] text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to groups
      </Link>

      <div
        className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-6 md:p-8"
        style={{ borderTop: `5px solid ${data.color}` }}
      >
        <h1 className="text-[24px] font-extrabold text-ink-900 dark:text-white">{data.name}</h1>
        {data.description && (
          <p className="mt-1 text-[14px] text-ink-500 dark:text-ink-400">{data.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-ink-500 dark:text-ink-400">
          {data.gradeLevel && (
            <span className="px-2.5 py-0.5 rounded-full bg-ink-100 dark:bg-inset-dark">
              {data.gradeLevel}
            </span>
          )}
          {data.subject && (
            <span className="px-2.5 py-0.5 rounded-full bg-ink-100 dark:bg-inset-dark">
              {data.subject}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full bg-ink-100 dark:bg-inset-dark flex items-center gap-1">
            <Users className="w-3 h-3" /> {data.studentCount} students
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-extrabold text-ink-900 dark:text-white">
          Assignments ({data.assignments.length})
        </h2>
        <Link
          href={`/create?groupId=${data._id}`}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-pill bg-ink-900 dark:bg-accent text-white text-[13px] font-semibold hover:bg-ink-800"
        >
          <Plus className="w-4 h-4" />
          New assignment for this group
        </Link>
      </div>

      {data.assignments.length === 0 ? (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-10 text-center">
          <p className="text-[14px] text-ink-500 dark:text-ink-400">
            No assignments yet for this group. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.assignments.map((a) => (
            <AssignmentCard key={a._id} assignment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
