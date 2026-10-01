'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen bg-black text-white">
      {/* Master Admin Header */}
      <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-zinc-950/95 backdrop-blur-xl px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-2 group">
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
          </div>

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

          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-amber-400 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition shadow-md shadow-amber-400/20"
          >
            Exit Admin
          </Link>
        </div>
      </header>

      {/* Main Admin Page Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}