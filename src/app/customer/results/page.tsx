// src/app/results/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function CustomerResultsPage() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('admin_published_results');
    if (saved) {
      setResults(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="space-y-6 relative z-10 p-6 max-w-4xl mx-auto text-white">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-1">National Draw Results</h2>
        <p className="text-xs text-zinc-400">Official certified winning numbers for 5/90 draws.</p>
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950/60 border border-zinc-800 rounded-3xl text-zinc-500 text-xs">
            No draw results published yet. Check back soon!
          </div>
        ) : (
          results.map((res) => (
            <div key={res.id} className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-amber-400">{res.drawName}</h3>
                <span className="text-xs text-zinc-400 font-semibold">{res.date}</span>
              </div>
              
              {/* Winning Numbers */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Winning Numbers:</span>
                <div className="flex gap-3">
                  {res.winningNumbers.map((n: string, i: number) => (
                    <div key={i} className="w-12 h-12 rounded-2xl bg-amber-400 text-black font-black text-sm flex items-center justify-center shadow-md shadow-amber-400/25">
                      {n}
                    </div>
                  ))}
                </div>
              </div>

              {/* Machine Numbers */}
              {res.machineNumbers && res.machineNumbers.some((m: string) => m !== '--') && (
                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Machine Numbers:</span>
                  <div className="flex gap-3">
                    {res.machineNumbers.map((m: string, i: number) => (
                      <div key={i} className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center">
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