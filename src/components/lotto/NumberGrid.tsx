'use client';

import React from 'react';

interface NumberGridProps {
  selectedNumbers?: number[];
  onToggleNumber: (num: number) => void;
  onClear: () => void;
  onQuickPick: (count?: number) => void;
  maxSelection?: number;
}

export default function NumberGrid({
  selectedNumbers = [],
  onToggleNumber,
  onClear,
  onQuickPick,
  maxSelection = 5,
}: NumberGridProps) {
  const numbers = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">
          Select Numbers ({selectedNumbers.length}/{maxSelection})
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onQuickPick(maxSelection)}
            className="rounded bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
          >
            ⚡ Quick Pick
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded bg-zinc-950 px-3 py-1 text-xs font-medium text-zinc-400 border border-zinc-800 hover:text-white transition"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          return (
            <button
              key={num}
              type="button"
              onClick={() => onToggleNumber(num)}
              className={`flex h-10 w-full items-center justify-center rounded-lg text-sm font-bold transition-all touch-manipulation active:scale-95 border ${
                isSelected
                  ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {num.toString().padStart(2, '0')}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500">
        * Note: Quick pick uses client UI simulation for preview. Final randomness is governed server-side upon ticket submission.
      </p>
    </div>
  );
}