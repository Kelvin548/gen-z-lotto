// src/components/FloatingBubbles.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface Bubble {
  id: number;
  number: number;
  size: number;
  left: number; // percentage
  duration: number; // seconds
  delay: number; // seconds
}

export default function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const generated: Bubble[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      number: Math.floor(Math.random() * 90) + 1, // 1 to 90 lottery numbers
      size: Math.floor(Math.random() * 35) + 45, // 45px to 80px for a prominent look
      left: Math.random() * 92 + 4, // 4% to 96% width
      duration: Math.random() * 7 + 6, // 7s to 13s float duration
      delay: Math.random() * 6, // 0s to 6s stagger delay
    }));
    setBubbles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full flex items-center justify-center font-bold text-xs select-none bubble-3d"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            bottom: `-90px`,
            animation: `floatUp ${b.duration}s ease-in-out infinite, wobble ${b.duration / 3}s ease-in-out infinite alternate`,
            animationDelay: `${b.delay}s, ${b.delay}s`,
          }}
        >
          {/* 3D Water Bubble Inner Refraction & Glossy Highlights */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-500/10 via-white/5 to-yellow-200/30 backdrop-blur-[2px] shadow-[inset_0_0_15px_rgba(255,215,0,0.3),inset_0_4px_6px_rgba(255,255,255,0.6),0_8px_20px_rgba(0,0,0,0.4)] border border-yellow-300/40"></div>
          
          {/* Top Specular Light Reflection (gives the wet 3D look) */}
          <div className="absolute top-[15%] left-[20%] w-[30%] h-[20%] bg-white/70 rounded-full blur-[1px] transform -rotate-45 pointer-events-none"></div>
          
          {/* Bottom Secondary Reflected Light */}
          <div className="absolute bottom-[15%] right-[25%] w-[20%] h-[12%] bg-yellow-300/40 rounded-full blur-[1px] pointer-events-none"></div>

          {/* Lottery Number inside the Bubble */}
          <span className="relative z-10 text-yellow-300 font-extrabold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {b.number}
          </span>
        </div>
      ))}

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.85);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-112vh) scale(1.15);
            opacity: 0;
          }
        }

        @keyframes wobble {
          0% {
            margin-left: -10px;
          }
          100% {
            margin-left: 10px;
          }
        }
      `}</style>
    </div>
  );
}