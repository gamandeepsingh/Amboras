'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useDashboardStore } from '@/store/dashboard';

export default function LoginPage() {
  const [email, setEmail] = useState('store1@demo.com');
  const [password, setPassword] = useState('demo1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth, token } = useDashboardStore();
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace('/dashboard');
  }, [token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.login(email, password);
      setAuth(res.access_token, res.user);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(100,71%,64%)] opacity-[0.04] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(100,71%,64%)] text-black text-xl font-bold">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-white/40">Sign in to your store dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-1">
            <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                placeholder="you@store.com"
              />
            </div>
            <div className="px-4 py-3">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-[hsl(0,72%,60%)] text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-[hsl(100,71%,64%)] py-3 text-sm font-semibold text-black transition-opacity disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </motion.button>
        </form>

        {/* Demo hint */}
        <div className="mt-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Demo accounts</p>
          <div className="space-y-1">
            {[
              { email: 'store1@demo.com', store: 'Acme Goods' },
              { email: 'store2@demo.com', store: 'Beta Shop' },
            ].map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => { setEmail(a.email); setPassword('demo1234'); }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
              >
                <span>{a.store}</span>
                <span className="font-mono text-white/25">{a.email}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
