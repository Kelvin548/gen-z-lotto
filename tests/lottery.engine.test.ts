import {
  LOTTO_CONSTANTS,
  DrawStatus,
  TicketStatus,
  GameTypeCode,
  ghsToPesewas,
  pesewasToGhs,
  formatGhsDisplay,
  formatLottoNumber,
  CombinatoricsEngine,
  DirectStrategy,
  Perm2Strategy,
  Perm3Strategy,
  BankerStrategy,
  AgainstStrategy,
  LuckyStrategy,
  GameTypeRegistry,
  BookingCodeGenerator,
  ServerLotteryEngine,
  GameTypeConfig,
} from "@/lib/lottery/phase4-lottery-engine";

describe("GEN Z LOTTO - Phase 4 Lottery Engine Full Coverage Suite", () => {
  describe("Monetary & Formatting Helpers", () => {
    it("converts GHS to Pesewas and back accurately", () => {
      expect(ghsToPesewas(1)).toBe(100);
      expect(ghsToPesewas(10.5)).toBe(1050);
      expect(pesewasToGhs(1050)).toBe(10.5);
      expect(pesewasToGhs(0)).toBe(0);
    });

    it("formats GHS display currency string", () => {
      expect(formatGhsDisplay(500)).toBe("GH₵ 5.00");
      expect(formatGhsDisplay(1250)).toBe("GH₵ 12.50");
    });

    it("formats lotto numbers with leading zero padding", () => {
      expect(formatLottoNumber(5)).toBe("05");
      expect(formatLottoNumber(12)).toBe("12");
      expect(formatLottoNumber(90)).toBe("90");
    });
  });

  describe("Combinatorics Engine", () => {
    it("handles combinations nCr edge cases", () => {
      expect(CombinatoricsEngine.nCr(5, -1)).toBe(0);
      expect(CombinatoricsEngine.nCr(5, 6)).toBe(0);
      expect(CombinatoricsEngine.nCr(5, 0)).toBe(1);
      expect(CombinatoricsEngine.nCr(5, 5)).toBe(1);
      expect(CombinatoricsEngine.nCr(5, 4)).toBe(5);
      expect(CombinatoricsEngine.nCr(5, 2)).toBe(10);
    });

    it("generates combinations sets correctly", () => {
      expect(CombinatoricsEngine.getCombinations([], 1)).toEqual([]);
      expect(CombinatoricsEngine.getCombinations([1, 2], 3)).toEqual([]);
      expect(CombinatoricsEngine.getCombinations([1, 2, 3], 0)).toEqual([[]]);
      expect(CombinatoricsEngine.getCombinations([1, 2, 3], 2)).toEqual([
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
    });

    it("generates cartesian products avoiding self-pairs", () => {
      const res = CombinatoricsEngine.cartesianProduct([1, 2], [2, 3]);
      expect(res).toEqual([
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
    });
  });

  describe("Game Type Strategies", () => {
    const baseConfig: GameTypeConfig = {
      gameTypeCode: GameTypeCode.DIRECT,
      minSelections: 1,
      maxSelections: 5,
      minStakePesewas: 100,
      maxStakePesewas: 10000,
      stakeIncrementPesewas: 50,
      allowDuplicates: false,
      orderedCombinations: false,
      rulesVersion: 1,
      multiplierConfig: { baseMultiplier: 40 },
    };

    describe("Direct Strategy", () => {
      const strategy = new DirectStrategy();

      it("validates successful direct bet", () => {
        const res = strategy.validateAndCalculate(
          { primaryNumbers: [5, 12] },
          200,
          { ...baseConfig, minSelections: 1, maxSelections: 5 }
        );
        expect(res.isValid).toBe(true);
        expect(res.totalLines).toBe(1);
        expect(res.estimatedPotentialPayoutPesewas).toBe(8000);
      });

      it("catches out-of-range, non-integer, and duplicate numbers", () => {
        const res = strategy.validateAndCalculate(
          { primaryNumbers: [0, 91, 5.5, 5, 5] },
          200,
          baseConfig
        );
        expect(res.isValid).toBe(false);
        expect(res.errors.length).toBeGreaterThanOrEqual(4);
      });

      it("validates min/max selection bounds and stake constraints", () => {
        const res = strategy.validateAndCalculate(
          { primaryNumbers: [1, 2, 3] },
          75,
          { ...baseConfig, minSelections: 4, maxStakePesewas: 500 }
        );
        expect(res.isValid).toBe(false);
      });
    });

    describe("Perm2 Strategy", () => {
      const strategy = new Perm2Strategy();
      const config: GameTypeConfig = {
        ...baseConfig,
        gameTypeCode: GameTypeCode.PERM_2,
        minSelections: 2,
        maxSelections: 24,
      };

      it("calculates lines and payout for valid Perm 2", () => {
        const res = strategy.validateAndCalculate({ primaryNumbers: [1, 2, 3] }, 100, config);
        expect(res.isValid).toBe(true);
        expect(res.totalLines).toBe(3);
        expect(res.estimatedPotentialPayoutPesewas).toBe(12000);
      });

      it("flags selection cap and combination line cap violations", () => {
        const overCap = Array.from({ length: 25 }, (_, i) => i + 1);
        const res = strategy.validateAndCalculate({ primaryNumbers: overCap }, 100, config);
        expect(res.isValid).toBe(false);
      });
    });

    describe("Perm3 Strategy", () => {
      const strategy = new Perm3Strategy();
      const config: GameTypeConfig = {
        ...baseConfig,
        gameTypeCode: GameTypeCode.PERM_3,
        minSelections: 3,
        maxSelections: 24,
      };

      it("calculates lines for valid Perm 3", () => {
        const res = strategy.validateAndCalculate({ primaryNumbers: [1, 2, 3, 4] }, 100, config);
        expect(res.isValid).toBe(true);
        expect(res.totalLines).toBe(4);
      });

      it("rejects less than 3 numbers for Perm 3", () => {
        const res = strategy.validateAndCalculate({ primaryNumbers: [1, 2] }, 100, config);
        expect(res.isValid).toBe(false);
      });
    });

    describe("Banker Strategy", () => {
      const strategy = new BankerStrategy();
      const config: GameTypeConfig = {
        ...baseConfig,
        gameTypeCode: GameTypeCode.BANKER,
      };

      it("validates Banker selections", () => {
        const res = strategy.validateAndCalculate(
          { primaryNumbers: [1], secondaryNumbers: [2, 3, 4] },
          100,
          config
        );
        expect(res.isValid).toBe(true);
        expect(res.totalLines).toBe(3);
      });

      it("rejects empty sets and overlapping bankers/mains", () => {
        const res = strategy.validateAndCalculate(
          { primaryNumbers: [1, 2], secondaryNumbers: [2, 3] },
          100,
          config
        );
        expect(res.isValid).toBe(false);
        expect(res.errors.some((e) => e.includes("cannot overlap"))).toBe(true);
      });
    });

    describe("Against Strategy", () => {
      const strategy = new AgainstStrategy();
      const config: GameTypeConfig = {
        ...baseConfig,
        gameTypeCode: GameTypeCode.AGAINST,
      };

      it("calculates cartesian product lines for Against strategy", () => {
        const res = strategy.validateAndCalculate(
          { primaryNumbers: [1, 2], secondaryNumbers: [3, 4] },
          100,
          config
        );
        expect(res.isValid).toBe(true);
        expect(res.totalLines).toBe(4);
      });

      it("rejects missing groups or overlap", () => {
        const res = strategy.validateAndCalculate(
          { primaryNumbers: [], secondaryNumbers: [1] },
          100,
          config
        );
        expect(res.isValid).toBe(false);
      });
    });

    describe("Lucky Strategy", () => {
      const strategy = new LuckyStrategy();
      const config: GameTypeConfig = {
        ...baseConfig,
        gameTypeCode: GameTypeCode.LUCKY,
        minSelections: 5,
      };

      it("validates Lucky game selection", () => {
        const res = strategy.validateAndCalculate(
          { primaryNumbers: [1, 2, 3, 4, 5] },
          100,
          config
        );
        expect(res.isValid).toBe(true);
        expect(res.totalLines).toBe(1);
      });

      it("rejects selection under minSelections", () => {
        const res = strategy.validateAndCalculate(
          { primaryNumbers: [1, 2] },
          100,
          config
        );
        expect(res.isValid).toBe(false);
      });
    });
  });

  describe("Registry & Utilities", () => {
    it("throws error for unregistered strategy lookup", () => {
      expect(() => GameTypeRegistry.get("UNKNOWN" as GameTypeCode)).toThrow(
        "Unsupported or unregistered game type strategy"
      );
    });

    it("generates booking code with proper format", () => {
      const code = BookingCodeGenerator.generate();
      expect(code).toMatch(/^GZ-[2-9A-HJ-NP-Z]{8}$/);
    });
  });

  describe("ServerLotteryEngine Validation", () => {
    const config: GameTypeConfig = {
      gameTypeCode: GameTypeCode.DIRECT,
      minSelections: 1,
      maxSelections: 5,
      minStakePesewas: 100,
      maxStakePesewas: 10000,
      stakeIncrementPesewas: 100,
      allowDuplicates: false,
      orderedCombinations: false,
      rulesVersion: 1,
    };

    it("rejects bets submitted after draw closing time or with non-OPEN status", () => {
      const pastDate = new Date(Date.now() - 10000);
      const futureDate = new Date(Date.now() + 100000);

      const res1 = ServerLotteryEngine.validateSelection(
        { primaryNumbers: [1] },
        100,
        config,
        pastDate,
        DrawStatus.OPEN
      );
      expect(res1.isValid).toBe(false);
      expect(res1.errors).toContain("The draw for this game has already closed. Ticket submission rejected.");

      const res2 = ServerLotteryEngine.validateSelection(
        { primaryNumbers: [1] },
        100,
        config,
        futureDate,
        DrawStatus.CLOSED
      );
      expect(res2.isValid).toBe(false);
      expect(res2.errors.some((e) => e.includes("Draw is not accepting bets"))).toBe(true);
    });

    it("passes validation for open draw with valid selections", () => {
      const futureDate = new Date(Date.now() + 100000);
      const res = ServerLotteryEngine.validateSelection(
        { primaryNumbers: [1, 2] },
        100,
        config,
        futureDate,
        DrawStatus.OPEN
      );
      expect(res.isValid).toBe(true);
    });
  });
});