'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Filter, Search, Plus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { AssignmentSummary } from '@/types/assignment';
import { Group } from '@/types/group';
import { AssignmentCard } from './AssignmentCard';
import { EmptyAssignments } from './EmptyAssignments';

type FilterValue = 'all' | 'completed' | 'pending' | 'failed';

export function AssignmentsList() {
  const [items, setItems] = useState<AssignmentSummary[] | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<FilterValue>('all');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.listAssignments(), api.listGroups().catch(() => [])])
      .then(([a, g]) => {
        if (!mounted) return;
        setItems(a);
        setGroups(g as Group[]);
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    return items.filter((a) => {
      const matchesQuery = a.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || a.status === status;
      const matchesGroup = !groupFilter || a.groupId === groupFilter;
      return matchesQuery && matchesStatus && matchesGroup;
    });
  }, [items, query, status, groupFilter]);

  if (items === null && !error) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-ink-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface dark:bg-surface-dark rounded-3xl p-10 text-center text-red-600 text-[14px]">
        {error}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card">
        <EmptyAssignments />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="px-1">
        <div className="flex items-start gap-3">
          <span className="mt-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
          <div>
            <h1 className="text-[22px] font-extrabold text-ink-900 dark:text-white leading-tight">
              Assignments
            </h1>
            <p className="text-[13px] text-ink-500 dark:text-ink-400 mt-0.5">
              Manage and create assignments for your classes.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card px-3 py-3 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowFilter((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill text-[13px] font-medium text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-inset-dark transition-colors w-fit"
          >
            <Filter className="w-4 h-4" />
            Filter By
          </button>
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Assignment"
              className="w-full h-10 pl-10 pr-4 rounded-pill bg-ink-100 dark:bg-inset-dark text-[14px] text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900 dark:focus:ring-accent"
            />
          </div>
        </div>
        {showFilter && (
          <div className="flex flex-wrap gap-3 px-1 pt-1 pb-2">
            <Select
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as FilterValue)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
              ]}
            />
            <Select
              label="Group"
              value={groupFilter}
              onChange={setGroupFilter}
              options={[
                { value: '', label: 'All groups' },
                ...groups.map((g) => ({ value: g._id, label: g.name })),
              ]}
            />
          </div>
        )}
      </div>

      {filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((a) => (
            <AssignmentCard key={a._id} assignment={a} />
          ))}
        </div>
      ) : (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-10 text-center text-ink-500 dark:text-ink-400 text-[14px]">
          No assignments match these filters.
        </div>
      )}

      <div className="fixed bottom-20 lg:bottom-8 right-6 lg:right-8 z-20">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-pill bg-ink-900 dark:bg-accent text-white text-[14px] font-semibold hover:bg-ink-800 shadow-dark-pill transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Create Assignment
        </Link>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 text-[12px] text-ink-500 dark:text-ink-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 px-3 rounded-pill bg-page dark:bg-inset-dark border border-transparent focus:border-accent focus:outline-none text-[13px] font-semibold text-ink-900 dark:text-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
