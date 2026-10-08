'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const adminNavLinks = [
    { href: '/admin/dashboard', label: 'Admin Dashboard' },
    { href: '/admin/draws', label: 'Manage Draws' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/wallet', label: 'Wallet Ledger' },
    { href: '/admin/results', label: 'Results' },
    { href: '/admin/tickets', label: 'My Tickets' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden">
      {/* Slim Master Admin Header */}
      <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-zinc-950/95 backdrop-blur-xl px-4 py-2.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="flex items-center gap-2 group">
              <Image 
                src="/logo.png" 
                alt="Gen Z Lotto Logo" 
                width={28} 
                height={28} 
                className="w-[28px] h-[28px] object-contain rounded-full border border-yellow-500/30 shadow-[0_0_10px_rgba(255,215,0,0.3)]" 
              />
              <span className="text-xs font-black tracking-wider text-white flex items-center gap-1.5">
                GEN Z LOTTO 
                <span className="text-yellow-400 text-[8px] px-1 py-0.2 rounded bg-yellow-500/10 border border-yellow-500/25">ADMIN</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5">
            {adminNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-bold transition-colors hover:text-amber-400 ${
                    isActive ? 'text-amber-400 underline decoration-2 underline-offset-6' : 'text-zinc-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-2.5 py-1 rounded-lg bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider hover:bg-amber-300 transition shadow-sm"
            >
              Exit Admin
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg bg-zinc-900 border border-amber-500/30 text-amber-400 hover:bg-zinc-800 transition focus:outline-none"
              aria-label="Open Menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Sidebar Drawer & Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-zinc-950 border-l border-amber-500/30 shadow-2xl flex flex-col z-50">
            <div className="p-3 border-b border-zinc-900 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-amber-400 tracking-widest">Navigation Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
              {adminNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-amber-400 text-black font-black'
                        : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="p-3 border-t border-zinc-900">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-lg bg-zinc-900 border border-amber-500/30 text-amber-400 font-black text-[11px] uppercase tracking-wider"
              >
                Exit Admin Mode
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Page Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex-1 w-full">
        {children}
      </main>
    </div>
  );
}