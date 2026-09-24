// src/components/PublicShell.tsx
import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian text-zinc-100 flex flex-col">
      {/* Public Nav Header */}
      <header className="border-b border-yellow-500/15 bg-obsidian/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
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
        </div>
      </header>

      {/* Main Page View Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {children}
      </main>

      {/* Public Footer */}
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