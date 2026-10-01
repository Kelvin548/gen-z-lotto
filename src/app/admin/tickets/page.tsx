'use client';

export default function AdminTicketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-1">All Platform Tickets</h1>
        <p className="text-xs text-zinc-400">Monitor all user ticket entries, stakes, and win statuses across the platform.</p>
      </div>

      <div className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 text-xs">
        No ticket logs found or system is synced with live database entries.
      </div>
    </div>
  );
}