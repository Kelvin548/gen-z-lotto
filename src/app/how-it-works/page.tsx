// src/app/how-it-works/page.tsx
import React from 'react';
import PublicShell from '@/components/PublicShell';

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-bold text-yellow-400 mb-6 uppercase">
          Platform Guide
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-6">How Gen Z Lotto Works</h1>
        <p className="text-zinc-300 text-base leading-relaxed">
          Gen Z Lotto is a secure digital 5/90 lottery platform. Players select numbers from 1 to 90 across various game formats (Direct 1 through Direct 5, Perms, and Banker) and stake using their digital wallets.
        </p>
      </div>
    </PublicShell>
  );
}