// src/components/lotto/BetSlip.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export function BetSlip({ drawId, gameTypeCode, primaryNumbers, secondaryNumbers, stakePesewas, onClear }: any) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<any | null>(null);

  const handlePlaceBet = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Resolve current user and persistently set it
      const currentUser = localStorage.getItem('active_user_phone') || localStorage.getItem('active_username') || 'Customer';
      localStorage.setItem('active_user_phone', currentUser);

      const bookingCode = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
      const stakeCedis = (Number(stakePesewas || 0) / 100).toFixed(2);
      const minWinCedis = (Number(stakeCedis) * 40).toFixed(2);

      const newTicket = {
        id: uuidv4(),
        bookingCode,
        gameType: gameTypeCode || 'PERM 2',
        numbers: primaryNumbers || [],
        stake: stakeCedis,
        total: Number(stakeCedis),
        minWin: minWinCedis,
        status: 'Active',
        createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customerPhone: currentUser,
        gameName: 'NLA VAG Monday',
        verifiedByAdmin: false
      };

      // 1. SAVE TO ADMIN MASTER LEDGER
      const adminTickets = JSON.parse(localStorage.getItem('admin_all_tickets') || '[]');
      localStorage.setItem('admin_all_tickets', JSON.stringify([newTicket, ...adminTickets]));

      // 2. SAVE TO GENERAL TICKETS KEY (Read by My Tickets page)
      const generalTickets = JSON.parse(localStorage.getItem('gen z lotto tickets') || '[]');
      localStorage.setItem('gen z lotto tickets', JSON.stringify([newTicket, ...generalTickets]));

      // 3. SAVE TO USER'S ISOLATED KEY
      const userStorageKey = `user_tickets_${currentUser}`;
      const existingUserTickets = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
      localStorage.setItem(userStorageKey, JSON.stringify([newTicket, ...existingUserTickets]));

      setConfirmation({ bookingCode, totalStakeMinor: stakePesewas });
      if (onClear) onClear();
    } catch (err) {
      setErrorMsg("Failed to place bet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmation) {
    const shareText = encodeURIComponent(
      `GEN Z LOTTO (DEMO Ticket)\nBooking Code: ${confirmation.bookingCode}`
    );

    return (
      <div className="p-4 bg-zinc-900 border border-emerald-500/30 rounded-xl text-white space-y-4">
        <div className="text-center">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
            DEMO / SANDBOX
          </span>
          <h3 className="text-xl font-bold mt-2 text-emerald-400">Demo Ticket Created</h3>
          <p className="text-xs text-zinc-400 mt-1">NO REAL MONEY WAS CHARGED.</p>
        </div>

        <div className="bg-zinc-950 p-3 rounded-lg text-sm space-y-1 font-mono">
          <div><span className="text-zinc-500">Booking Code:</span> <strong className="text-white">{confirmation.bookingCode}</strong></div>
          <div><span className="text-zinc-500">Total Stake:</span> GH₵ {(Number(confirmation.totalStakeMinor || 0) / 100).toFixed(2)}</div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition"
          >
            SHARE ON WHATSAPP
          </a>
          <button
            onClick={() => router.push('/customer/tickets')}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-semibold transition"
          >
            VIEW MY TICKETS
          </button>
          <button
            onClick={() => setConfirmation(null)}
            className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 text-xs font-medium rounded-lg transition"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white space-y-4">
      <h3 className="text-lg font-bold border-b border-zinc-800 pb-2">Bet Slip</h3>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
          {errorMsg}
        </div>
      )}

      <button
        onClick={handlePlaceBet}
        disabled={isSubmitting}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 font-bold rounded-lg transition flex justify-center items-center gap-2"
      >
        {isSubmitting ? "Creating ticket..." : "PLACE DEMO BET"}
      </button>
    </div>
  );
}