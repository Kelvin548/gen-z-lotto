'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';

  const [phoneNumber, setPhoneNumber] = useState(phoneParam);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (phoneParam) {
      setPhoneNumber(phoneParam);
    }
  }, [phoneParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.trim().length !== 6) {
      setMessage('❌ Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber,
          phoneNumber: phoneNumber, 
          otpCode: otpCode.trim() 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'OTP verification failed');
      }

      setMessage('✅ Phone verified successfully! Redirecting to login...');

      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-slate-800 p-8 shadow-xl border border-slate-700">
        <h2 className="text-2xl font-bold text-center text-emerald-400">GEN Z LOTTO</h2>
        <p className="text-sm text-center text-slate-400">
          Enter the 6-digit OTP code generated for{' '}
          <span className="font-semibold text-emerald-400">{phoneNumber || 'your phone'}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium mb-1">OTP Code</label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full rounded bg-slate-700 p-3 text-center text-xl tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-emerald-500 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm font-medium mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center text-white p-8">Loading...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}