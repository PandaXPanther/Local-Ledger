import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-extrabold text-text-muted mb-4">404</h1>
      <h2 className="text-2xl font-bold text-text-primary mb-3">Page not found</h2>
      <p className="text-text-secondary max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist. It may have moved or the URL might be incorrect.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">Back to Home</Link>
        <Link href="/colorado/" className="btn-secondary">Colorado Overview</Link>
      </div>
    </div>
  );
}
