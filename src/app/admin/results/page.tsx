// src/app/admin/results/page.tsx
'use client';

import { useState, useEffect } from 'react';

const drawsList = [
  'NLA VAG Monday', 'Moon Rush Monday', 'Monday Special',
  'NLA VAG Tuesday', 'Moon Rush Tuesday', 'Lucky Tuesday',
  'NLA VAG Wednesday', 'Moon Rush Wednesday', 'Midweek',
  'NLA VAG Thursday', 'Moon Rush Thursday', 'Fortune Thursday',
  'NLA VAG Friday', 'Moon Rush Friday', 'Friday Bonanza',
  'NLA VAG Saturday', 'Moon Rush Saturday', 'National', 'Aseda Sunday'
];

export default function AdminResultsPage() {
  const [selectedDraw, setSelectedDraw] = useState(drawsList[0]);
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0]);
  const [winningNumbers, setWinningNumbers] = useState<string[]>(['', '', '', '', '']);
  const [machineNumbers, setMachineNumbers] = useState<string[]>(['', '', '', '', '']);
  const [publishedResults, setPublishedResults] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_published_results');
    if (saved) {
      setPublishedResults(JSON.parse(saved));
    }
  }, []);

  const saveAndSync = (updated: any[]) => {
    setPublishedResults(updated);
    localStorage.setItem('admin_published_results', JSON.stringify(updated));
  };

  const handleWinNumChange = (index: number, val: string) => {
    const updated = [...winningNumbers];
    updated[index] = val;
    setWinningNumbers(updated);
  };

  const handleMachNumChange = (index: number, val: string) => {
    const updated = [...machineNumbers];
    updated[index] = val;
    setMachineNumbers(updated);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (winningNumbers.some(num => !num)) {
      alert('Please fill in all 5 winning numbers.');
      return;
    }

    const formattedWinning = winningNumbers.map(n => n.padStart(2, '0'));
    const formattedMachine = machineNumbers.map(n => n ? n.padStart(2, '0') : '--');

    let updatedList;
    if (editingId) {
      // Edit existing result
      updatedList = publishedResults.map(res => 
        res.id === editingId 
          ? { ...res, drawName: selectedDraw, date: drawDate, winningNumbers: formattedWinning, machineNumbers: formattedMachine }
          : res
      );
      alert(`Winning numbers successfully updated for ${selectedDraw}!`);
      setEditingId(null);
    } else {
      // Create new result
      const newResult = {
        id: `RES-${Date.now()}`,
        drawName: selectedDraw,
        date: drawDate,
        winningNumbers: formattedWinning,
        machineNumbers: formattedMachine,
      };
      updatedList = [newResult, ...publishedResults];
      alert(`Winning numbers successfully published for ${selectedDraw}!`);
    }

    saveAndSync(updatedList);
    setWinningNumbers(['', '', '', '', '']);
    setMachineNumbers(['', '', '', '', '']);
  };

  const handleEdit = (res: any) => {
    setEditingId(res.id);
    setSelectedDraw(res.drawName);
    setDrawDate(res.date);
    setWinningNumbers(res.winningNumbers);
    setMachineNumbers(res.machineNumbers.map((m: string) => m === '--' ? '' : m));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this result? It will be removed from the customer portal.')) {
      const updated = publishedResults.filter(res => res.id !== id);
      saveAndSync(updated);
    }
  };

  return (
    <div className="space-y-8 relative z-10 p-6 max-w-5xl mx-auto text-white">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-1">Admin Results Management</h2>
        <p className="text-xs text-zinc-400">Publish, edit, or delete winning and machine numbers for customer viewing.</p>
      </div>

      <form onSubmit={handlePublish} className="bg-zinc-950/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h3 className="text-base font-bold text-amber-400">
            {editingId ? 'Edit Published Result' : 'Publish New Draw Result'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setWinningNumbers(['', '', '', '', '']);
                setMachineNumbers(['', '', '', '', '']);
              }}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400">Select Draw Name</label>
            <select
              value={selectedDraw}
              onChange={(e) => setSelectedDraw(e.target.value)}
              className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 p-3.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {drawsList.map((draw) => (
                <option key={draw} value={draw}>{draw}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400">Draw Date</label>
            <input
              type="date"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 p-3.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-400">Winning Numbers (5 Numbers)</label>
          <div className="grid grid-cols-5 gap-3">
            {winningNumbers.map((num, idx) => (
              <input
                key={idx}
                type="number"
                min="1"
                max="90"
                placeholder={`#${idx + 1}`}
                value={num}
                onChange={(e) => handleWinNumChange(idx, e.target.value)}
                className="h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-lg font-black text-amber-400 focus:outline-none focus:border-amber-400"
                required
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Machine Numbers (Optional / 5 Numbers)</label>
          <div className="grid grid-cols-5 gap-3">
            {machineNumbers.map((num, idx) => (
              <input
                key={idx}
                type="number"
                min="1"
                max="90"
                placeholder={`M${idx + 1}`}
                value={num}
                onChange={(e) => handleMachNumChange(idx, e.target.value)}
                className="h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-lg font-bold text-zinc-300 focus:outline-none focus:border-amber-400"
              />
            ))}
          </div>
        </div>

        <button
          type="init"
          type-submit="true"
          type="submit"
          className="w-full py-4 rounded-2xl bg-amber-400 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition shadow-lg shadow-amber-400/25 cursor-pointer"
        >
          {editingId ? 'Update Published Result' : 'Publish Results to Customer Dashboard'}
        </button>
      </form>

      {/* Published Results Management History */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-black text-white">Published Results History</h3>
        {publishedResults.length === 0 ? (
          <div className="text-center py-10 bg-zinc-950/60 border border-zinc-800 rounded-3xl text-zinc-500 text-xs">
            No results published yet.
          </div>
        ) : (
          publishedResults.map((res) => (
            <div key={res.id} className="bg-zinc-950/85 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-amber-400">{res.drawName}</span>
                  <span className="text-xs text-zinc-400">({res.date})</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-zinc-500 font-bold">Win:</span>
                  {res.winningNumbers.map((n: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">{n}</span>
                  ))}
                  <span className="text-zinc-500 font-bold ml-2">Mach:</span>
                  {res.machineNumbers.map((m: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">{m}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(res)}
                  className="px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/25 transition cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(res.id)}
                  className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/25 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}