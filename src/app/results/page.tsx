// src/app/results/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PublicResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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

  const filteredResults = results.filter((res) => 
    res.drawName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.date?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 flex flex-col px-6 py-10 max-w-6xl mx-auto w-full space-y-10 selection:bg-yellow-500 selection:text-black">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-yellow-500/20 pb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-extrabold tracking-widest uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
            Verified 5/90 Draws
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">National Draw Results</h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Official certified winning numbers and machine ball drops.</p>
        </div>
        <Link 
          href="/" 
          className="text-xs font-bold px-5 py-2.5 rounded-xl bg-zinc-900 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all duration-300 shadow-lg shadow-yellow-500/10"
        >
          ← Back Home
        </Link>
      </div>

      {/* Search & Filter Bar */}
      {results.length > 0 && (
        <div className="w-full">
          <input
            type="text"
            placeholder="Search by draw name (e.g., VAG, Monday) or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl bg-zinc-950/80 border border-yellow-500/20 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition shadow-inner"
          />
        </div>
      )}

      {/* Results List */}
      <div className="space-y-6">
        {filteredResults.length === 0 ? (
          <div className="text-center py-24 bg-zinc-950/50 border border-yellow-500/15 rounded-3xl text-zinc-500 text-sm space-y-3 backdrop-blur-md">
            <div className="text-3xl">🎫</div>
            <p>No draw results found or published yet.</p>
          </div>
        ) : (
          filteredResults.map((res, index) => (
            <div 
              key={res.id || index} 
              className="p-6 md:p-8 rounded-3xl bg-zinc-950/90 border border-yellow-500/25 hover:border-yellow-500/50 transition-all duration-300 shadow-xl shadow-black/60 relative overflow-hidden group space-y-6"
            >
              {/* Subtle Ambient Glow on Hover */}
              <div className="absolute -right-20 -top-20 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-500/10 transition" />

              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-black text-xs">
                    590
                  </div>
                  <div>
                    <h2 className="font-black text-white text-lg tracking-wide">{res.drawName}</h2>
                    <span className="text-xs text-zinc-400 font-medium">Draw Date: {res.date}</span>
                  </div>
                </div>
                <span className="self-start sm:self-auto text-[10px] px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black uppercase tracking-wider shadow-md shadow-yellow-500/20">
                  Official Result
                </span>
              </div>

              {/* Winning Numbers Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>⚡</span> Winning Numbers (Winning)
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {res.winningNumbers?.map((num: string, idx: number) => (
                    <div 
                      key={idx} 
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 text-black font-black flex items-center justify-center text-base md:text-lg shadow-lg shadow-amber-500/30 border border-yellow-200 transform hover:scale-105 transition"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Machine Numbers Section */}
              {res.machineNumbers && res.machineNumbers.some((m: string) => m && m !== '--') && (
                <div className="space-y-3 pt-4 border-t border-zinc-900/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span>⚙️</span> Machine Numbers
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {res.machineNumbers.map((m: string, idx: number) => (
                      <div 
                        key={idx} 
                        className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs md:text-sm flex items-center justify-center shadow-inner"
                      >
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