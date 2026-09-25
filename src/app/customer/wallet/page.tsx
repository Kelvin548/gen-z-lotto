'use client';

import { useState } from 'react';

export default function CustomerWalletPage() {
  const [balance, setBalance] = useState<number>(150.00);
  const [topUpAmount, setTopUpAmount] = useState<string>('');

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(topUpAmount);
    if (!isNaN(val) && val > 0) {
      setBalance(prev => prev + val);
      setTopUpAmount('');
      alert(`Successfully added GH₵ ${val.toFixed(2)} to your wallet!`);
    } else {
      alert('Please enter a valid top-up amount.');
    }
  };

  return (
    <div className="space-y-6 relative z-10 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white mb-1">My Wallet</h2>
        <p className="text-xs text-zinc-400">Manage your account balance and fund your gameplay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Current Balance</span>
          <div className="text-4xl font-black text-white">
            GH₵ {balance.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-400">Available for instant stake placements and withdrawals.</p>
        </div>

        <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Fund Wallet</span>
          <form onSubmit={handleTopUp} className="space-y-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">GH₵</span>
              <input
                type="number"
                min="1"
                placeholder="Enter amount..."
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 py-3 pl-14 pr-4 text-white text-xs font-bold focus:outline-none focus:border-amber-400 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 py-3.5 font-black text-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all"
            >
              Proceed to Top-Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}