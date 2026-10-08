// src/app/customer/tickets/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Ticket {
  id: string;
  bookingCode: string;
  gameType: string;
  gameName: string;
  numbers: number[];
  total: number;
  stake?: number | string;
  date: string;
  createdAt: string;
  status: string;
  paymentMethod?: string;
  customerPhone?: string;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      // Safe parsing helper to prevent JSON.parse crashes
      const safeParse = (key: string) => {
        try {
          const val = localStorage.getItem(key);
          if (!val) return [];
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          return [];
        }
      };

      // 1. Gather all possible sources from localStorage to ensure tickets always show up
      const currentUser = localStorage.getItem('active_user_phone') || localStorage.getItem('active_username') || 'Customer';
      const userStorageKey = `user_tickets_${currentUser}`;
      
      const userTickets = safeParse(userStorageKey);
      const generalTickets = safeParse('gen z lotto tickets');
      const adminTickets = safeParse('admin_all_tickets');
      const fallbackCustomerTickets = safeParse('user_tickets_Customer');

      // 2. Combine and deduplicate tickets by bookingCode or id
      const combined = [...userTickets, ...generalTickets, ...fallbackCustomerTickets, ...adminTickets];
      const uniqueTickets = Array.from(
        new Map(combined.map(t => [t?.bookingCode || t?.id, t])).values()
      ).filter(t => t !== null && t !== undefined);

      setTickets(uniqueTickets as Ticket[]);
    } catch (e) {
      console.error("Failed to load tickets:", e);
      setTickets([]);
    }
  }, []);

  if (!isClient) return null;

  return (
    <div className="space-y-6 relative z-10 max-w-5xl mx-auto p-4 sm:p-6">
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
            🎟
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No active tickets found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              You haven't placed any bets on this account yet. Head over to the play arena, pick your numbers, and place your first stake!
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
          {tickets.map((ticket: any, index) => (
            <div
              key={index}
              className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 hover:border-amber-500/40 rounded-3xl p-6 shadow-xl transition-all space-y-4 text-white"
            >
              {/* Ticket Top Row: ID & Status Badge */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-amber-400">{ticket.bookingCode || ticket.id}</span>
                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-xs font-semibold text-zinc-400">{ticket.createdAt || ticket.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                    {ticket.gameType || 'Standard'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    {ticket.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Game Name */}
              <div className="text-xs text-zinc-300">
                Game: <strong className="text-white">{ticket.gameName || '5/90 Lotto'}</strong>
              </div>

              {/* Middle Row: Selected Numbers */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Selected Numbers:</span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(ticket.numbers) && ticket.numbers.map((num: any, i: number) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-xl bg-amber-400 text-black font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/20"
                    >
                      {num !== null && num !== undefined ? (num < 10 ? `0${num}` : num) : '--'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Stake & Payment info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-zinc-900 gap-2 text-xs">
                <div className="text-zinc-400">
                  Total Stake: <strong className="text-amber-400">GH₵ {ticket.total || ticket.stake || 0}</strong>
                </div>
                <div className="text-zinc-400">
                  Payment: <strong className="text-white">{ticket.paymentMethod || 'Mobile Money'}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}