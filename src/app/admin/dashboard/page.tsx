// src/app/admin/dashboard/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function AdminDashboardPage() {
  const pathname = usePathname();

  // Unified navigation list containing both unique admin controls and key player views
  const navLinks = [
    { name: 'Admin Dashboard', href: '/admin/dashboard' },
    { name: 'Manage Draws', href: '/admin/draws' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Wallet Ledger', href: '/admin/wallet' },
    { name: 'Play', href: '/customer/play' },
    { name: 'Results', href: '/results' },
    { name: 'My Tickets', href: '/customer/tickets' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col relative overflow-hidden selection:bg-yellow-500 selection:text-black">
      
      {/* 3D Floating Bubbles Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <FloatingBubbles />
      </div>

      {/* Single Unified Navigation Bar */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-yellow-500/15 bg-[#0b0b0c]/90 backdrop-blur-md sticky top-0 z-50 w-full">
        {/* Logo & Admin Tag */}
        <Link href="/admin/dashboard" className="flex items-center gap-3 shrink-0 group">
          <Image 
            src="/logo.png" 
            alt="Gen Z Lotto Logo" 
            width={38} 
            height={38} 
            className="w-[38px] h-[38px] object-contain rounded-full border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.3)]" 
          />
          <span className="text-sm font-black tracking-wider text-white flex items-center gap-2">
            GEN Z LOTTO 
            <span className="text-yellow-400 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">ADMIN</span>
          </span>
        </Link>

        {/* Combined Navigation Links (Visible on standard desktop without requiring giant screens) */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                  isActive
                    ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 shadow-sm font-bold'
                    : 'text-zinc-300 hover:text-yellow-400 hover:bg-zinc-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Wallet & Exit Admin */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/customer/wallet" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/80 border border-yellow-500/20 hover:border-yellow-500/50 transition shadow-lg">
            <span className="text-[11px] text-zinc-400">Wallet:</span>
            <span className="text-xs font-bold text-yellow-400">GH¢ 5,420.00</span>
          </Link>
          
          <Link
            href="/customer/dashboard"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-yellow-500/20 hover:opacity-90 transition"
          >
            Exit Admin
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white">Admin Control Center</h1>
          <p className="text-zinc-400 text-sm mt-1">Monitor platform metrics, manage draw results, and oversee user ticket transactions.</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-2">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Active Players</span>
            <h2 className="text-3xl font-black text-white">1,248</h2>
          </div>
          <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-2">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Stakes</span>
            <h2 className="text-3xl font-black text-yellow-400">GH¢ 45,820.00</h2>
          </div>
          <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-2">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Pending Payouts</span>
            <h2 className="text-3xl font-black text-white">GH¢ 3,450.00</h2>
          </div>
        </div>

        {/* Management Panel View */}
        <div className="bg-zinc-950/80 backdrop-blur-xl p-8 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-4">
          <h3 className="text-lg font-bold text-yellow-400">System Operations & Controls</h3>
          <p className="text-zinc-300 text-sm">Use the unified navigation bar above to switch between admin management features and customer links instantly.</p>
        </div>
      </main>

      <footer className="relative z-20 py-8 text-center text-xs text-zinc-500 border-t border-zinc-900 max-w-7xl mx-auto w-full">
        GEN Z LOTTO ADMIN © 2026 — All Rights Reserved
      </footer>
    </div>
  );
}