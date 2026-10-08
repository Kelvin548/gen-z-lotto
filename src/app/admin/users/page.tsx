'use client';

import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/users');
        const data = await res.json();
        
        if (data.success && Array.isArray(data.users)) {
          // Map database user fields to match your UI components
          const formattedUsers = data.users.map((u: any) => ({
            id: `#USR-${u.id ? u.id.toString().slice(-4) : '0000'}`,
            rawId: u.id,
            name: u.name || u.email?.split('@')[0] || 'User',
            email: u.email,
            phone: u.phone || 'N/A',
            walletBalance: u.walletBalance ?? u.balance ?? 0.00,
            status: u.status || 'Active',
            joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recently'
          }));
          setUsers(formattedUsers);
        }
      } catch (e) {
        console.error('Failed to load users from API:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 relative z-10 max-w-7xl mx-auto p-6 text-white">
      {/* Header */}
      <div className="border-b border-yellow-500/20 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-extrabold tracking-widest uppercase mb-2">
            <span>👥</span> User Directory
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">User Management</h2>
          <p className="text-xs text-zinc-400 mt-1">View registered player accounts, monitor wallet balances, and manage account statuses.</p>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search user by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl bg-zinc-900 border border-yellow-500/20 px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-yellow-400 shadow-inner"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-950/90 border border-yellow-500/30 rounded-3xl p-6 shadow-2xl overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-yellow-400">Registered Players</h3>
          <span className="text-xs font-bold text-zinc-400">Total Users: <strong className="text-white">{filteredUsers.length}</strong></span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-xs font-bold">Loading registered users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs font-bold">No registered users found.</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-yellow-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-4">User ID / Name</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Wallet Balance</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredUsers.map((u) => (
                <tr key={u.rawId || u.id} className="hover:bg-zinc-900/40 transition">
                  <td className="py-4 px-4 font-bold text-white">
                    <span className="font-mono text-yellow-400 mr-2">{u.id}</span> — {u.name}
                  </td>
                  <td className="py-4 px-4 text-zinc-300">{u.email}</td>
                  <td className="py-4 px-4 font-black text-amber-400">GH₵ {Number(u.walletBalance || 0).toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 font-bold text-[10px]">
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleViewDetails(u)}
                      className="text-yellow-400 hover:text-yellow-300 font-bold underline cursor-pointer transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-yellow-500/35 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-yellow-400 uppercase tracking-widest bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/30">Player Account</span>
                <h3 className="text-xl font-black text-white mt-2">{selectedUser.name}</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 uppercase block font-semibold">User ID</span>
                <span className="font-mono text-yellow-400 font-bold text-sm">{selectedUser.id}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block font-semibold">Account Status</span>
                <span className="text-green-400 font-bold">{selectedUser.status || 'Active'}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block font-semibold">Email Address</span>
                <span className="text-white font-medium">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block font-semibold">Phone Contact</span>
                <span className="text-white font-medium">{selectedUser.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block font-semibold">Wallet Balance</span>
                <span className="text-amber-400 font-black text-sm">GH₵ {Number(selectedUser.walletBalance || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase block font-semibold">Member Since</span>
                <span className="text-white font-medium">{selectedUser.joinedDate || 'Recently'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}