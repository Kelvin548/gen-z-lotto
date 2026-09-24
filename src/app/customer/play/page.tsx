'use client';

import { useState } from 'main'; // keeping standard imports
import { useState as useReactState } from 'react';

// Helper to calculate combinations (n choose r) for Perm games
function calculateCombinations(n: number, r: number): number {
  if (n < r) return 0;
  let numerator = 1;
  let denominator = 1;
  for (let i = 0; i < r; i++) {
    numerator *= (n - i);
    denominator *= (i + 1);
  }
  return numerator / denominator;
}

const drawsList = [
  { name: 'NLA VAG Monday', closingTime: '9:30 AM' },
  { name: 'Moon Rush Monday', closingTime: '1:00 PM' },
  { name: 'Monday Special', closingTime: '7:30 PM' },
  { name: 'NLA VAG Tuesday', closingTime: '9:30 AM' },
  { name: 'Moon Rush Tuesday', closingTime: '1:00 PM' },
  { name: 'Lucky Tuesday', closingTime: '7:30 PM' },
  { name: 'NLA VAG Wednesday', closingTime: '9:30 AM' },
  { name: 'Moon Rush Wednesday', closingTime: '1:00 PM' },
  { name: 'Midweek', closingTime: '7:30 PM' },
  { name: 'NLA VAG Thursday', closingTime: '9:30 AM' },
  { name: 'Moon Rush Thursday', closingTime: '1:00 PM' },
  { name: 'Fortune Thursday', closingTime: '7:30 PM' },
  { name: 'NLA VAG Friday', closingTime: '9:30 AM' },
  { name: 'Moon Rush Friday', closingTime: '1:00 PM' },
  { name: 'Friday Bonanza', closingTime: '7:30 PM' },
  { name: 'NLA VAG Saturday', closingTime: '9:30 AM' },
  { name: 'Moon Rush Saturday', closingTime: '1:00 PM' },
  { name: 'National', closingTime: '7:30 PM' },
  { name: 'Aseda Sunday', closingTime: '5:30 PM' }
];

export default function PlayArenaPage() {
  const [selectedGameType, setSelectedGameType] = useState('Perm 2');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [stakePerLine, setStakePerLine] = useState<number>(5);
  const [customStakeInput, setCustomStakeInput] = useState<string>('5');
  const [selectedDraw, setSelectedDraw] = useState('NLA VAG Thursday');
  const [closingTime, setClosingTime] = useState('9:30 AM');

  // Booking Code Search States
  const [searchBookingCode, setSearchBookingCode] = useState('');
  const [searchedTicketResult, setSearchedTicketResult] = useState<any>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Payment Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [momoNumber, setMomoNumber] = useState('');
  const [momoProvider, setMomoProvider] = useState('MTN');
  const [isProcessing, setIsProcessing] = useState(false);

  const gameTypes = [
    'Direct 1', 'Direct 2', 'Direct 3', 'Direct 4',
    'Direct 5', 'Perm 2', 'Perm 3', 'Banker'
  ];

  const stakeOptions = [1, 2, 5, 10];

  const handleDrawChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const drawName = e.target.value;
    setSelectedDraw(drawName);
    const found = drawsList.find(d => d.name === drawName);
    if (found) {
      setClosingTime(found.closingTime);
    }
  };

  // Helper to get max allowed numbers based on game type
  const getMaxNumbers = (type: string) => {
    switch (type) {
      case 'Direct 1': return 1;
      case 'Direct 2': return 2;
      case 'Direct 3': return 3;
      case 'Direct 4': return 4;
      case 'Direct 5': return 5;
      case 'Perm 2':
      case 'Perm 3': return 25; 
      case 'Banker': return 1;  
      default: return 10;
    }
  };

  const getRequiredSelectionSize = (type: string) => {
    switch (type) {
      case 'Perm 2': return 2;
      case 'Perm 3': return 3;
      default: return 1;
    }
  };

  const calculateTotalLines = () => {
    if (selectedGameType.startsWith('Perm')) {
      const r = getRequiredSelectionSize(selectedGameType);
      return calculateCombinations(selectedNumbers.length, r);
    }
    const required = getMaxNumbers(selectedGameType);
    return selectedNumbers.length === required ? 1 : 0;
  };

  const totalLines = calculateTotalLines();
  const totalStake = selectedGameType === 'Banker' ? 89.00 : totalLines * stakePerLine;

  const getPotentialWins = () => {
    if (selectedGameType === 'Banker') {
      if (selectedNumbers.length !== 1) return { minWin: 0, maxWin: 0 };
      return { minWin: 880.00, maxWin: 880.00 };
    }

    if (totalLines <= 0) return { minWin: 0, maxWin: 0 };

    let baseMultiplier = 240;
    if (selectedGameType === 'Direct 1') baseMultiplier = 10;
    if (selectedGameType === 'Direct 2') baseMultiplier = 240;
    if (selectedGameType === 'Direct 3' || selectedGameType === 'Perm 3') baseMultiplier = 2100;
    if (selectedGameType === 'Direct 4') baseMultiplier = 6000;
    if (selectedGameType === 'Direct 5') baseMultiplier = 44000;
    if (selectedGameType === 'Perm 2') baseMultiplier = 240;

    const minWin = stakePerLine * baseMultiplier;
    const maxWin = selectedGameType.startsWith('Perm') ? totalLines * stakePerLine * baseMultiplier : minWin;
    return { minWin, maxWin };
  };

  const { minWin, maxWin } = getPotentialWins();

  const handleGameTypeChange = (type: string) => {
    setSelectedGameType(type);
    setSelectedNumbers([]); 
    if (type === 'Banker') {
      setStakePerLine(89);
      setCustomStakeInput('89');
    }
  };

  const toggleNumber = (num: number) => {
    const maxAllowed = getMaxNumbers(selectedGameType);
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (maxAllowed === 1) {
        setSelectedNumbers([num]);
      } else if (selectedNumbers.length < maxAllowed) {
        setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
      } else {
        alert(`${selectedGameType} allows a maximum of ${maxAllowed} number(s).`);
      }
    }
  };

  const handlePresetSelect = (amount: number) => {
    if (selectedGameType === 'Banker') return;
    setStakePerLine(amount);
    setCustomStakeInput(amount.toString());
  };

  const handleCustomStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedGameType === 'Banker') return;
    const val = e.target.value;
    setCustomStakeInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setStakePerLine(parsed);
    } else {
      setStakePerLine(0);
    }
  };

  const handleSearchBookingCode = () => {
    if (!searchBookingCode.trim()) {
      alert('Please enter a booking code to search.');
      return;
    }
    const allTickets = JSON.parse(localStorage.getItem('admin_all_tickets') || '[]');
    const found = allTickets.find((t: any) => t.bookingCode === searchBookingCode.trim() || t.id === searchBookingCode.trim());
    if (found) {
      setSearchedTicketResult(found);
      setIsSearchModalOpen(true);
    } else {
      alert('Booking code not found in active records.');
    }
  };

  const handleOpenPaymentModal = () => {
    if (selectedGameType.startsWith('Direct') || selectedGameType === 'Banker') {
      const requiredCount = getMaxNumbers(selectedGameType);
      if (selectedNumbers.length !== requiredCount) {
        alert(`${selectedGameType} requires exactly ${requiredCount} number(s). You have selected ${selectedNumbers.length}.`);
        return;
      }
    } else if (selectedGameType === 'Perm 2' && selectedNumbers.length < 2) {
      alert('Perm 2 requires at least 2 numbers selected.');
      return;
    } else if (selectedGameType === 'Perm 3' && selectedNumbers.length < 3) {
      alert('Perm 3 requires at least 3 numbers selected.');
      return;
    }

    if (selectedGameType !== 'Banker' && totalLines <= 0) {
      alert('Invalid selection for this game type.');
      return;
    }
    if (totalStake <= 0) {
      alert('Please enter a valid stake amount.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleProcessMomoPayment = async () => {
    if (!momoNumber || momoNumber.length < 10) {
      alert('Please enter a valid mobile money number.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);

      const currentUser = localStorage.getItem('active_username') || 'customer_user';
      const storageKey = `user_tickets_${currentUser}`;
      const bookingCode = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

      const newTicket = {
        id: `#TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        bookingCode: bookingCode,
        username: currentUser,
        gameType: selectedGameType,
        gameName: selectedDraw,
        numbers: selectedNumbers,
        stakePerLine: selectedGameType === 'Banker' ? 89 : stakePerLine,
        lines: selectedGameType === 'Banker' ? 1 : totalLines,
        total: totalStake,
        minWin: minWin,
        maxWin: maxWin,
        date: new Date().toLocaleDateString(),
        closingTime: closingTime,
        status: 'Active',
        paymentMethod: `${momoProvider} Momo (${momoNumber})`
      };

      const existingTickets = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([newTicket, ...existingTickets]));

      const masterLedger = JSON.parse(localStorage.getItem('admin_all_tickets') || '[]');
      localStorage.setItem('admin_all_tickets', JSON.stringify([newTicket, ...masterLedger]));

      alert(`Payment successful! Your Booking Code is: ${bookingCode}`);
      window.location.href = '/customer/tickets';
    }, 2500);
  };

  return (
    <div className="space-y-6 relative z-10">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white mb-1">5/90 Play Arena</h2>
        <p className="text-xs text-zinc-400">Select your draw, game type, and numbers to lock in your stake.</p>
      </div>

      {/* Booking Code Quick Search Banner */}
      <div className="bg-zinc-950/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">🔑</span>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Have a Booking Code?</h4>
            <p className="text-[11px] text-zinc-400">Paste your code below to instantly load and review a stake.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="e.g. BK-482910"
            value={searchBookingCode}
            onChange={(e) => setSearchBookingCode(e.target.value)}
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400 w-full sm:w-48"
          />
          <button
            onClick={handleSearchBookingCode}
            className="rounded-xl bg-amber-400 px-5 py-2.5 text-black text-xs font-black uppercase tracking-wider hover:bg-amber-300 transition shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              1. Select Active Draw
            </h3>
            <select 
              value={selectedDraw} 
              onChange={handleDrawChange}
              className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-white text-sm font-semibold focus:outline-none focus:border-amber-400 transition-all"
            >
              {drawsList.map((draw) => (
                <option key={draw.name} value={draw.name}>
                  {draw.name} — Closes at {draw.closingTime}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              2. Select Game Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gameTypes.map((type) => {
                const isSelected = selectedGameType === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleGameTypeChange(type)}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                      isSelected
                        ? 'bg-amber-400 border-amber-400 text-black shadow-lg shadow-amber-400/20 scale-[1.02]'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-amber-500/40 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                3. Select Numbers (1 to 90) — Max: {getMaxNumbers(selectedGameType)}
              </h3>
              <span className="text-xs text-zinc-400 font-semibold">
                Selected: <strong className="text-amber-400">{selectedNumbers.length}</strong> / {getMaxNumbers(selectedGameType)}
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
                const isSelected = selectedNumbers.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    className={`h-11 rounded-xl font-black text-xs transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 scale-105'
                        : 'bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:border-amber-500/50 hover:text-white'
                    }`}
                  >
                    {num < 10 ? `0${num}` : num}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Enhanced Bet Slip matching reference layout */}
        <div className="space-y-6">
          <div className="bg-zinc-950/90 backdrop-blur-2xl border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative sticky top-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-black uppercase tracking-wider text-white">Bet Slip</h3>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                {selectedGameType}
              </span>
            </div>
            <p className="text-xs text-zinc-400">Review your selections before placement.</p>

            <div className="space-y-2.5 pt-2 border-t border-zinc-900 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Price:</span>
                <span className="font-black text-amber-400">GH₵ {totalStake.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Minimum Win:</span>
                <span className="font-black text-emerald-400">GH₵ {minWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Maximum Win:</span>
                <span className="font-black text-emerald-400">GH₵ {maxWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>LINES:</span>
                <span className="font-black text-white">{selectedGameType === 'Banker' ? 1 : totalLines}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Game Type:</span>
                <span className="font-black text-amber-400 uppercase">{selectedGameType}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Game:</span>
                <span className="font-black text-white">{selectedDraw}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Closing Time:</span>
                <span className="font-black text-white">{closingTime}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Draw Date:</span>
                <span className="font-black text-white">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-zinc-900">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Stake per Line (GH₵):</span>
              
              <div className="grid grid-cols-4 gap-2">
                {stakeOptions.map((amount) => {
                  const isSelected = stakePerLine === amount;
                  return (
                    <button
                      key={amount}
                      onClick={() => handlePresetSelect(amount)}
                      disabled={selectedGameType === 'Banker'}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        isSelected && selectedGameType !== 'Banker'
                          ? 'bg-amber-400 border-amber-400 text-black shadow-md shadow-amber-400/20'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-500/40 disabled:opacity-40'
                      }`}
                    >
                      {amount}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">GH₵</span>
                  <input
                    type="number"
                    min="1"
                    disabled={selectedGameType === 'Banker'}
                    placeholder="Enter custom amount..."
                    value={customStakeInput}
                    onChange={handleCustomStakeChange}
                    className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 py-3 pl-14 pr-4 text-white text-xs font-bold focus:outline-none focus:border-amber-400 transition-all disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-zinc-400">Total Stake:</span>
              <span className="text-xl font-black text-amber-400">
                GH₵ {totalStake.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleOpenPaymentModal}
              disabled={(selectedNumbers.length === 0) || (selectedGameType !== 'Banker' && totalLines <= 0) || totalStake <= 0}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 py-4 font-black text-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:opacity-95 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              Confirm & Place Bet
            </button>
          </div>
        </div>

      </div>

      {/* Booking Code Result Modal */}
      {isSearchModalOpen && searchedTicketResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Ticket Details</h3>
              <button onClick={() => setIsSearchModalOpen(false)} className="text-zinc-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs text-zinc-300">
              <div className="flex justify-between"><span>Booking Code:</span> <span className="font-bold text-amber-400">{searchedTicketResult.bookingCode}</span></div>
              <div className="flex justify-between"><span>Game Type:</span> <span className="font-bold text-white">{searchedTicketResult.gameType}</span></div>
              <div className="flex justify-between"><span>Selected Numbers:</span> <span className="font-bold text-amber-400">{searchedTicketResult.numbers.join(', ')}</span></div>
              <div className="flex justify-between"><span>Total Lines:</span> <span className="font-bold text-white">{searchedTicketResult.lines}</span></div>
              <div className="flex justify-between"><span>Total Stake:</span> <span className="font-bold text-amber-400">GH₵ {searchedTicketResult.total?.toFixed(2)}</span></div>
            </div>
            <button
              onClick={() => {
                setSelectedGameType(searchedTicketResult.gameType);
                setSelectedNumbers(searchedTicketResult.numbers);
                setStakePerLine(searchedTicketResult.stakePerLine || 2);
                setIsSearchModalOpen(false);
              }}
              className="w-full py-3 bg-amber-400 text-black font-black rounded-xl text-xs uppercase"
            >
              Load Into Slip
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Mobile Money Checkout</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-zinc-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400"><span>Amount to Pay:</span> <span className="font-bold text-amber-400 text-sm">GH₵ {totalStake.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-400"><span>Game Slip:</span> <span className="font-semibold text-white">{selectedGameType}</span></div>
              <div className="flex justify-between text-zinc-400"><span>Potential Min Win:</span> <span className="font-semibold text-emerald-400">GH₵ {minWin.toFixed(2)}</span></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Select Network</label>
                <div className="grid grid-cols-3 gap-2">
                  {['MTN', 'Telecel', 'AirtelTigo'].map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setMomoProvider(prov)}
                      className={`py-2 rounded-xl text-xs font-black border transition ${
                        momoProvider === prov ? 'bg-amber-400 border-amber-400 text-black shadow-md' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Momo Phone Number</label>
                <input 
                  type="tel"
                  placeholder="024 000 0000"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-white text-sm font-semibold focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={handleProcessMomoPayment}
                disabled={isProcessing}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 py-4 font-black text-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Approving Prompt on Phone...
                  </>
                ) : (
                  `Pay GH₵ ${totalStake.toFixed(2)} & Place Bet`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}