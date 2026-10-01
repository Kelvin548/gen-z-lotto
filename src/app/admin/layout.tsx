'use client';

import Link from 'next/link';
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
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-amber-400 text-black font-black flex items-center justify-center text-sm shadow-lg shadow-amber-400/20">
                Z
              </div>
              <span className="text-lg font-black tracking-wider text-amber-400">
                GEN Z <span className="text-white">LOTTO</span>
              </span>
            </Link>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-black uppercase tracking-widest text-amber-400">
              Admin
            </span>
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