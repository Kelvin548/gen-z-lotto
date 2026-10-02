// src/app/admin/wallet/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function AdminWalletLedgerPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadTransactions = () => {
      const defaultTransactions = [
        { id: '#TXN-9021', user: 'Kelvin (0245883582)', type: 'Deposit', amount: 500.00, status: 'Success', date: '10/01/2026, 08:30 PM' },
        { id: '#TXN-9022', user: 'Akwasi (0544893582)', type: 'Stake Ticket', amount: -20.00, status: 'Settled', date: '10/01/2026, 09:00 PM' }
      ];

      const saved = localStorage.getItem('admin_platform_wallet_transactions');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTransactions(parsed);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      setTransactions(defaultTransactions);
      localStorage.setItem('admin_platform_wallet_transactions', JSON.stringify(defaultTransactions));
    };

    loadTransactions();
    window.addEventListener('storage', loadTransactions);
    return () => window.removeEventListener('storage', loadTransactions);
  }, []);

  const filteredTransactions = transactions.filter(tx =>
    tx.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVolume = transactions.reduce((acc, tx) => acc + Math.abs(Number(tx.amount || 0)), 0);

  return (
    <div className="space-y-6 relative z-10 max-w-7xl mx-auto p-6 text-white">
      {/* Header */}
      <div className="border-b border-yellow-500/20 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-extrabold tracking-widest uppercase mb-2">
            <span>💳</span> Financial Audit
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">Wallet Ledger & Transactions</h2>
          <p className="text-xs text-zinc-400 mt-1">Audit platform deposits, ticket stakes, and withdrawal payouts across all user accounts.</p>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search TX ID, user, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl bg-zinc-900 border border-yellow-500/20 px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-yellow-400 shadow-inner"
          />
        </div>
      </div>

      {/* Transactions Ledger Container */}
      <div className="bg-zinc-950/90 border border-yellow-500/30 rounded-3xl p-6 shadow-2xl overflow-x-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-yellow-400">Recent Transactions</h3>
          <div className="px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-bold">
            Total Platform Volume: <span className="text-amber-400 font-black ml-1">GH₵ {totalVolume.toFixed(2)}</span>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">
            No transactions found matching your search.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-yellow-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-4">TX ID & Timestamp</th>
                <th className="py-4 px-4">User / Contact</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Amount (GH₵)</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredTransactions.map((tx, idx) => {
                const isDeposit = tx.type?.toLowerCase().includes('deposit') || Number(tx.amount) > 0;
                return (
                  <tr key={tx.id || idx} className="hover:bg-zinc-900/40 transition">
                    <td className="py-4 px-4">
                      <div className="font-mono font-black text-yellow-400">{tx.id}</div>
                      <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">🕒 {tx.date || 'Today'}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">{tx.user}</td>
                    <td className="py-4 px-4 font-semibold text-zinc-300 uppercase">{tx.type}</td>
                    <td className={`py-4 px-4 font-black ${isDeposit ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isDeposit ? `+ GH₵ ${Number(tx.amount).toFixed(2)}` : `- GH₵ ${Math.abs(Number(tx.amount)).toFixed(2)}`}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 font-bold text-[10px]">
                        {tx.status || 'Success'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}