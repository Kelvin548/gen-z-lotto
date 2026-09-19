// src/app/customer/account/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

export default function CustomerAccountPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const activeUser = localStorage.getItem('active_username') || 'Customer User';
    const savedPhone = localStorage.getItem('user_phone_number') || '+233 24 000 0000';
    const savedName = localStorage.getItem('user_full_name') || activeUser;
    
    setPhoneNumber(savedPhone);
    setFullName(savedName);
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 5) {
      alert('Please enter a valid phone number.');
      return;
    }

    localStorage.setItem('user_phone_number', phoneNumber);
    localStorage.setItem('user_full_name', fullName);
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="px-6 py-8 space-y-8 max-w-4xl relative z-10">
      <div>
        <h1 className="text-3xl font-black text-white">Account Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your profile information and security credentials.</p>
      </div>

      <form onSubmit={handleSavePreferences} className="p-8 rounded-3xl bg-zinc-950/80 border border-yellow-500/15 space-y-6 backdrop-blur-xl">
        
        {isSaved && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            ✓ Account preferences updated successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold uppercase text-zinc-400 block mb-2">Display Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name..."
              className="w-full bg-zinc-900 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-yellow-400 transition" 
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-zinc-400 block mb-2">Phone Number</label>
            <input 
              type="text" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number..."
              className="w-full bg-zinc-900 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-yellow-400 transition" 
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-zinc-400 block mb-2">Verification Status</label>
            <input 
              type="text" 
              disabled 
              value="Verified (Demo Sandbox)" 
              className="w-full bg-zinc-900/50 border border-yellow-500/10 rounded-xl px-4 py-3 text-sm text-emerald-400 font-bold cursor-not-allowed" 
            />
          </div>
        </div>

        <div className="pt-4 border-t border-yellow-500/10 flex justify-end">
          <button 
            type="submit" 
            className="px-6 py-3 rounded-xl bg-yellow-500 text-black text-xs font-black uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-yellow-500/20"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}