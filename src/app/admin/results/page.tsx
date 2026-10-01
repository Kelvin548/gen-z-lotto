// src/app/admin/results/page.tsx
'use client';

// Admin results control panel active
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
      try {
        const parsed = JSON.parse(saved);
        setPublishedResults(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error(e);
      }
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
      updatedList = publishedResults.map(res => 
        res.id === editingId 
          ? { ...res, drawName: selectedDraw, date: drawDate, winningNumbers: formattedWinning, machineNumbers: formattedMachine }
          : res
      );
      alert(`Winning numbers successfully updated for ${selectedDraw}!`);
      setEditingId(null);
    } else {
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
      
      {/* Header */}
      <div className="border-b border-yellow-500/20 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-extrabold tracking-widest uppercase mb-2">
          <span>⚙️</span> Admin Control Panel
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Publish & Manage Results</h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">Input official daily winning numbers and machine ball drops for customer viewing.</p>
      </div>

      {/* Input / Publish Form */}
      <form onSubmit={handlePublish} className="bg-zinc-950/90 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 relative z-10">
          <h3 className="text-base font-black text-yellow-400 tracking-wide">
            {editingId ? '✏️ Edit Published Result' : '➕ Publish New Draw Result'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setWinningNumbers(['', '', '', '', '']);
                setMachineNumbers(['', '', '', '', '']);
              }}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer font-bold underline"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Dropdown selectors for Draw Name & Date Picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-yellow-400">Select Draw Name</label>
            <div className="relative">
              <select
                value={selectedDraw}
                onChange={(e) => setSelectedDraw(e.target.value)}
                className="w-full rounded-2xl bg-zinc-900 border border-yellow-500/20 p-4 text-sm font-bold text-white focus:outline-none focus:border-yellow-400 cursor-pointer appearance-none shadow-inner"
              >
                {drawsList.map((draw) => (
                  <option key={draw} value={draw} className="bg-zinc-900 text-white">{draw}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-yellow-400">
                ▼
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-widest text-yellow-400">Draw Date</label>
            <div className="relative">
              <input
                type="date"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                className="w-full rounded-2xl bg-zinc-900 border border-yellow-500/20 p-4 text-sm font-bold text-white focus:outline-none focus:border-yellow-400 cursor-pointer shadow-inner uppercase tracking-wider"
              />
            </div>
          </div>
        </div>

        {/* Winning Numbers Input Matrix */}
        <div className="space-y-3 relative z-10">
          <label className="text-xs font-extrabold uppercase tracking-widest text-yellow-400 flex items-center gap-1.5">
            <span>⚡</span> Winning Numbers (5 Numbers Required)
          </label>
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
                className="h-16 rounded-2xl bg-zinc-900 border border-yellow-500/30 text-center text-xl font-black text-yellow-400 focus:outline-none focus:border-yellow-400 shadow-inner"
                required
              />
            ))}
          </div>
        </div>

        {/* Machine Numbers Input Matrix */}
        <div className="space-y-3 relative z-10 pt-2 border-t border-zinc-900">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <span>⚙️</span> Machine Numbers (Optional / 5 Balls)
          </label>
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
                className="h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-center text-base font-bold text-zinc-300 focus:outline-none focus:border-yellow-400 shadow-inner"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-yellow-500/20 cursor-pointer"
        >
          {editingId ? 'Update Published Result' : 'Publish Results to Customer Dashboard →'}
        </button>
      </form>

      {/* Published History & Management Grid */}
      <div className="space-y-6 pt-4">
        <h3 className="text-xl font-black text-white">Manage Existing Published Results</h3>
        {publishedResults.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950/50 border border-zinc-800 rounded-3xl text-zinc-500 text-xs">
            No results published yet. Use the form above to add your first draw result.
          </div>
        ) : (
          <div className="space-y-4">
            {publishedResults.map((res) => (
              <div key={res.id} className="bg-zinc-950/85 border border-yellow-500/20 hover:border-yellow-500/40 transition rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-white">{res.drawName}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-bold">{res.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs items-center">
                    <span className="text-zinc-500 font-extrabold uppercase text-[10px]">Win:</span>
                    {res.winningNumbers.map((n: string, i: number) => (
                      <span key={i} className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 to-yellow-500 text-black font-black text-xs flex items-center justify-center shadow">
                        {n}
                      </span>
                    ))}
                    <span className="text-zinc-500 font-extrabold uppercase text-[10px] ml-3">Mach:</span>
                    {res.machineNumbers.map((m: string, i: number) => (
                      <span key={i} className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleEdit(res)}
                    className="px-5 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold hover:bg-yellow-500 hover:text-black transition cursor-pointer shadow"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition cursor-pointer shadow"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// Updated at 10/01/2026 18:18:20
