import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return (
    <section className="relative overflow-hidden border-b border-rule bg-canvas">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(250,250,247,0.96)_0%,rgba(244,241,234,0.92)_55%,rgba(228,238,230,0.8)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-ember to-data" />
      <div className="relative mx-auto flex min-h-[68vh] max-w-4xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl rounded-lg border border-rule bg-surface/90 p-8 text-center shadow-[0_30px_80px_rgba(31,36,33,0.12)] backdrop-blur sm:p-10">
          <p className="section-label text-accent">Route unavailable</p>
          <h1 className="mt-3 font-display text-6xl font-extrabold text-text-muted sm:text-7xl">404</h1>
          <h2 className="mt-4 text-2xl font-bold text-ink sm:text-3xl">Page not found</h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-text-secondary">
            The page you&apos;re looking for is not in the current static build. Browse a published dashboard or return to the national overview.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn-primary">Back to Home</Link>
            <Link href="/states/" className="btn-secondary">Browse States</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
