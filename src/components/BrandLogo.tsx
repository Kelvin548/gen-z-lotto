// src/components/BrandLogo.tsx
import React from 'react';
import Link from 'next/link';

export default function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-card border border-yellow-500/30 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:border-yellow-500 transition">
        {/* Using a standard img tag to ensure 100% reliable local asset loading */}
        <img 
          src="/logo.png" 
          alt="Gen Z Lotto Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      <span className="font-black tracking-wider text-xl gold-gradient-text">GEN Z LOTTO</span>
    </Link>
  );
}