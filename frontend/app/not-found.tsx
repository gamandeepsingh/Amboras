import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(100,71%,64%,0.16)] text-[hsl(100,71%,64%)]">
          <SearchX className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-white/55">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[hsl(100,71%,64%)] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
