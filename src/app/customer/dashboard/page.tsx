// src/app/customer/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CustomerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, drawsRes] = await Promise.all([
          fetch('/api/users').catch(() => null),
          fetch('/api/draws').catch(() => null),
        ]);

        if (userRes && userRes.ok) {
          const uData = await userRes.json();
          setUser(Array.isArray(uData) ? uData[0] : uData?.users?.[0]);
        }

        if (drawsRes && drawsRes.ok) {
          const dData = await drawsRes.json();
          setDraws(Array.isArray(dData) ? dData : dData?.draws || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-surface-card via-[#221B10] to-surface-card border border-yellow-500/25 card-gold-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-bold text-yellow-400 mb-3 uppercase">
            Verified Account
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="gold-gradient-text">Player</span>!
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Your secure wallet and active lottery tickets are fully synchronized.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-obsidian border border-yellow-500/25 px-6 py-3 rounded-2xl flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Available Balance</span>
            <span className="text-2xl font-black text-yellow-400">GH₵ 5,420.00</span>
          </div>
          <Link href="/customer/wallet" className="px-6 py-4 rounded-2xl gold-gradient-bg text-obsidian font-bold text-sm hover:opacity-90 transition shadow-lg shadow-yellow-500/20">
            Deposit Funds
          </Link>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/customer/play" className="p-6 rounded-2xl bg-surface-card border border-yellow-500/20 hover:border-yellow-500/50 transition group flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">Quick Play 5/90 ⚡</h3>
            <p className="text-xs text-zinc-400 mt-1">Select numbers & place ticket</p>
          </div>
          <span className="text-2xl text-yellow-400 group-hover:translate-x-1 transition">→</span>
        </Link>

        <Link href="/customer/tickets" className="p-6 rounded-2xl bg-surface-card border border-yellow-500/20 hover:border-yellow-500/50 transition group flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">My Tickets 🎟️</h3>
            <p className="text-xs text-zinc-400 mt-1">Review active & past bookings</p>
          </div>
          <span className="text-2xl text-yellow-400 group-hover:translate-x-1 transition">→</span>
        </Link>

        <Link href="/results" className="p-6 rounded-2xl bg-surface-card border border-yellow-500/20 hover:border-yellow-500/50 transition group flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition">Latest Results 🏆</h3>
            <p className="text-xs text-zinc-400 mt-1">Check winning draw numbers</p>
          </div>
          <span className="text-2xl text-yellow-400 group-hover:translate-x-1 transition">→</span>
        </Link>
      </div>

      {/* Active Draws Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-yellow-500"></span>
          Active National Draws
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {draws.slice(0, 3).map((draw: any, idx: number) => (
            <div key={draw.id || idx} className="p-6 rounded-2xl bg-surface-card border border-yellow-500/15 card-gold-glow flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-yellow-400 px-2.5 py-1 rounded-lg bg-yellow-500/10 uppercase">
                  {draw.status || 'OPEN'}
                </span>
                <h3 className="text-lg font-bold text-white mt-3">{draw.name || `National Draw #${idx + 1}`}</h3>
                <p className="text-xs text-zinc-400 mt-1">Scheduled: {new Date(draw.scheduledAt || Date.now()).toLocaleString()}</p>
              </div>
              <Link href={`/customer/play?drawId=${draw.id}`} className="w-full py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold text-xs text-center hover:bg-yellow-500 hover:text-obsidian transition">
                Enter Draw
              </Link>
            </div>
          ))}
          {draws.length === 0 && (
            <div className="p-6 rounded-2xl bg-surface-card border border-yellow-500/15 text-zinc-400 text-sm col-span-3 text-center">
              Active draw schedules loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}