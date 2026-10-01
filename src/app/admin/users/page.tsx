// src/app/admin/users/page.tsx
'use client';

import React from 'react';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col relative overflow-hidden selection:bg-yellow-500 selection:text-black">
      
      {/* 3D Floating Bubbles Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <FloatingBubbles />
      </div>

      {/* Main Users Content (Header is handled centrally by admin/layout.tsx) */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white">User Management</h1>
          <p className="text-zinc-400 text-sm mt-1">View registered player accounts, monitor wallet balances, and manage account statuses.</p>
        </div>

        {/* Users Table Card */}
        <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-yellow-400">Registered Players</h3>
            <span className="text-xs text-zinc-400">Total Users: <strong className="text-white">1,248</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 text-zinc-400 uppercase">
                <tr>
                  <th className="py-3 px-4">User ID / Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                <tr>
                  <td className="py-4 px-4 font-bold text-white">#USR-8492 — Kelvin</td>
                  <td className="py-4 px-4 text-zinc-400">kelvin@genzlotto.com</td>
                  <td className="py-4 px-4 text-yellow-400 font-bold">GH¢ 5,420.00</td>
                  <td className="py-4 px-4"><span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Active</span></td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-yellow-400 hover:underline font-semibold">View Details</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-bold text-white">#USR-8493 — Akwasi</td>
                  <td className="py-4 px-4 text-zinc-400">akwasi@genzlotto.com</td>
                  <td className="py-4 px-4 text-yellow-400 font-bold">GH¢ 120.50</td>
                  <td className="py-4 px-4"><span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Active</span></td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-yellow-400 hover:underline font-semibold">View Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="relative z-20 py-8 text-center text-xs text-zinc-500 border-t border-zinc-900 max-w-7xl mx-auto w-full">
        GEN Z LOTTO ADMIN © 2026 — All Rights Reserved
      </footer>
    </div>
  );
}