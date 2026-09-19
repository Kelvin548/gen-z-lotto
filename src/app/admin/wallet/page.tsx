// src/app/admin/wallet/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function AdminWalletPage() {
  const pathname = usePathname();

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

      {/* Unified Navigation Bar */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-yellow-500/15 bg-[#0b0b0c]/90 backdrop-blur-md sticky top-0 z-50 w-full">
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
            <span className="text-yellow-400 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/25">ADMIN</span>
          </span>
        </Link>

        {/* Navigation Links */}
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

        {/* Right Actions */}
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

      {/* Main Wallet Ledger Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white">Wallet Ledger & Transactions</h1>
          <p className="text-zinc-400 text-sm mt-1">Audit platform deposits, ticket stakes, and withdrawal payouts across all user accounts.</p>
        </div>

        {/* Ledger Table Card */}
        <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-yellow-400">Recent Transactions</h3>
            <span className="text-xs text-zinc-400">Total Volume: <strong className="text-white">GH¢ 45,820.00</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 text-zinc-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Tx ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                <tr>
                  <td className="py-4 px-4 font-bold text-white">#TXN-9021</td>
                  <td className="py-4 px-4">Kelvin</td>
                  <td className="py-4 px-4 text-green-400">Deposit</td>
                  <td className="py-4 px-4 font-bold text-yellow-400">+ GH¢ 500.00</td>
                  <td className="py-4 px-4"><span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Success</span></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-white">#TXN-9022</td>
                  <td className="py-4 px-4">Akwasi</td>
                  <td className="py-4 px-4 text-red-400">Stake Ticket</td>
                  <td className="py-4 px-4 font-bold text-zinc-300">- GH¢ 20.00</td>
                  <td className="py-4 px-4"><span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Settled</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="relative z-20 py-8 text-center text-xs text-zinc-500 border-t border-zinc-900 max-w-7xl mx-auto w-full">
        GEN Z LOTTO ADMIN © 2026 — All Rights Reserved
      </footer>
    </div>
  );
}