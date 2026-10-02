// src/app/admin/tickets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function AdminAllTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadAllTickets = () => {
      const ticketMap = new Map();

      // 1. Load from admin master ledger
      const masterLedger = localStorage.getItem('admin_all_tickets');
      if (masterLedger) {
        try {
          const parsed = JSON.parse(masterLedger);
          if (Array.isArray(parsed)) {
            parsed.forEach((t: any) => {
              if (t && (t.bookingCode || t.id)) {
                ticketMap.set(t.bookingCode || t.id, t);
              }
            });
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Load from general customer tickets
      const generalTickets = localStorage.getItem('gen_z_lotto_tickets');
      if (generalTickets) {
        try {
          const parsed = JSON.parse(generalTickets);
          if (Array.isArray(parsed)) {
            parsed.forEach((t: any) => {
              if (t && (t.bookingCode || t.id)) {
                ticketMap.set(t.bookingCode || t.id, t);
              }
            });
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 3. Load from any user-specific ticket keys
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('user_tickets_')) {
            const userStore = localStorage.getItem(key);
            if (userStore) {
              const parsed = JSON.parse(userStore);
              if (Array.isArray(parsed)) {
                parsed.forEach((t: any) => {
                  if (t && (t.bookingCode || t.id)) {
                    ticketMap.set(t.bookingCode || t.id, t);
                  }
                });
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      }

      setTickets(Array.from(ticketMap.values()));
    };

    loadAllTickets();
    window.addEventListener('storage', loadAllTickets);
    return () => window.removeEventListener('storage', loadAllTickets);
  }, []);

  const filteredTickets = tickets.filter(t => 
    (t.bookingCode || t.id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.username || t.user || t.customerPhone)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.gameName || t.game || t.drawName)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative z-10 max-w-7xl mx-auto p-4 sm:p-6 text-white">
      {/* Background Bubbles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        <FloatingBubbles />
      </div>

      {/* Header */}
      <div className="border-b border-yellow-500/20 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-extrabold tracking-widest uppercase mb-2">
            <span>🎟️</span> Master Ledger
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">All Platform Tickets</h2>
          <p className="text-xs text-zinc-400 mt-1">Monitor all user ticket entries, stakes, and win statuses across the platform.</p>
        </div>
        
        {/* Search input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by code, user, or game..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl bg-zinc-900 border border-yellow-500/20 px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-yellow-400 shadow-inner"
          />
        </div>
      </div>

      {/* Tickets Table / List View */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 rounded-3xl text-zinc-500 text-xs shadow-2xl space-y-2 relative z-10">
          <p className="text-sm font-bold text-zinc-400">No ticket logs found in active storage.</p>
          <p className="text-[11px] text-zinc-600">Tickets placed by customers in the play arena will automatically appear here instantly.</p>
        </div>
      ) : (
        <div className="bg-zinc-950/90 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-900 text-yellow-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Booking Code & Time</th>
                <th className="py-3 px-3">Customer / Contact</th>
                <th className="py-3 px-3">Game / Draw</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Numbers</th>
                <th className="py-3 px-3">Stake (GH₵)</th>
                <th className="py-3 px-3">Min Win (GH₵)</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredTickets.map((t, idx) => {
                const displayCode = t.bookingCode || t.id || `BK-${100000 + idx}`;
                const displayGame = t.gameName || t.game || t.drawName || 'NLA VAG Monday';
                const displayUser = t.customerPhone || t.username || t.user || 'Customer';
                const displayTimestamp = t.createdAt || t.date || 'Today';

                return (
                  <tr key={t.id || idx} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-black text-yellow-400 text-xs sm:text-sm">{displayCode}</div>
                      <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">🕒 {displayTimestamp}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                        {displayUser}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-300">{displayGame}</td>
                    <td className="py-3.5 px-3 font-bold text-amber-300 uppercase">{t.gameType}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-zinc-200">
                      {t.gameType === 'Banker' ? `[Banker: ${t.bankerNumber}]` : (t.numbers?.join(', ') || 'N/A')}
                    </td>
                    <td className="py-3.5 px-3 font-black text-white">GH₵ {Number(t.total || t.stake || 0).toFixed(2)}</td>
                    <td className="py-3.5 px-3 font-black text-emerald-400">GH₵ {Number(t.minWin || 0).toFixed(2)}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 font-bold text-[10px]">
                        {t.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}