'use client';

import React from 'react';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function AdminWalletPage() {
  return (
    <div className="space-y-8 relative z-10">
      {/* 3D Floating Bubbles Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <FloatingBubbles />
      </div>

      <div className="relative z-10">
        <h1 className="text-3xl font-black text-white">Wallet Ledger & Transactions</h1>
        <p className="text-zinc-400 text-sm mt-1">Audit platform deposits, ticket stakes, and withdrawal payouts across all user accounts.</p>
      </div>

      {/* Ledger Table Card */}
      <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-yellow-400">Recent Transactions</h3>
          <span className="text-xs text-zinc-400">Total Volume: <strong className="text-white">GH¢ 45,820.00</strong></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 text-zinc-400 uppercase">
              <tr>
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              <tr>
                <td className="py-4 px-4 font-bold text-white">#TXN-9021</td>
                <td className="py-4 px-4">Kelvin</td>
                <td className="py-4 px-4 text-green-400">Deposit</td>
                <td className="py-4 px-4 font-bold text-yellow-400">+ GH¢ 500.00</td>
                <td className="py-4 px-4"><span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Success</span></td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-white">#TXN-9022</td>
                <td className="py-4 px-4">Akwasi</td>
                <td className="py-4 px-4 text-red-400">Stake Ticket</td>
                <td className="py-4 px-4 font-bold text-zinc-300">- GH¢ 20.00</td>
                <td className="py-4 px-4"><span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Settled</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}