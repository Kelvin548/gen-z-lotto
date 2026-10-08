'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Your designated admin numbers (both international and local formats)
const ADMIN_NUMBERS = [
  '+233544893582', '0544893582',
  '+233597984108', '0597984108',
  '+233242760138', '0242760138'
];

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      setMessage('✅ Login successful! Redirecting...');

      // Check if the user is an admin from API response or hardcoded list
      const cleanPhone = phone.trim();
      const isAdmin = data.isAdmin || data.role === 'ADMIN' || ADMIN_NUMBERS.includes(cleanPhone);

      // Route admins to admin dashboard, regular users to customer dashboard
      setTimeout(() => {
        if (isAdmin) {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 1000);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden text-white">
      {/* Background ambient gold lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Transparent Frosted Glass Card Container with Gold Border Glow */}
      <div className="w-full max-w-md bg-zinc-950/40 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 relative z-10 ring-1 ring-amber-500/20">
        
        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-amber-500/40 shadow-lg shadow-amber-500/10 mb-3 overflow-hidden">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="Gen Z Lotto Logo"
                onError={() => setLogoError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">⚡</span>
            )}
          </div>
          <h2 className="text-2xl font-black tracking-wider text-amber-400 uppercase">
            GEN Z <span className="text-white">LOTTO</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Log in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="0241234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="off"
              className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 py-4 font-black text-black text-sm tracking-wide uppercase shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Feedback Message */}
        {message && (
          <div className="mt-4 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center text-xs font-medium text-amber-300">
            {message}
          </div>
        )}

        {/* Footer Register Link */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}