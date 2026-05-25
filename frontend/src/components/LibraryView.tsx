'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { AssignmentSummary } from '@/types/assignment';
import { AssignmentCard } from './AssignmentCard';

export function LibraryView() {
  const [items, setItems] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.listAssignments({ savedToLibrary: true }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((a) =>
    [a.title, a.subject ?? ''].some((v) => v.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-ink-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> My Library
          </h1>
          <p className="text-[13px] text-ink-500 dark:text-ink-400">
            Your bookmarked question papers, all in one place.
          </p>
        </div>
      </div>

      <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-ink-500 dark:text-ink-400 ml-2" />
        <input
          type="text"
          placeholder="Search saved papers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[14px] text-ink-900 dark:text-white placeholder:text-ink-400"
        />
      </div>

      {loading ? (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-10 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-ink-500" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyLibrary hasSearch={!!query} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((a) => (
            <AssignmentCard key={a._id} assignment={a} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyLibrary({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 text-accent flex items-center justify-center">
        <Bookmark className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-[16px] font-bold text-ink-900 dark:text-white">
        {hasSearch ? 'No matches' : 'Your library is empty'}
      </h3>
      <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-400">
        {hasSearch
          ? 'Try a different search term.'
          : 'Save a generated paper from its detail page to find it here later.'}
      </p>
      {!hasSearch && (
        <Link
          href="/assignments"
          className="mt-4 inline-flex items-center gap-2 px-5 h-10 rounded-pill bg-ink-900 dark:bg-accent text-white text-[13px] font-semibold hover:bg-ink-800"
        >
          Go to assignments
        </Link>
      )}
    </div>
  );
}
