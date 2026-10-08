'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setMessage('✅ Password reset successful! Redirecting...');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden text-white">
      <div className="w-full max-w-md bg-zinc-950/40 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-8 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="text-center mb-6">
          {/* Logo Container */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-amber-500/40 mb-3 overflow-hidden shadow-lg shadow-amber-500/10">
            <img 
              src="/logo.png" 
              alt="Gen Z Lotto Logo" 
              className="w-full h-full object-cover" 
            />
          </div>

          <h2 className="text-2xl font-black tracking-wider text-amber-400 uppercase">
            RESET <span className="text-white">PASSWORD</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enter the SMS code sent to your phone and your new password
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-xs text-rose-400">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-amber-500/30 text-center text-xs text-amber-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              disabled
              className="w-full rounded-xl bg-zinc-900/40 border border-zinc-800 p-3.5 text-zinc-400 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              SMS OTP Code
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 text-white tracking-widest text-center text-base focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 py-4 font-black text-black text-sm uppercase shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Set New Password'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-6">
          <Link href="/auth/login" className="text-amber-400 hover:text-amber-300 font-semibold">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}