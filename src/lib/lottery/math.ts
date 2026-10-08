export interface GameMultiplierConfig {
  [key: string]: number;
}

export const GAME_MULTIPLIERS: GameMultiplierConfig = {
  DIRECT_1: 40,
  DIRECT_2: 240,
  DIRECT_3: 2100,
  DIRECT_4: 6000,
  DIRECT_5: 44000,
  PERM_2: 240,
  PERM_3: 2100,
};

/**
 * Standard combination calculation: C(n, r) = n! / (r! * (n - r)!)
 */
export function calculateCombinationCount(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let res = 1;
  for (let i = 1; i <= r; i++) {
    res = (res * (n - (i - 1))) / i;
  }
  return res;
}

/**
 * Generates unique combinations for permutation games (no ordering or duplicates).
 */
export function generateCombinations(arr: number[], r: number): number[][] {
  const result: number[][] = [];
  function combine(start: number, current: number[]) {
    if (current.length === r) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  combine(0, []);
  return result;
}

export function calculateGeneratedLines(gameType: string, selectedNumbers: number[]): number[][] {
  const n = selectedNumbers.length;
  switch (gameType) {
    case 'DIRECT_1':
      return n === 1 ? [selectedNumbers] : [];
    case 'DIRECT_2':
      return n === 2 ? [selectedNumbers] : [];
    case 'DIRECT_3':
      return n === 3 ? [selectedNumbers] : [];
    case 'DIRECT_4':
      return n === 4 ? [selectedNumbers] : [];
    case 'DIRECT_5':
      return n === 5 ? [selectedNumbers] : [];
    case 'PERM_2':
      if (n < 3) return [];
      return generateCombinations(selectedNumbers, 2);
    case 'PERM_3':
      if (n < 4) return [];
      return generateCombinations(selectedNumbers, 3);
    case 'BANKER':
      if (n !== 1) return [];
      // Banker pairs with the other 89 numbers (1 to 90 excluding the banker)
      const bankerNum = selectedNumbers[0];
      const lines: number[][] = [];
      for (let i = 1; i <= 90; i++) {
        if (i !== bankerNum) {
          lines.push([bankerNum, i]);
        }
      }
      return lines;
    default:
      return [];
  }
}

export function calculateTotalStakeMinor(
  gameType: string,
  selectedCount: number,
  stakePerLineMinor: number
): number {
  if (gameType.startsWith('DIRECT')) {
    return stakePerLineMinor; // Direct stake is total stake
  }
  if (gameType === 'BANKER') {
    return 89 * stakePerLineMinor;
  }
  let r = 0;
  if (gameType === 'PERM_2') r = 2;
  if (gameType === 'PERM_3') r = 3;
  
  const lines = calculateCombinationCount(selectedCount, r);
  return lines * stakePerLineMinor;
}

export function calculatePotentialWins(
  gameType: string,
  selectedCount: number,
  stakePerLineMinor: number,
  multiplier: number
): { minWinMinor: number; maxWinMinor: number; lineCount: number } {
  if (gameType.startsWith('DIRECT')) {
    const win = stakePerLineMinor * multiplier;
    return { minWinMinor: win, maxWinMinor: win, lineCount: 1 };
  }

  let r = 0;
  if (gameType === 'PERM_2') r = 2;
  else if (gameType === 'PERM_3') r = 3;
  else if (gameType === 'BANKER') {
    // Banker min win = 1 pair * stake * multiplier; max win = 4 pairs * stake * multiplier
    const minWin = stakePerLineMinor * multiplier;
    const maxWin = 4 * stakePerLineMinor * multiplier;
    return { minWinMinor: minWin, maxWinMinor: maxWin, lineCount: 89 };
  } else {
    return { minWinMinor: 0, maxWinMinor: 0, lineCount: 0 };
  }

  const lineCount = calculateCombinationCount(selectedCount, r);
  const minWinMinor = 1 * stakePerLineMinor * multiplier;
  
  // Max winning lines limited to draw size (5 winning numbers)
  const maxWinningLines = calculateCombinationCount(Math.min(selectedCount, 5), r);
  const maxWinMinor = maxWinningLines * stakePerLineMinor * multiplier;

  return { minWinMinor, maxWinMinor, lineCount };
}

export function calculateActualPayoutMinor(
  gameType: string,
  selectedNumbers: number[],
  winningNumbers: number[],
  stakePerLineMinor: number,
  multiplier: number
): { winningLines: number; actualPayoutMinor: number } {
  const matched = selectedNumbers.filter((num) => winningNumbers.includes(num));
  const h = matched.length;

  if (gameType.startsWith('DIRECT')) {
    const isMatch = selectedNumbers.every((num, idx) => num === winningNumbers[idx]); // For direct ordered/exact match depending on rule
    // Standard check: all selected numbers present in winning numbers
    const allPresent = selectedNumbers.every((num) => winningNumbers.includes(num));
    if (gameType === 'DIRECT_1' && winningNumbers[0] === selectedNumbers[0]) {
      return { winningLines: 1, actualPayoutMinor: stakePerLineMinor * multiplier };
    }
    if (allPresent && h === selectedNumbers.length) {
      return { winningLines: 1, actualPayoutMinor: stakePerLineMinor * multiplier };
    }
    return { winningLines: 0, actualPayoutMinor: 0 };
  }

  if (gameType === 'PERM_2') {
    const winningLines = calculateCombinationCount(h, 2);
    return { winningLines, actualPayoutMinor: winningLines * stakePerLineMinor * multiplier };
  }

  if (gameType === 'PERM_3') {
    const winningLines = calculateCombinationCount(h, 3);
    return { winningLines, actualPayoutMinor: winningLines * stakePerLineMinor * multiplier };
  }

  if (gameType === 'BANKER') {
    const bankerNum = selectedNumbers[0];
    if (!winningNumbers.includes(bankerNum)) {
      return { winningLines: 0, actualPayoutMinor: 0 };
    }
    // Other winning numbers that form pairs with banker
    const otherWinning = winningNumbers.filter((n) => n !== bankerNum);
    const winningLines = Math.min(4, otherWinning.length);
    return { winningLines, actualPayoutMinor: winningLines * stakePerLineMinor * multiplier };
  }

  return { winningLines: 0, actualPayoutMinor: 0 };
}