import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-ink-900">Assignment not found</h1>
      <p className="mt-2 text-sm text-ink-500">
        The link may have expired or the assignment may have been deleted.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"
      >
        Create a new one
      </Link>
    </main>
  );
}
