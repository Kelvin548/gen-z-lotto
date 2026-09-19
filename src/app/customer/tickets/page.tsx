'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Ticket {
  id: string;
  gameType: string;
  numbers: number[];
  stake: number;
  total: number;
  date: string;
  status: string;
  paymentMethod?: string;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    // Load tickets matching the active user's isolated storage key
    const currentUser = localStorage.getItem('active_username') || 'customer_user';
    const storageKey = `user_tickets_${currentUser}`;
    const savedTickets = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setTickets(savedTickets);
  }, []);

  return (
    <div className="space-y-6 relative z-10 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-1">My Ticket History</h2>
          <p className="text-xs text-zinc-400">Inspect your booking codes, selections, and win statuses.</p>
        </div>
        <Link
          href="/customer/play"
          className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all"
        >
          + Place New Bet
        </Link>
      </div>

      {/* Tickets List View */}
      {tickets.length === 0 ? (
        <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-2xl text-amber-400">
            🎟️
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No active tickets found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              You haven't placed any bets yet. Head over to the play arena, pick your numbers, and place your first stake!
            </p>
          </div>
          <Link
            href="/customer/play"
            className="inline-block px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 hover:border-amber-500/50 text-xs font-bold transition-all"
          >
            Go to Play Arena
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket, index) => (
            <div
              key={index}
              className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 hover:border-amber-500/40 rounded-3xl p-6 shadow-xl transition-all space-y-4"
            >
              {/* Ticket Top Row: ID & Status Badge */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-amber-400">{ticket.id}</span>
                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-xs font-semibold text-zinc-400">{ticket.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                    {ticket.gameType}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    {ticket.status}
                  </span>
                </div>
              </div>

              {/* Middle Row: Selected Numbers */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Selected Numbers:</span>
                <div className="flex flex-wrap gap-2">
                  {ticket.numbers.map((num) => (
                    <div
                      key={num}
                      className="w-10 h-10 rounded-xl bg-amber-400 text-black font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/20"
                    >
                      {num < 10 ? `0${num}` : num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Stake & Payment info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-zinc-900 gap-2 text-xs">
                <div className="text-zinc-400">
                  Payment: <span className="text-white font-semibold">{ticket.paymentMethod || 'Mobile Money'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Total Stake:</span>
                  <span className="text-sm font-black text-amber-400">GH₵ {ticket.stake}.00</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}