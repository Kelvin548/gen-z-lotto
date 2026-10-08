// src/app/admin/tickets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function AdminAllTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);

  const loadTickets = () => {
    try {
      const combinedMap = new Map();

      // Loop through all localStorage keys to find any ticket storage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('ticket') || key.includes('lotto'))) {
          const val = localStorage.getItem(key);
          if (val) {
            try {
              const parsed = JSON.parse(val);
              const items = Array.isArray(parsed) ? parsed : [parsed];
              items.forEach((t: any) => {
                if (t && (t.bookingCode || t.id)) {
                  const code = t.bookingCode || t.id;
                  let numsDisplay = 'N/A';
                  if (Array.isArray(t.numbers)) {
                    numsDisplay = t.numbers.join(', ');
                  } else if (typeof t.numbers === 'string') {
                    numsDisplay = t.numbers;
                  }

                  if (!code.startsWith('RES-') || numsDisplay !== 'N/A') {
                    combinedMap.set(code, {
                      id: t.id || code,
                      bookingCode: code,
                      gameType: t.gameType || t.type || 'Standard',
                      numbers: numsDisplay,
                      stake: Number(t.total || t.stake || 0).toFixed(2),
                      minWin: Number(t.minWin || 0).toFixed(2),
                      status: t.status || 'Active',
                      createdAt: t.createdAt || t.date || 'Today',
                      customerPhone: t.customerPhone || t.username || 'Customer',
                      gameName: t.gameName || '5/90 Lotto',
                      verifiedByAdmin: t.verifiedByAdmin || false
                    });
                  }
                }
              });
            } catch (err) {
              // Ignore non-JSON keys
            }
          }
        }
      }

      const formatted = Array.from(combinedMap.values());
      formatted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTickets(formatted);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadTickets();
    window.addEventListener('storage', loadTickets);
    const interval = setInterval(loadTickets, 1000);
    return () => {
      window.removeEventListener('storage', loadTickets);
      clearInterval(interval);
    };
  }, []);

  const handleConfirmTransaction = (bookingCode: string) => {
    const updatedRaw = tickets.map(t => 
      t.bookingCode === bookingCode 
        ? { ...t, status: 'Confirmed', verifiedByAdmin: true } 
        : t
    );
    setTickets(updatedRaw);
    localStorage.setItem('admin_all_tickets', JSON.stringify(updatedRaw));
    alert(`Ticket ${bookingCode} confirmed successfully!`);
  };

  const handleDeleteTicket = (bookingCode: string) => {
    if (!confirm(`Are you sure you want to delete ticket ${bookingCode}?`)) return;

    // 1. Remove from local component state
    const updated = tickets.filter(t => t.bookingCode !== bookingCode);
    setTickets(updated);

    // 2. Clean from localStorage across relevant keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('ticket') || key.includes('lotto'))) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              const filteredList = parsed.filter((t: any) => (t.bookingCode || t.id) !== bookingCode);
              localStorage.setItem(key, JSON.stringify(filteredList));
            }
          } catch (e) {
            // Ignore non-array keys
          }
        }
      }
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.gameName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient) {
    return <div className="text-center py-20 text-zinc-400 text-xs">Loading ledger...</div>;
  }

  return (
    <div className="space-y-6 relative z-10 max-w-7xl mx-auto p-4 sm:p-6 text-white">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        <FloatingBubbles />
      </div>

      <div className="border-b border-yellow-500/20 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-extrabold tracking-widest uppercase mb-2">
            <span>🎟</span> Master Ledger & Confirmations
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">All Platform Tickets</h2>
          <p className="text-xs text-zinc-400 mt-1">Total synchronized records: {tickets.length}</p>
        </div>
        
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

      {filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950/80 backdrop-blur-md border border-zinc-900 rounded-3xl text-zinc-500 text-xs shadow-2xl space-y-2 relative z-10">
          <p className="text-sm font-bold text-zinc-400">No ticket logs found.</p>
          <p className="text-[11px] text-zinc-600">Place a new bet in the customer arena to see it appear here immediately.</p>
        </div>
      ) : (
        <div className="bg-zinc-950/90 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse text-xs min-w-[950px]">
            <thead>
              <tr className="border-b border-zinc-900 text-yellow-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Booking Code & Time</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Game / Draw</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Numbers</th>
                <th className="py-3 px-3">Stake (GH₵)</th>
                <th className="py-3 px-3">Min Win</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredTickets.map((t, idx) => {
                const isConfirmed = t.status === 'Confirmed' || t.verifiedByAdmin;

                return (
                  <tr key={t.id || idx} className="hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-black text-yellow-400 text-xs sm:text-sm">{t.bookingCode}</div>
                      <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">🕒 {t.createdAt}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                        {t.customerPhone}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-300">{t.gameName}</td>
                    <td className="py-3.5 px-3 font-bold text-amber-300 uppercase">{t.gameType}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-zinc-200">{t.numbers}</td>
                    <td className="py-3.5 px-3 font-black text-white">GH₵ {t.stake}</td>
                    <td className="py-3.5 px-3 font-black text-emerald-400">GH₵ {t.minWin}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                        isConfirmed 
                          ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {isConfirmed ? 'Confirmed' : t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isConfirmed ? (
                          <button
                            onClick={() => handleConfirmTransaction(t.bookingCode)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-[11px] uppercase tracking-wider hover:opacity-90 transition shadow cursor-pointer"
                          >
                            Confirm ✓
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                            Verified ✓
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteTicket(t.bookingCode)}
                          title="Delete Ticket"
                          className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
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