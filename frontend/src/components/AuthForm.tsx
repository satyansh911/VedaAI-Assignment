'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';

interface Props {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: Props) {
  const { login, signup, loginWithGoogle } = useAuth();
  const isSignup = mode === 'signup';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isSignup) {
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  async function handleGoogle(resp: CredentialResponse) {
    if (!resp.credential) {
      setError('Google sign-in did not return a credential.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle(resp.credential);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-page dark:bg-page-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface dark:bg-surface-dark rounded-3xl shadow-panel p-8 md:p-10">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="text-center text-[22px] font-extrabold text-ink-900 dark:text-white">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-center text-[13px] text-ink-500 dark:text-ink-400">
          {isSignup
            ? 'Set up your teacher workspace in seconds.'
            : 'Sign in to manage your assignments.'}
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          {isSignup && (
            <Field
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
              autoComplete="name"
              required
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
            minLength={6}
          />

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-pill bg-ink-900 dark:bg-accent text-white font-semibold hover:bg-ink-800 disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[12px] text-ink-400">
          <div className="flex-1 h-px bg-ink-200 dark:bg-inset-dark" />
          OR
          <div className="flex-1 h-px bg-ink-200 dark:bg-inset-dark" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => setError('Google sign-in failed')}
            useOneTap={false}
            text={isSignup ? 'signup_with' : 'signin_with'}
            shape="pill"
          />
        </div>

        <p className="mt-6 text-center text-[13px] text-ink-500 dark:text-ink-400">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link
            href={isSignup ? '/login' : '/signup'}
            className="font-semibold text-accent hover:underline"
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
  autoComplete,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-semibold text-ink-700 dark:text-ink-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className="h-11 rounded-pill bg-page dark:bg-inset-dark border border-transparent focus:border-accent focus:outline-none px-4 text-[14px] text-ink-900 dark:text-white"
      />
    </label>
  );
}
