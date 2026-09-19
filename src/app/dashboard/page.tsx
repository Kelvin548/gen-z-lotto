'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function CustomerDashboardPage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 21, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white relative overflow-x-hidden flex flex-col selection:bg-yellow-500 selection:text-black">
      
      {/* 3D Floating Water Bubbles Background Effect */}
      <FloatingBubbles />

      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-yellow-500/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Top Navbar */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-amber-500/30 border border-yellow-300/50">
            590
          </div>
          <span className="text-lg font-black tracking-wider text-white">GEN Z LOTTO</span>
        </Link>

        {/* Clean Root-Level Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-300">
          <Link href="/how-it-works" className="hover:text-yellow-400 transition">How It Works</Link>
          <Link href="/results" className="hover:text-yellow-400 transition">Results</Link>
          <Link href="/pricing" className="hover:text-yellow-400 transition">Pricing & Odds</Link>
          <Link href="/responsible-gaming" className="hover:text-yellow-400 transition">Responsible Gaming</Link>
        </nav>

        {/* Action Buttons (Play Now + Admin Button Restored) */}
        <div className="flex items-center gap-3">
          <Link
            href="/customer/play"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-yellow-500/20 hover:opacity-90 transition"
          >
            Play Now
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-yellow-500/20 text-yellow-400 font-bold text-xs hover:border-yellow-500/50 transition"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-12 max-w-5xl mx-auto w-full space-y-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-widest uppercase backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
          Ghana’s Premier 5/90 Digital Lottery
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-none">
          Where Gen Z Digital Speed Meets Massive Jackpots.
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-zinc-400 max-w-xl font-normal leading-relaxed">
          Experience instant digital ticket booking, secure automated wallet settlements, and life-changing daily 5/90 draws right from your device.
        </p>

        {/* Countdown Timer Box */}
        <div className="flex items-center gap-6 py-6 px-8 rounded-3xl bg-zinc-950/80 border border-yellow-500/25 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-black text-yellow-400 font-mono">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-1">Hours</span>
          </div>
          <span className="text-2xl font-bold text-yellow-500/50 pb-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-black text-yellow-400 font-mono">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-1">Mins</span>
          </div>
          <span className="text-2xl font-bold text-yellow-500/50 pb-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-black text-yellow-400 font-mono">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-1">Secs</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-2">
          <Link
            href="/customer/play"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-yellow-500/20 hover:opacity-90 transition text-center"
          >
            Play Live Draw Now →
          </Link>
          <Link
            href="/results"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900/90 border border-yellow-500/30 text-yellow-400 font-extrabold text-sm uppercase tracking-wider hover:bg-zinc-900 transition text-center backdrop-blur-md"
          >
            View Latest Results
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16">
          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-yellow-500/15 backdrop-blur-md text-left space-y-2 hover:border-yellow-500/40 transition">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 font-bold">⚡</div>
            <h3 className="text-sm font-bold text-white">Instant Ticket Generation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Every booking receives an immutable booking code and instant cryptographic verification backed by robust database auditing.</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-yellow-500/15 backdrop-blur-md text-left space-y-2 hover:border-yellow-500/40 transition">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 font-bold">🛡️</div>
            <h3 className="text-sm font-bold text-white">Bank-Grade Wallet Ledger</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Full transactional isolation ensures your stakes, deposits, and automated payouts are credited instantly with zero latency.</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-yellow-500/15 backdrop-blur-md text-left space-y-2 hover:border-yellow-500/40 transition">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 font-bold">🎯</div>
            <h3 className="text-sm font-bold text-white">Classic 5/90 Rules</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Play Direct 1 through Direct 5, Permutations, and Banker selections seamlessly with transparent multiplier payouts.</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-20 py-8 px-8 border-t border-zinc-900 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <div>GEN Z LOTTO © 2026</div>
        <div className="flex items-center gap-6">
          <Link href="/how-it-works" className="hover:text-zinc-300 transition">Terms & Conditions</Link>
          <Link href="/results" className="hover:text-zinc-300 transition">Results</Link>
          <Link href="/responsible-gaming" className="hover:text-zinc-300 transition">Responsible Gaming</Link>
          <Link href="/pricing" className="hover:text-zinc-300 transition">Pricing & Odds</Link>
        </div>
      </footer>

    </div>
  );
}