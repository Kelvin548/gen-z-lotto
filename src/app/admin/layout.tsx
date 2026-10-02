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
      {/* Master Admin Header */}
      <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-zinc-950/95 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="flex items-center gap-2 group">
              <Image 
                src="/logo.png" 
                alt="Gen Z Lotto Logo" 
                width={34} 
                height={34} 
                className="w-[34px] h-[34px] object-contain rounded-full border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.3)]" 
              />
              <span className="text-xs sm:text-sm font-black tracking-wider text-white flex items-center gap-1.5">
                GEN Z LOTTO 
                <span className="text-yellow-400 text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/25">ADMIN</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {adminNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-bold transition-colors hover:text-amber-400 ${
                    isActive ? 'text-amber-400 underline decoration-2 underline-offset-8' : 'text-zinc-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-black text-[11px] uppercase tracking-wider hover:bg-amber-300 transition shadow-md shadow-amber-400/20 shrink-0"
            >
              Exit Admin
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-amber-500/30 text-amber-400 hover:bg-zinc-800 transition focus:outline-none shrink-0"
              aria-label="Open Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Sidebar Drawer & Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Dark Backdrop (Click to close) */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar Drawer Panel */}
          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-zinc-950 border-l border-amber-500/30 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-400 tracking-widest">Navigation Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                aria-label="Close Menu"
              >
                ✕
              </button>
            </div>

            {/* Sidebar Links */}
            <div className="p-4 space-y-2 flex-1 overflow-y-auto">
              {adminNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-2xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-amber-400 text-black font-black shadow-lg shadow-amber-400/20'
                        : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Sidebar Footer Action */}
            <div className="p-4 border-t border-zinc-900">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 rounded-xl bg-zinc-900 border border-amber-500/30 text-amber-400 font-black text-xs uppercase tracking-wider hover:bg-zinc-800 transition"
              >
                Exit Admin Mode
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Page Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10 flex-1 w-full">
        {children}
      </main>
    </div>
  );
}