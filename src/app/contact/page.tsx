'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white relative overflow-hidden flex flex-col selection:bg-yellow-500 selection:text-black">
      
      {/* 3D Floating Bubbles Background */}
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
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 tracking-wider uppercase">
            24/7 Assistance
          </span>
          <h1 className="text-4xl font-black text-white mt-3">Contact Support</h1>
          <p className="text-zinc-400 text-sm mt-2">Reach out to our 24/7 support team via email, WhatsApp, or phone lines below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Support Card */}
          <div className="bg-zinc-950/80 backdrop-blur-xl p-8 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-3">
            <h2 className="text-lg font-bold text-yellow-400">Email Support</h2>
            <p className="text-zinc-300 text-sm">For official inquiries and account queries:</p>
            <a href="mailto:support@genzlotto.com" className="text-white font-semibold text-sm hover:text-yellow-400 underline block">
              support@genzlotto.com
            </a>
          </div>

          {/* Telephone / WhatsApp Support Card */}
          <div className="bg-zinc-950/80 backdrop-blur-xl p-8 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-3">
            <h2 className="text-lg font-bold text-yellow-400">Direct Phone & WhatsApp</h2>
            <p className="text-zinc-300 text-sm">Call or message our support agents anytime:</p>
            <div className="space-y-1.5">
              <a href="tel:0597984108" className="text-white font-extrabold text-base hover:text-yellow-400 block tracking-wide">
                📞 059 798 4108
              </a>
              <a href="tel:0242760138" className="text-white font-extrabold text-base hover:text-yellow-400 block tracking-wide">
                📞 024 276 0138
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 py-8 text-center text-xs text-zinc-500 border-t border-zinc-900 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between px-8">
        <span>GEN Z LOTTO © 2026 — All Rights Reserved</span>
        <div className="flex gap-6 mt-4 sm:mt-0 text-zinc-400">
          <Link href="/terms" className="hover:text-yellow-400 transition">Terms & Conditions</Link>
          <Link href="/privacy" className="hover:text-yellow-400 transition">Privacy Policy</Link>
          <Link href="/responsible-gaming" className="hover:text-yellow-400 transition">Responsible Gaming</Link>
        </div>
      </footer>
    </div>
  );
}