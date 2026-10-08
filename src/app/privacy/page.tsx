'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white relative overflow-hidden flex flex-col selection:bg-yellow-500 selection:text-black">
      
      {/* 3D Floating Bubbles Background Wrapper */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <FloatingBubbles />
      </div>

      {/* Top Header with Real Logo */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full border-b border-zinc-900">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <Image 
            src="/logo.png" 
            alt="Gen Z Lotto Logo" 
            width={44} 
            height={44} 
            className="w-11 h-11 object-contain rounded-full border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.3)]" 
          />
          <span className="text-lg font-black tracking-wider text-white">GEN Z LOTTO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-300">
          <Link href="/how-it-works" className="hover:text-yellow-400 transition">How It Works</Link>
          <Link href="/results" className="hover:text-yellow-400 transition">Results</Link>
          <Link href="/pricing" className="hover:text-yellow-400 transition">Pricing & Odds</Link>
          <Link href="/responsible-gaming" className="hover:text-yellow-400 transition">Responsible Gaming</Link>
        </nav>

        <Link
          href="/customer/play"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-yellow-500/20 hover:opacity-90 transition"
        >
          Play Now
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-6 py-12 space-y-8 w-full">
        <div>
          <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
          <p className="text-zinc-400 text-sm mt-2">Your personal data and wallet transactions are protected with industry-standard security protocols.</p>
        </div>

        <div className="space-y-6 text-zinc-300 text-sm leading-relaxed bg-zinc-950/80 backdrop-blur-xl p-8 rounded-3xl border border-yellow-500/20 shadow-2xl">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-yellow-400">1. Information We Collect</h2>
            <p>We collect account registration details and secure transactional records necessary for processing your digital 5/90 lottery ticket bookings.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-yellow-400">2. Data Security & Encryption</h2>
            <p>All sensitive information, including wallet ledgers and credentials, is safeguarded using robust encryption standards.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-yellow-400">3. Use of Information</h2>
            <p>Your data is used strictly to verify draw entries, credit automated payouts, and comply with legal regulatory mandates.</p>
          </section>
        </div>
      </main>

      <footer className="relative z-20 py-8 text-center text-xs text-zinc-500 border-t border-zinc-900 max-w-7xl mx-auto w-full">
        GEN Z LOTTO © 2026 — All Rights Reserved
      </footer>
    </div>
  );
}