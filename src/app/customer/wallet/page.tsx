// src/app/customer/wallet/page.tsx
'use client';

import React, { useState } from 'react';

export default function CustomerWalletPage() {
  const [depositing, setDepositing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDeposit = () => {
    setDepositing(true);
    setTimeout(() => {
      setDepositing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="px-6 py-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white">Wallet & Ledger</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage funds and inspect sandbox deposit logs.</p>
      </div>

      <div className="p-8 rounded-3xl bg-surface-card border border-yellow-500/30 card-gold-glow flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Available Balance</span>
          <div className="text-4xl font-black text-yellow-400 mt-1">GH₵ 5,420.00</div>
          <span className="text-xs text-emerald-400 mt-2 block">● Sandbox Secure Ledger Active</span>
        </div>
        <button
          disabled={depositing}
          onClick={handleDeposit}
          className="px-8 py-4 rounded-2xl gold-gradient-bg text-obsidian font-bold text-sm hover:opacity-90 transition shadow-xl shadow-yellow-500/20"
        >
          {depositing ? 'Processing Deposit...' : 'Simulate MTN Deposit'}
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
          Deposit simulated successfully! Balance updated.
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
        <div className="p-4 rounded-2xl bg-surface-card border border-yellow-500/15 flex items-center justify-between text-sm">
          <div>
            <p className="font-bold text-white">Sandbox Top-up (MTN Mobile Money)</p>
            <p className="text-xs text-zinc-400">Today, 12:42 PM</p>
          </div>
          <span className="font-bold text-emerald-400">+ GH₵ 100.00</span>
        </div>
      </div>
    </div>
  );
}