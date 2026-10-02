'use client';

import React from 'react';
import FloatingBubbles from '@/components/FloatingBubbles';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 relative z-10">
      {/* 3D Floating Bubbles Background (Hidden on mobile to eliminate lag/render delay) */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden md:block">
        <FloatingBubbles />
      </div>

      <div className="relative z-10">
        <h1 className="text-3xl font-black text-white">Admin Control Center</h1>
        <p className="text-zinc-400 text-sm mt-1">Monitor platform metrics, manage draw results, and oversee user ticket transactions.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="bg-zinc-950/90 backdrop-blur-md p-6 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-2">
          <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Active Players</span>
          <h2 className="text-3xl font-black text-white">1,248</h2>
        </div>
        <div className="bg-zinc-950/90 backdrop-blur-md p-6 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-2">
          <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Stakes</span>
          <h2 className="text-3xl font-black text-yellow-400">GH¢ 45,820.00</h2>
        </div>
        <div className="bg-zinc-950/90 backdrop-blur-md p-6 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-2">
          <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Pending Payouts</span>
          <h2 className="text-3xl font-black text-white">GH¢ 3,450.00</h2>
        </div>
      </div>

      {/* Management Panel View */}
      <div className="bg-zinc-950/90 backdrop-blur-md p-8 rounded-3xl border border-yellow-500/20 shadow-2xl space-y-4 relative z-10">
        <h3 className="text-lg font-bold text-yellow-400">System Operations & Controls</h3>
        <p className="text-zinc-300 text-sm">Use the unified navigation bar above to switch between admin management features and customer links instantly.</p>
      </div>
    </div>
  );
}