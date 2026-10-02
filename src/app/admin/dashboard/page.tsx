'use client';

import React from 'react';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 relative z-10">
      {/* 3D Floating Bubbles Background (Restored and active) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        <FloatingBubbles />
      </div>

      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Control Center</h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">Monitor platform metrics, manage draw results, and oversee user ticket transactions.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        <div className="bg-zinc-950/80 backdrop-blur-xl p-5 rounded-2xl border border-yellow-500/20 shadow-xl space-y-1">
          <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Active Players</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">1,248</h2>
        </div>
        <div className="bg-zinc-950/80 backdrop-blur-xl p-5 rounded-2xl border border-yellow-500/20 shadow-xl space-y-1">
          <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Total Stakes</span>
          <h2 className="text-2xl sm:text-3xl font-black text-yellow-400">GH¢ 45,820.00</h2>
        </div>
        <div className="bg-zinc-950/80 backdrop-blur-xl p-5 rounded-2xl border border-yellow-500/20 shadow-xl space-y-1">
          <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">Pending Payouts</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">GH¢ 3,450.00</h2>
        </div>
      </div>

      {/* Management Panel View */}
      <div className="bg-zinc-950/80 backdrop-blur-xl p-6 rounded-2xl border border-yellow-500/20 shadow-xl space-y-3 relative z-10">
        <h3 className="text-sm font-bold text-yellow-400">System Operations & Controls</h3>
        <p className="text-zinc-300 text-xs">Use the slim navigation bar above or slide-out menu to switch between admin management features instantly.</p>
      </div>
    </div>
  );
}