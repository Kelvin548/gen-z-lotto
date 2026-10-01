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

  useEffect(() => {
    const saved = localStorage.getItem('admin_published_results');
    if (saved) {
      setPublishedResults(JSON.parse(saved));
    }
  }, []);

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

    const newResult = {
      id: `RES-${Date.now()}`,
      drawName: selectedDraw,
      date: drawDate,
      winningNumbers: winningNumbers.map(n => n.padStart(2, '0')),
      machineNumbers: machineNumbers.map(n => n ? n.padStart(2, '0') : '--'),
    };

    const updatedList = [newResult, ...publishedResults];
    setPublishedResults(updatedList);
    localStorage.setItem('admin_published_results', JSON.stringify(updatedList));

    alert(`Winning numbers successfully published for ${selectedDraw}!`);
    setWinningNumbers(['', '', '', '', '']);
    setMachineNumbers(['', '', '', '', '']);
  };

  return (
    <div className="space-y-8 relative z-10 p-6 max-w-5xl mx-auto text-white">
      <div>
        <h2 className="text-3xl font-black tracking-tight mb-1">Admin Results Management</h2>
        <p className="text-xs text-zinc-400">Publish winning and machine numbers for draws to display on the customer results page.</p>
      </div>

      <form onSubmit={handlePublish} className="bg-zinc-950/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400">Select Draw Name</label>
            <select
              value={selectedDraw}
              onChange={(e) => setSelectedDraw(e.target.value)}
              className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 p-3.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
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
          type="submit"
          className="w-full py-4 rounded-2xl bg-amber-400 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition shadow-lg shadow-amber-400/20"
        >
          Publish Results to Customer Dashboard
        </button>
      </form>
    </div>
  );
}