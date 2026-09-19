// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function PublicLandingPage() {
  const [activeDraw, setActiveDraw] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 22, seconds: 15 });

  useEffect(() => {
    fetch('/api/draws')
      .then(res => res.json())
      .then(data => {
        const draws = Array.isArray(data) ? data : data?.draws || [];
        const openDraw = draws.find((d: any) => d.status === 'OPEN' || d.status === 'SCHEDULED') || draws[0];
        if (openDraw) setActiveDraw(openDraw);
      })
      .catch(() => {});

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-zinc-100 flex flex-col">
      {/* Public Nav with BrandLogo */}
      <header className="border-b border-yellow-500/15 bg-obsidian/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <BrandLogo />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <Link href="/how-it-works" className="hover:text-yellow-400 transition">How It Works</Link>
          <Link href="/results" className="hover:text-yellow-400 transition">Results</Link>
          <Link href="/pricing" className="hover:text-yellow-400 transition">Pricing & Odds</Link>
          <Link href="/responsible-gaming" className="hover:text-yellow-400 transition">Responsible Gaming</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/customer/play" className="text-sm font-semibold px-5 py-2.5 rounded-xl gold-gradient-bg text-obsidian hover:opacity-90 transition shadow-lg shadow-yellow-500/20">
            Play Now
          </Link>
          <Link href="/admin/dashboard" className="text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-900 border border-yellow-500/20 text-yellow-400 hover:bg-zinc-800 transition">
            Admin
          </Link>
        </div>
      </header>

      {/* Hero Section with Floating Bubbles */}
      <section className="relative overflow-hidden py-24 px-6 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Glass Transparent Floating Bubbles Background */}
        <FloatingBubbles />

        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-yellow-500 blur-[150px]"></div>
        </div>

        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-bold text-yellow-400 mb-6 tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
          Ghana's Premier 5/90 Digital Lottery
        </div>

        <h1 className="relative z-10 text-5xl md:text-7xl font-black tracking-tight max-w-4xl leading-tight">
          Where <span className="gold-gradient-text">Gen Z Digital Speed</span> Meets Massive Jackpots.
        </h1>

        <p className="relative z-10 mt-6 text-lg text-zinc-400 max-w-2xl font-normal leading-relaxed">
          Experience instant digital ticket booking, secure automated wallet settlements, and life-changing daily 5/90 draws right from your device.
        </p>

        {/* Countdown Banner */}
        <div className="relative z-10 mt-10 p-6 rounded-2xl bg-surface-card border border-yellow-500/20 card-gold-glow max-w-md w-full flex flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500/80 mb-2">
            {activeDraw ? activeDraw.name : "Next National 5/90 Draw"}
          </p>
          <div className="flex items-center gap-4 text-3xl font-black text-white">
            <div className="flex flex-col items-center">
              <span className="gold-gradient-text">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Hours</span>
            </div>
            <span className="text-yellow-500/50">:</span>
            <div className="flex flex-col items-center">
              <span className="gold-gradient-text">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Mins</span>
            </div>
            <span className="text-yellow-500/50">:</span>
            <div className="flex flex-col items-center">
              <span className="gold-gradient-text">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Secs</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/customer/play" className="px-8 py-4 rounded-xl gold-gradient-bg text-obsidian font-bold text-base hover:opacity-90 transition shadow-xl shadow-yellow-500/25">
            Play Live Draw Now →
          </Link>
          <Link href="/results" className="px-8 py-4 rounded-xl bg-zinc-900 border border-yellow-500/30 text-yellow-400 font-bold text-base hover:bg-zinc-800 transition">
            View Latest Results
          </Link>
        </div>
      </section>

      {/* Featured Games & Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-surface-card border border-yellow-500/15 card-gold-glow transition hover:border-yellow-500/40">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6 font-bold text-lg">
            ⚡
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Instant Ticket Generation</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Every booking receives an immutable booking code and instant cryptographic verification backed by robust Prisma MySQL auditing.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-surface-card border border-yellow-500/15 card-gold-glow transition hover:border-yellow-500/40">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6 font-bold text-lg">
            🛡️
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Bank-Grade Wallet Ledger</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Full transactional isolation ensures your stakes, deposits, and automated payouts are credited instantly with zero latency.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-surface-card border border-yellow-500/15 card-gold-glow transition hover:border-yellow-500/40">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6 font-bold text-lg">
            🎯
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Classic 5/90 Rules</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Play Direct 1 through Direct 5, Permutations, and Banker selections seamlessly with transparent multiplier payouts.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-yellow-500/15 bg-surface-dark py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gold-gradient-bg flex items-center justify-center font-black text-obsidian">GZ</div>
            <span className="font-bold text-white tracking-wider">GEN Z LOTTO © 2026</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/terms" className="hover:text-yellow-400 transition">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-yellow-400 transition">Privacy Policy</Link>
            <Link href="/responsible-gaming" className="hover:text-yellow-400 transition">Responsible Gaming</Link>
            <Link href="/contact" className="hover:text-yellow-400 transition">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}