// src/app/customer/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/customer/dashboard' },
    { name: 'Play', href: '/customer/play' },
    { name: 'Results', href: '/results' },
    { name: 'My Tickets', href: '/customer/tickets' },
    { name: 'Wallet', href: '/customer/wallet' },
    { name: 'Account', href: '/customer/account' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col relative overflow-hidden pb-20 md:pb-0 selection:bg-yellow-500 selection:text-black">
      
      {/* 3D Floating Bubbles Background across all customer pages */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <FloatingBubbles />
      </div>

      {/* Desktop Header */}
      <header className="relative z-20 hidden md:flex items-center justify-between px-8 py-4 border-b border-yellow-500/15 bg-[#0b0b0c]/90 backdrop-blur-md sticky top-0 z-50 max-w-7xl mx-auto w-full">
        <Link href="/customer/dashboard" className="flex items-center gap-3 group">
          <Image 
            src="/logo.png" 
            alt="Gen Z Lotto Logo" 
            width={40} 
            height={40} 
            className="w-10 h-10 object-contain rounded-full border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.3)]" 
          />
          <span className="text-base font-black tracking-wider text-white">GEN Z LOTTO</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition px-3 py-1.5 rounded-lg ${
                  isActive
                    ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 shadow-sm'
                    : 'text-zinc-300 hover:text-yellow-400 hover:bg-zinc-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/customer/wallet" className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950/80 border border-yellow-500/20 hover:border-yellow-500/50 transition shadow-lg">
            <span className="text-xs text-zinc-400">Wallet:</span>
            <span className="text-sm font-bold text-yellow-400">GH¢ 5,420.00</span>
          </Link>
          <Link href="/customer/account" className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black font-extrabold text-sm shadow-md">
            U
          </Link>
        </div>
      </header>

      {/* Main Content View */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 border-t border-yellow-500/20 z-50 px-4 py-2 flex items-center justify-around shadow-2xl backdrop-blur-lg">
        {[
          { name: 'Home', href: '/customer/dashboard', icon: '🏠' },
          { name: 'Play', href: '/customer/play', icon: '⚡' },
          { name: 'Tickets', href: '/customer/tickets', icon: '🎟️' },
          { name: 'Wallet', href: '/customer/wallet', icon: '💳' },
          { name: 'Account', href: '/customer/account', icon: '👤' },
        ].map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                isActive ? 'text-yellow-400 font-bold bg-yellow-500/10' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}