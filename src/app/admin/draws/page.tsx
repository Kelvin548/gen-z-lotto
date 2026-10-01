// src/app/admin/draws/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import FloatingBubbles from '@/components/FloatingBubbles';

interface Draw {
  id: string;
  gameType: string;
  status: 'Active' | 'Scheduled' | 'Closed';
  closingTime: string;
}

export default function AdminDrawsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameType, setGameType] = useState('Premium 5/90');
  const [closingTime, setClosingTime] = useState('');
  const [draws, setDraws] = useState<Draw[]>([
    { id: '#DRW-2026-901', gameType: 'Premium 5/90', status: 'Active', closingTime: 'Today, 6:00 PM' },
    { id: '#DRW-2026-902', gameType: 'Midweek Special', status: 'Scheduled', closingTime: 'Tomorrow, 4:00 PM' }
  ]);

  // Load saved draws from localStorage on mount
  useEffect(() => {
    const savedDraws = localStorage.getItem('gen_z_lotto_admin_draws');
    if (savedDraws) {
      try {
        setDraws(JSON.parse(savedDraws));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleCreateDraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingTime) return;

    const newDraw: Draw = {
      id: `#DRW-${Math.floor(1000 + Math.random() * 9000)}`,
      gameType,
      status: 'Active',
      closingTime,
    };

    const updated = [newDraw, ...draws];
    setDraws(updated);
    
    // Save to admin and customer-accessible storage
    localStorage.setItem('gen_z_lotto_admin_draws', JSON.stringify(updated));
    localStorage.setItem('gen_z_lotto_active_draws', JSON.stringify(updated));

    setIsModalOpen(false);
    setClosingTime('');
  };

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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-yellow-500/20 hover:opacity-90 transition cursor-pointer"
        >
          + Create New Draw
        </button>
      </div>

      {/* Draws Table Card */}
      <div className="bg-zinc-950/85 backdrop-blur-xl p-6 rounded-3xl border border-yellow-500/25 shadow-2xl space-y-4 relative z-10">
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
              {draws.map((draw) => (
                <tr key={draw.id}>
                  <td className="py-4 px-4 font-bold text-white">{draw.id}</td>
                  <td className="py-4 px-4">{draw.gameType}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded border ${
                      draw.status === 'Active' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {draw.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">{draw.closingTime}</td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-yellow-400 hover:underline font-semibold">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Draw Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-yellow-500/30 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-yellow-400">Schedule New 5/90 Draw</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDraw} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Game Type / Draw Name</label>
                <select 
                  value={gameType} 
                  onChange={(e) => setGameType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                >
                  <option value="Premium 5/90">Premium 5/90</option>
                  <option value="Midweek Special">Midweek Special</option>
                  <option value="Monday Special">Monday Special</option>
                  <option value="Fortune Thursday">Fortune Thursday</option>
                  <option value="National Weekly">National Weekly</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Closing Time & Date</label>
                <input 
                  type="text" 
                  placeholder="e.g., Today, 6:00 PM or Oct 2, 5:00 PM"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black shadow-lg shadow-yellow-500/20 hover:opacity-90 transition cursor-pointer"
                >
                  Publish Draw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}