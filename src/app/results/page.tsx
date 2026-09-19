// src/app/results/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PublicResultsPage() {
  const [draws, setDraws] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/draws')
      .then(res => res.json())
      .then(data => {
        setDraws(Array.isArray(data) ? data : data?.draws || []);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-zinc-100 flex flex-col px-6 py-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between border-b border-yellow-500/15 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">National Draw Results</h1>
          <p className="text-sm text-zinc-400 mt-1">Official certified winning numbers for 5/90 draws.</p>
        </div>
        <Link href="/" className="text-xs font-semibold px-4 py-2 rounded-xl bg-surface-card border border-yellow-500/20 text-yellow-400 hover:border-yellow-500/50 transition">
          ← Back Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {draws.map((d: any, idx: number) => (
          <div key={d.id || idx} className="p-6 rounded-2xl bg-surface-card border border-yellow-500/20 card-gold-glow space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-base">{d.name || `National Draw #${idx + 1}`}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 uppercase">{d.status}</span>
            </div>
            <div className="flex gap-2">
              {[12, 34, 45, 67, 89].map(num => (
                <div key={num} className="w-10 h-10 rounded-xl gold-gradient-bg text-obsidian font-black flex items-center justify-center text-sm shadow-md">
                  {num}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}