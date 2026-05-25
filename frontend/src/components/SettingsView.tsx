'use client';

import { useEffect, useState } from 'react';
import { Loader2, Moon, Sun, Save, User as UserIcon, School } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';

export function SettingsView() {
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [schoolLocation, setSchoolLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setSchool(user.school ?? '');
    setSchoolLocation(user.schoolLocation ?? '');
    setAvatarUrl(user.avatarUrl ?? '');
  }, [user]);

  if (!user) return null;

  async function onSave() {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await api.updateProfile({
        name,
        school,
        schoolLocation,
        avatarUrl: avatarUrl || undefined,
      });
      setUser(updated);
      setMessage('Profile updated');
      setTimeout(() => setMessage(null), 2500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile */}
      <section className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <UserIcon className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-[18px] font-extrabold text-ink-900 dark:text-white">Profile</h2>
            <p className="text-[12px] text-ink-500 dark:text-ink-400">
              How your name and school appear across the app.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email" value={user.email} onChange={() => undefined} readOnly />
          <Field label="School" value={school} onChange={setSchool} icon={<School className="w-4 h-4" />} />
          <Field label="School location" value={schoolLocation} onChange={setSchoolLocation} />
          <Field
            label="Avatar URL (optional)"
            value={avatarUrl}
            onChange={setAvatarUrl}
            placeholder="https://…"
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-pill bg-ink-900 dark:bg-accent text-white text-[13px] font-semibold hover:bg-ink-800 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </button>
          {message && (
            <span className="text-[13px] text-ink-500 dark:text-ink-400">{message}</span>
          )}
        </div>
      </section>

      {/* Appearance */}
      <section className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </span>
          <div>
            <h2 className="text-[18px] font-extrabold text-ink-900 dark:text-white">
              Appearance
            </h2>
            <p className="text-[12px] text-ink-500 dark:text-ink-400">
              Switch between light and dark themes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ThemeCard
            label="Light"
            active={theme === 'light'}
            onSelect={() => setTheme('light')}
            preview="bg-page text-ink-900"
            icon={<Sun className="w-4 h-4" />}
          />
          <ThemeCard
            label="Dark"
            active={theme === 'dark'}
            onSelect={() => setTheme('dark')}
            preview="bg-page-dark text-white"
            icon={<Moon className="w-4 h-4" />}
          />
        </div>
      </section>

      {/* Account */}
      <section className="bg-surface dark:bg-surface-dark rounded-3xl shadow-card p-6 md:p-8">
        <h2 className="text-[18px] font-extrabold text-ink-900 dark:text-white">Account</h2>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-[13px]">
          <Info label="Sign-in method" value={user.provider === 'google' ? 'Google' : 'Email + password'} />
          <Info label="Member since" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  placeholder,
  icon,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-[12px] font-semibold text-ink-700 dark:text-ink-300">{label}</span>
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 dark:text-ink-400">
            {icon}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full h-11 rounded-pill bg-page dark:bg-inset-dark border border-transparent focus:border-accent focus:outline-none px-4 text-[14px] text-ink-900 dark:text-white ${
            icon ? 'pl-10' : ''
          } ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
        />
      </div>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-2xl bg-page dark:bg-inset-dark">
      <p className="text-[11px] uppercase tracking-wide text-ink-500 dark:text-ink-400">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-ink-900 dark:text-white">{value}</p>
    </div>
  );
}

function ThemeCard({
  label,
  active,
  onSelect,
  preview,
  icon,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
  preview: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'rounded-2xl p-4 text-left transition-all ring-1',
        active
          ? 'ring-accent shadow-accent-glow'
          : 'ring-ink-200 dark:ring-inset-dark hover:ring-accent/60',
      ].join(' ')}
    >
      <div className={`h-16 rounded-xl ring-1 ring-ink-200/40 dark:ring-white/10 mb-3 ${preview} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-900 dark:text-white">{label}</span>
        {active && (
          <span className="text-[11px] font-bold text-accent">SELECTED</span>
        )}
      </div>
    </button>
  );
}
