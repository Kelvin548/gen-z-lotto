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

const defaultDrawsList: Draw[] = [
  { id: '#DRW-2026-901', gameType: 'NLA VAG Monday', status: 'Active', closingTime: 'Monday, 9:30 AM' },
  { id: '#DRW-2026-902', gameType: 'Moon Rush Monday', status: 'Active', closingTime: 'Monday, 1:00 PM' },
  { id: '#DRW-2026-903', gameType: 'Monday Special', status: 'Active', closingTime: 'Monday, 7:30 PM' },
  { id: '#DRW-2026-904', gameType: 'NLA VAG Tuesday', status: 'Active', closingTime: 'Tuesday, 9:30 AM' },
  { id: '#DRW-2026-905', gameType: 'Moon Rush Tuesday', status: 'Active', closingTime: 'Tuesday, 1:00 PM' },
  { id: '#DRW-2026-906', gameType: 'Lucky Tuesday', status: 'Active', closingTime: 'Tuesday, 7:30 PM' },
  { id: '#DRW-2026-907', gameType: 'NLA VAG Wednesday', status: 'Active', closingTime: 'Wednesday, 9:30 AM' },
  { id: '#DRW-2026-908', gameType: 'Moon Rush Wednesday', status: 'Active', closingTime: 'Wednesday, 1:00 PM' },
  { id: '#DRW-2026-909', gameType: 'Midweek', status: 'Active', closingTime: 'Wednesday, 7:30 PM' },
  { id: '#DRW-2026-910', gameType: 'NLA VAG Thursday', status: 'Active', closingTime: 'Thursday, 9:30 AM' },
  { id: '#DRW-2026-911', gameType: 'Moon Rush Thursday', status: 'Active', closingTime: 'Thursday, 1:00 PM' },
  { id: '#DRW-2026-912', gameType: 'Fortune Thursday', status: 'Active', closingTime: 'Thursday, 7:30 PM' },
  { id: '#DRW-2026-913', gameType: 'NLA VAG Friday', status: 'Active', closingTime: 'Friday, 9:30 AM' },
  { id: '#DRW-2026-914', gameType: 'Moon Rush Friday', status: 'Active', closingTime: 'Friday, 1:00 PM' },
  { id: '#DRW-2026-915', gameType: 'Friday Bonanza', status: 'Active', closingTime: 'Friday, 7:30 PM' },
  { id: '#DRW-2026-916', gameType: 'NLA VAG Saturday', status: 'Active', closingTime: 'Saturday, 9:30 AM' },
  { id: '#DRW-2026-917', gameType: 'Moon Rush Saturday', status: 'Active', closingTime: 'Saturday, 1:00 PM' },
  { id: '#DRW-2026-918', gameType: 'National', status: 'Active', closingTime: 'Saturday, 7:30 PM' },
  { id: '#DRW-2026-919', gameType: 'Aseda Sunday', status: 'Active', closingTime: 'Sunday, 5:30 PM' }
];

export default function AdminDrawsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrawId, setEditingDrawId] = useState<string | null>(null);
  const [gameType, setGameType] = useState('NLA VAG Monday');
  const [status, setStatus] = useState<'Active' | 'Scheduled' | 'Closed'>('Active');
  const [closingTime, setClosingTime] = useState('');
  
  const [draws, setDraws] = useState<Draw[]>(defaultDrawsList);

  // Load saved draws from localStorage on mount or initialize default full list
  useEffect(() => {
    const savedDraws = localStorage.getItem('gen_z_lotto_admin_draws');
    if (savedDraws) {
      try {
        const parsed = JSON.parse(savedDraws);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDraws(parsed);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Default initialization if storage is empty
    saveAndSyncDraws(defaultDrawsList);
  }, []);

  const saveAndSyncDraws = (updatedDraws: Draw[]) => {
    setDraws(updatedDraws);
    localStorage.setItem('gen_z_lotto_admin_draws', JSON.stringify(updatedDraws));
    localStorage.setItem('gen_z_lotto_active_draws', JSON.stringify(updatedDraws));
  };

  const handleOpenCreateModal = () => {
    setEditingDrawId(null);
    setGameType('NLA VAG Monday');
    setStatus('Active');
    setClosingTime('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (draw: Draw) => {
    setEditingDrawId(draw.id);
    setGameType(draw.gameType);
    setStatus(draw.status);
    setClosingTime(draw.closingTime);
    setIsModalOpen(true);
  };

  const handleDeleteDraw = (id: string) => {
    if (confirm('Are you sure you want to delete this draw? It will instantly disappear for customers.')) {
      const updated = draws.filter(d => d.id !== id);
      saveAndSyncDraws(updated);
    }
  };

  const handleSaveDraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingTime) return;

    let updated: Draw[];
    if (editingDrawId) {
      updated = draws.map(d => d.id === editingDrawId ? { ...d, gameType, status, closingTime } : d);
    } else {
      const newDraw: Draw = {
        id: `#DRW-${Math.floor(1000 + Math.random() * 9000)}`,
        gameType,
        status,
        closingTime,
      };
      updated = [newDraw, ...draws];
    }

    saveAndSyncDraws(updated);
    setIsModalOpen(false);
    setEditingDrawId(null);
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
          <p className="text-zinc-400 text-sm mt-1">Schedule, edit, or delete 5/90 lottery draws instantly synced with the customer portal.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-yellow-500/20 hover:opacity-90 transition cursor-pointer"
        >
          + Create New Draw
        </button>
      </div>

      {/* Draws Table Card */}
      <div className="bg-zinc-950/85 backdrop-blur-xl p-6 rounded-3xl border border-yellow-500/25 shadow-2xl space-y-4 relative z-10">
        <h3 className="text-lg font-bold text-yellow-400">Active & Upcoming Draws</h3>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 text-zinc-400 uppercase sticky top-0 bg-zinc-950">
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
                  <td className="py-4 px-4 font-black">{draw.gameType}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded border ${
                      draw.status === 'Active' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : draw.status === 'Scheduled'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {draw.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">{draw.closingTime}</td>
                  <td className="py-4 px-4 text-right space-x-3">
                    <button 
                      onClick={() => handleOpenEditModal(draw)}
                      className="text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteDraw(draw.id)}
                      className="text-red-400 hover:underline font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Draw Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-yellow-500/30 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-yellow-400">
                {editingDrawId ? 'Edit 5/90 Draw' : 'Schedule New 5/90 Draw'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDraw} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Game Type / Draw Name</label>
                <input 
                  type="text"
                  placeholder="e.g., Monday Special"
                  value={gameType} 
                  onChange={(e) => setGameType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Status</label>
                <select 
                  value={status} 
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500/50"
                >
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">Closing Time & Date</label>
                <input 
                  type="text" 
                  placeholder="e.g., Today, 6:00 PM or Monday, 7:30 PM"
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
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black shadow-lg shadow-yellow-500/20 hover:opacity-90 transition cursor-pointer"
                >
                  {editingDrawId ? 'Save Changes' : 'Publish Draw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}