'use client';

import React from 'react';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function AdminDrawsPage() {
  return (
    <div className="space-y-8 relative z-10">
      {/* 3D Floating Bubbles Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <FloatingBubbles />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-white">Manage Draws</h1>
          <p className="text-zinc-400 text-sm mt-1">Schedule new 5/90 lottery draws, close active betting windows, and settle winning numbers.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-yellow-500/20 hover:opacity-90 transition">
          + Create New Draw
        </button>
      </div>

      {/* Draws Table Card */}
      <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-4 relative z-10">
        <h3 className="text-lg font-bold text-yellow-400">Active & Upcoming Draws</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 text-zinc-400 uppercase">
              <tr>
                <th className="py-3 px-4">Draw ID</th>
                <th className="py-3 px-4">Game Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Closing Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              <tr>
                <td className="py-4 px-4 font-bold text-white">#DRW-2026-901</td>
                <td className="py-4 px-4">Premium 5/90</td>
                <td className="py-4 px-4"><span className="px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Active</span></td>
                <td className="py-4 px-4">Today, 6:00 PM</td>
                <td className="py-4 px-4 text-right">
                  <button className="text-yellow-400 hover:underline font-semibold">Manage</button>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-white">#DRW-2026-902</td>
                <td className="py-4 px-4">Midweek Special</td>
                <td className="py-4 px-4"><span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Scheduled</span></td>
                <td className="py-4 px-4">Tomorrow, 4:00 PM</td>
                <td className="py-4 px-4 text-right">
                  <button className="text-yellow-400 hover:underline font-semibold">Manage</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}