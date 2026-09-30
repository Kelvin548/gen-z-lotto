'use client';

import { useState, useEffect } from 'react';

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
  { name: 'NLA VAG Monday', closingTime: '9:30 AM', timeString: '09:30', day: 'Monday' },
  { name: 'Moon Rush Monday', closingTime: '1:00 PM', timeString: '13:00', day: 'Monday' },
  { name: 'Monday Special', closingTime: '7:30 PM', timeString: '19:30', day: 'Monday' },
  { name: 'NLA VAG Tuesday', closingTime: '9:30 AM', timeString: '09:30', day: 'Tuesday' },
  { name: 'Moon Rush Tuesday', closingTime: '1:00 PM', timeString: '13:00', day: 'Tuesday' },
  { name: 'Lucky Tuesday', closingTime: '7:30 PM', timeString: '19:30', day: 'Tuesday' },
  { name: 'NLA VAG Wednesday', closingTime: '9:30 AM', timeString: '09:30', day: 'Wednesday' },
  { name: 'Moon Rush Wednesday', closingTime: '1:00 PM', timeString: '13:00', day: 'Wednesday' },
  { name: 'Midweek', closingTime: '7:30 PM', timeString: '19:30', day: 'Wednesday' },
  { name: 'NLA VAG Thursday', closingTime: '9:30 AM', timeString: '09:30', day: 'Thursday' },
  { name: 'Moon Rush Thursday', closingTime: '1:00 PM', timeString: '13:00', day: 'Thursday' },
  { name: 'Fortune Thursday', closingTime: '7:30 PM', timeString: '19:30', day: 'Thursday' },
  { name: 'NLA VAG Friday', closingTime: '9:30 AM', timeString: '09:30', day: 'Friday' },
  { name: 'Moon Rush Friday', closingTime: '1:00 PM', timeString: '13:00', day: 'Friday' },
  { name: 'Friday Bonanza', closingTime: '7:30 PM', timeString: '19:30', day: 'Friday' },
  { name: 'NLA VAG Saturday', closingTime: '9:30 AM', timeString: '09:30', day: 'Saturday' },
  { name: 'Moon Rush Saturday', closingTime: '1:00 PM', timeString: '13:00', day: 'Saturday' },
  { name: 'National', closingTime: '7:30 PM', timeString: '19:30', day: 'Saturday' },
  { name: 'Aseda Sunday', closingTime: '5:30 PM', timeString: '17:30', day: 'Sunday' }
];

function getNextDefaultDraw() {
  const now = new Date();
  const currentDayIndex = now.getDay();
  const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayMap[currentDayIndex];
  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

  const orderedDays = [];
  for (let i = 0; i < 7; i++) {
    const idx = (currentDayIndex + i) % 7;
    orderedDays.push(dayMap[idx]);
  }

  for (const targetDay of orderedDays) {
    const drawsOnDay = drawsList.filter(d => d.day === targetDay);
    for (const draw of drawsOnDay) {
      const [hh, mm] = draw.timeString.split(':').map(Number);
      const drawTimeMinutes = hh * 60 + mm;

      if (targetDay !== todayName || drawTimeMinutes > currentTimeMinutes) {
        return draw;
      }
    }
  }

  return drawsList[0];
}

export default function PlayArenaPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const defaultDraw = getNextDefaultDraw();

  const [selectedGameType, setSelectedGameType] = useState('Banker');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [bankerNumber, setBankerNumber] = useState<number | null>(null);

  const [stakePerLine, setStakePerLine] = useState<number>(0);
  const [customStakeInput, setCustomStakeInput] = useState<string>('');

  const [selectedDraw, setSelectedDraw] = useState(defaultDraw.name);
  const [closingTime, setClosingTime] = useState(defaultDraw.closingTime);

  const [searchBookingCode, setSearchBookingCode] = useState('');
  const [searchedTicketResult, setSearchedTicketResult] = useState<any>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [momoNumber, setMomoNumber] = useState('');
  const [momoProvider, setMomoProvider] = useState('MTN');
  const [isProcessing, setIsProcessing] = useState(false);

  const gameTypes = [
    'Direct 1', 'Direct 2', 'Direct 3', 'Direct 4',
    'Direct 5', 'Perm 2', 'Perm 3', 'Banker'
  ];

  const stakeOptions = [10, 20, 50, 89];

  if (!isMounted) {
    return null; // Prevents server/client mismatch during initial hydration
  }

  const handleDrawChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const drawName = e.target.value;
    setSelectedDraw(drawName);
    const found = drawsList.find(d => d.name === drawName);
    if (found) {
      setClosingTime(found.closingTime);
    }
  };

  const getMaxNumbers = (type: string) => {
    switch (type) {
      case 'Direct 1': return 1;
      case 'Direct 2': return 2;
      case 'Direct 3': return 3;
      case 'Direct 4': return 4;
      case 'Direct 5': return 5;
      case 'Perm 2': return 25; 
      case 'Perm 3': return 10; 
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
    if (selectedGameType === 'Banker') {
      return bankerNumber !== null ? 89 : 0;
    }
    if (selectedGameType.startsWith('Perm')) {
      const r = getRequiredSelectionSize(selectedGameType);
      return calculateCombinations(selectedNumbers.length, r);
    }
    const required = getMaxNumbers(selectedGameType);
    return selectedNumbers.length === required ? 1 : 0;
  };

  const totalLines = calculateTotalLines();
  const baseTotalStake = selectedGameType === 'Banker'
    ? (bankerNumber !== null ? totalLines * stakePerLine : 0)
    : (totalLines * stakePerLine);

  const discountAmount = baseTotalStake * 0.20;
  const finalPayable = baseTotalStake - discountAmount;

  const getPotentialWins = () => {
    if (selectedGameType === 'Banker') {
      if (bankerNumber === null) return { minWin: 0, maxWin: 0 };
      const winVal = stakePerLine * 880; 
      return { minWin: winVal, maxWin: winVal };
    }

    if (totalLines <= 0) return { minWin: 0, maxWin: 0 };

    let baseMultiplier = 240;
    if (selectedGameType === 'Direct 1') baseMultiplier = 10;
    if (selectedGameType === 'Direct 2') baseMultiplier = 240;
    if (selectedGameType === 'Direct 3') baseMultiplier = 2100;
    if (selectedGameType === 'Direct 4') baseMultiplier = 6000;
    if (selectedGameType === 'Direct 5') baseMultiplier = 44000;
    if (selectedGameType === 'Perm 2') baseMultiplier = 240;
    if (selectedGameType === 'Perm 3') baseMultiplier = 2100;

    const minWin = stakePerLine * baseMultiplier;
    const maxWin = selectedGameType.startsWith('Perm') ? totalLines * stakePerLine * baseMultiplier : minWin;
    return { minWin, maxWin };
  };

  const { minWin, maxWin } = getPotentialWins();

  const handleGameTypeChange = (type: string) => {
    setSelectedGameType(type);
    setSelectedNumbers([]); 
    setBankerNumber(null);
  };

  const toggleNumber = (num: number) => {
    if (selectedGameType === 'Banker') {
      if (bankerNumber === num) {
        setBankerNumber(null);
      } else {
        setBankerNumber(num);
      }
      return;
    }

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

  const clearSelectedNumbers = () => {
    if (selectedGameType === 'Banker') {
      setBankerNumber(null);
    } else {
      setSelectedNumbers([]);
    }
  };

  const handlePresetSelect = (amount: number) => {
    setStakePerLine(amount);
    setCustomStakeInput(amount.toString());
  };

  const handleCustomStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (selectedGameType === 'Banker') {
      if (bankerNumber === null) {
        alert('Banker requires exactly 1 number selection.');
        return;
      }
    } else if (selectedGameType.startsWith('Direct')) {
      const requiredCount = getMaxNumbers(selectedGameType);
      if (selectedNumbers.length !== requiredCount) {
        alert(`${selectedGameType} requires exactly ${requiredCount} number(s). You have selected ${selectedNumbers.length}.`);
        return;
      }
    } else if (selectedGameType === 'Perm 2' && selectedNumbers.length < 2) {
      alert('Perm 2 requires at least 2 numbers selected.');
      return;
    } else if (selectedGameType === 'Perm 3' && (selectedNumbers.length < 3 || selectedNumbers.length > 10)) {
      alert('Perm 3 requires between 3 and 10 numbers selected.');
      return;
    }

    if (totalLines <= 0) {
      alert('Invalid selection for this game type.');
      return;
    }
    if (finalPayable <= 0) {
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

    try {
      const amountMinor = Math.round(finalPayable * 100);
      const idempotencyKey = `dep-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const currentUser = localStorage.getItem('active_username') || 'customer_user';

      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountMinor: amountMinor,
          idempotencyKey: idempotencyKey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.errors?.[0] || data.message || 'Payment initialization failed.');
      }

      setIsProcessing(false);
      setIsPaymentModalOpen(false);

      const storageKey = `user_tickets_${currentUser}`;
      const bookingCode = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

      const ticketNumbers = selectedGameType === 'Banker' 
        ? [bankerNumber] 
        : selectedNumbers;

      const newTicket = {
        id: `#TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        bookingCode: bookingCode,
        username: currentUser,
        gameType: selectedGameType,
        gameName: selectedDraw,
        numbers: ticketNumbers,
        bankerNumber: selectedGameType === 'Banker' ? bankerNumber : null,
        secondaryNumbers: [],
        stakePerLine: stakePerLine,
        lines: totalLines,
        total: finalPayable,
        originalTotal: baseTotalStake,
        discount: discountAmount,
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

      setSelectedNumbers([]);
      setBankerNumber(null);

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        alert(`Payment prompt initialized! Your Booking Code is: ${bookingCode}`);
        window.location.href = '/customer/tickets';
      }
    } catch (error: any) {
      setIsProcessing(false);
      alert(error.message || 'An error occurred during payment processing.');
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white mb-1">5/90 Play Arena</h2>
        <p className="text-xs text-zinc-400">Select your draw, game type, and numbers to lock in your stake.</p>
      </div>

      <div className="bg-zinc-950/85 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">🔑</span>
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
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  {selectedGameType === 'Banker'
                    ? 'Pick Numbers (1 more)'
                    : `3. Select Numbers (1 to 90) — Max: ${getMaxNumbers(selectedGameType)}`}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {((selectedGameType === 'Banker' && bankerNumber !== null) || (selectedGameType !== 'Banker' && selectedNumbers.length > 0)) && (
                  <button
                    onClick={clearSelectedNumbers}
                    className="text-[11px] text-red-400 hover:text-red-300 font-bold uppercase transition"
                  >
                    Clear
                  </button>
                )}
                {selectedGameType === 'Banker' ? (
                  <div className="text-xs text-zinc-400 font-semibold">
                    Selected Number: <strong className="text-amber-400">{bankerNumber !== null ? (bankerNumber < 10 ? `0${bankerNumber}` : bankerNumber) : 'None'}</strong>
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400 font-semibold">
                    Selected: <strong className="text-amber-400">{selectedNumbers.length}</strong> / {getMaxNumbers(selectedGameType)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
                const isBanker = selectedGameType === 'Banker' && bankerNumber === num;
                const isSelectedStandard = selectedGameType !== 'Banker' && selectedNumbers.includes(num);

                let btnStyle = 'bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:border-amber-500/50 hover:text-white';
                if (isBanker || isSelectedStandard) {
                  btnStyle = 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 scale-105 border-amber-300 ring-2 ring-amber-400';
                }

                return (
                  <button
                    key={num}
                    onClick={() => toggleNumber(num)}
                    className={`h-11 rounded-xl font-black text-xs transition-all flex items-center justify-center ${btnStyle}`}
                  >
                    {num < 10 ? `0${num}` : num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

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
                <span className="font-bold text-amber-400">GH₵ {baseTotalStake.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Minimum Win:</span>
                <span className="font-black text-emerald-400">GH₵ {minWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>LINES:</span>
                <span className="font-black text-white">{totalLines}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Game Type:</span>
                <span className="font-black text-amber-400 uppercase">Banker Against All</span>
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
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Amount (GH₵):</span>
              
              <div className="grid grid-cols-4 gap-2">
                {stakeOptions.map((amount) => {
                  const isSelected = stakePerLine === amount;
                  return (
                    <button
                      key={amount}
                      onClick={() => handlePresetSelect(amount)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        isSelected
                          ? 'bg-amber-400 border-amber-400 text-black shadow-md shadow-amber-400/20'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-500/40'
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
                    placeholder="Enter amount..."
                    value={customStakeInput}
                    onChange={handleCustomStakeChange}
                    className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 py-3 pl-14 pr-4 text-white text-xs font-bold focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-zinc-400">Final Payable:</span>
              <span className="text-xl font-black text-amber-400">
                GH₵ {finalPayable.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleOpenPaymentModal}
              disabled={
                selectedGameType === 'Banker'
                  ? (bankerNumber === null || finalPayable <= 0)
                  : (selectedNumbers.length === 0 || totalLines <= 0 || finalPayable <= 0)
              }
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 py-4 font-black text-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:opacity-95 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              Play Game
            </button>
          </div>
        </div>
      </div>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Mobile Money Checkout</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-zinc-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400"><span>Game Type:</span> <span className="text-white font-bold">Banker Against All</span></div>
              {selectedGameType === 'Banker' && (
                <div className="flex justify-between text-zinc-400"><span>Banker Number:</span> <span className="text-amber-400 font-bold">{bankerNumber}</span></div>
              )}
              <div className="flex justify-between text-zinc-400"><span>Final Payable:</span> <span className="text-amber-400 font-black text-sm">GH₵ {finalPayable.toFixed(2)}</span></div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Select Mobile Network</label>
              <div className="grid grid-cols-2 gap-3">
                {['MTN', 'Telecel'].map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setMomoProvider(prov)}
                    className={`py-2.5 rounded-xl text-xs font-black border transition ${
                      momoProvider === prov
                        ? 'bg-amber-400 border-amber-400 text-black'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    {prov} MoMo
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Mobile Number</label>
              <input
                type="text"
                placeholder="024XXXXXXX"
                value={momoNumber}
                onChange={(e) => setMomoNumber(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={handleProcessMomoPayment}
              disabled={isProcessing}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition disabled:opacity-50"
            >
              {isProcessing ? 'Processing Payment...' : `Authorize GH₵ ${finalPayable.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}