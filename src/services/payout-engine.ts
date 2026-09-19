export class PayoutEngine {
  static evaluateLine(selectedNumbers: number[], winningNumbers: number[]) {
    const matches = selectedNumbers.filter((n) => winningNumbers.includes(n)).length;
    return {
      isWinner: matches > 0,
      matchCount: matches,
    };
  }
}