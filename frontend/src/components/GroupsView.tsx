'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users, Loader2, Trash2, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import { Group } from '@/types/group';
import { GroupFormDialog } from './GroupFormDialog';

export function GroupsView() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; group?: Group }>({ open: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setGroups(await api.listGroups());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(g: Group) {
    if (!confirm(`Delete group "${g.name}"? Assignments will be kept but unlinked.`)) return;
    try {
      await api.deleteGroup(g._id);
      setGroups((prev) => prev.filter((x) => x._id !== g._id));
    } catch (err) {
      alert('Failed to delete group');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-ink-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> My Groups
          </h1>
          <p className="text-[13px] text-ink-500 dark:text-ink-400">
            Organize your classes and link assignments to them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialog({ open: true })}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-pill bg-ink-900 dark:bg-accent text-white text-[13px] font-semibold hover:bg-ink-800"
        >
          <Plus className="w-4 h-4" />
          New Group
        </button>
      </div>

      {loading ? (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-10 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-ink-500" />
        </div>
      ) : groups.length === 0 ? (
        <EmptyGroups onCreate={() => setDialog({ open: true })} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g) => (
            <GroupCard
              key={g._id}
              group={g}
              onEdit={() => setDialog({ open: true, group: g })}
              onDelete={() => onDelete(g)}
            />
          ))}
        </div>
      )}

      <GroupFormDialog
        open={dialog.open}
        group={dialog.group}
        onClose={() => setDialog({ open: false })}
        onSaved={() => {
          setDialog({ open: false });
          load();
        }}
      />
    </div>
  );
}

function GroupCard({
  group,
  onEdit,
  onDelete,
}: {
  group: Group;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-5 md:p-6 relative overflow-hidden"
      style={{ borderLeft: `5px solid ${group.color}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={`/groups/${group._id}`} className="min-w-0 flex-1">
          <h3 className="text-[17px] font-extrabold text-ink-900 dark:text-white underline decoration-1 underline-offset-4 truncate hover:text-accent transition-colors">
            {group.name}
          </h3>
          {group.description && (
            <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-400 line-clamp-2">
              {group.description}
            </p>
          )}
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="w-8 h-8 rounded-full hover:bg-ink-100 dark:hover:bg-inset-dark flex items-center justify-center text-ink-500"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-red-500"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-ink-500 dark:text-ink-400">
        {group.gradeLevel && (
          <span className="px-2.5 py-0.5 rounded-full bg-ink-100 dark:bg-inset-dark">{group.gradeLevel}</span>
        )}
        {group.subject && (
          <span className="px-2.5 py-0.5 rounded-full bg-ink-100 dark:bg-inset-dark">{group.subject}</span>
        )}
        <span className="px-2.5 py-0.5 rounded-full bg-ink-100 dark:bg-inset-dark flex items-center gap-1">
          <Users className="w-3 h-3" /> {group.studentCount} students
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
          {group.assignmentCount ?? 0} assignment{(group.assignmentCount ?? 0) === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}

function EmptyGroups({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 text-accent flex items-center justify-center">
        <Users className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-[16px] font-bold text-ink-900 dark:text-white">No groups yet</h3>
      <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-400">
        Create your first class or cohort to start organizing assignments.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-2 px-5 h-10 rounded-pill bg-ink-900 dark:bg-accent text-white text-[13px] font-semibold hover:bg-ink-800"
      >
        <Plus className="w-4 h-4" />
        Create your first group
      </button>
    </div>
  );
}
