// src/app/results/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PublicResultsPage() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // Read from the exact localStorage key used by the admin results management page
    const saved = localStorage.getItem('admin_published_results');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResults(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error(e);
      }
    }
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

      <div className="space-y-6">
        {results.length === 0 ? (
          <div className="text-center py-20 bg-surface-card border border-yellow-500/15 rounded-3xl text-zinc-500 text-sm">
            No draw results published yet. Check back soon!
          </div>
        ) : (
          results.map((res) => (
            <div key={res.id} className="p-6 rounded-2xl bg-surface-card border border-yellow-500/20 card-gold-glow space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-base">{res.drawName}</span>
                  <span className="text-xs text-zinc-400">({res.date})</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 uppercase font-bold">Published</span>
              </div>

              {/* Winning Numbers */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Winning Numbers:</span>
                <div className="flex gap-3">
                  {res.winningNumbers.map((num: string, idx: number) => (
                    <div key={idx} className="w-12 h-12 rounded-xl gold-gradient-bg text-obsidian font-black flex items-center justify-center text-sm shadow-md">
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Machine Numbers */}
              {res.machineNumbers && res.machineNumbers.some((m: string) => m !== '--') && (
                <div className="space-y-2 pt-2 border-t border-yellow-500/10">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Machine Numbers:</span>
                  <div className="flex gap-3">
                    {res.machineNumbers.map((m: string, idx: number) => (
                      <div key={idx} className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center">
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}