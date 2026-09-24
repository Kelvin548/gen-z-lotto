import { z } from "zod";

// ============================================================================
// CONSTANTS & MONETARY HELPERS
// ============================================================================

export const LOTTO_CONSTANTS = {
  MIN_NUMBER: 1,
  MAX_NUMBER: 90,
  DEFAULT_CURRENCY: "GHS",
  TIMEZONE: "Africa/Accra",
  MAX_SELECTION_CAP: 25, // Updated to 25 to support Perm games
  MAX_LINES_PER_BET: 5000,
};

export type Pesewas = number;

export function ghsToPesewas(ghs: number): Pesewas {
  return Math.round(ghs * 100);
}

export function pesewasToGhs(pesewas: Pesewas): number {
  return pesewas / 100;
}

export function formatGhsDisplay(pesewas: Pesewas): string {
  return `GH₵ ${(pesewas / 100).toFixed(2)}`;
}

export function formatLottoNumber(num: number): string {
  return num.toString().padStart(2, "0");
}

export enum DrawStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  CLOSING_SOON = "CLOSING_SOON",
  CLOSED = "CLOSED",
  DRAWING = "DRAWING",
  RESULT_PENDING = "RESULT_PENDING",
  RESULT_PUBLISHED = "RESULT_PUBLISHED",
  LOCKED = "LOCKED",
  CANCELLED = "CANCELLED",
}

export enum TicketStatus {
  PENDING = "PENDING",
  WON = "WON",
  LOST = "LOST",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
  VOID = "VOID",
}

export enum GameTypeCode {
  DIRECT = "DIRECT",
  PERM_2 = "PERM_2",
  PERM_3 = "PERM_3",
  BANKER = "BANKER",
  AGAINST = "AGAINST",
  LUCKY = "LUCKY",
  CUSTOM = "CUSTOM",
}

export interface SelectionPayload {
  primaryNumbers: number[];
  secondaryNumbers?: number[];
}

export interface GameTypeConfig {
  gameTypeCode: GameTypeCode;
  minSelections: number;
  maxSelections: number;
  minStakePesewas: Pesewas;
  maxStakePesewas: Pesewas;
  stakeIncrementPesewas: Pesewas;
  allowDuplicates: boolean;
  orderedCombinations: boolean;
  rulesVersion: number;
  multiplierConfig?: {
    baseMultiplier?: number;
    perLineMultipliers?: Record<number, number>;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  totalLines: number;
  stakePerLinePesewas: Pesewas;
  totalStakePesewas: Pesewas;
  estimatedPotentialPayoutPesewas: Pesewas | null;
  generatedLines: number[][];
  normalizedSelections: {
    primary: number[];
    secondary?: number[];
  };
}

// ============================================================================
// COMBINATORICS ENGINE
// ============================================================================

export class CombinatoricsEngine {
  static nCr(n: number, r: number): number {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    if (r > n / 2) r = n - r;

    let res = 1;
    for (let i = 1; i <= r; i++) {
      res = (res * (n - i + 1)) / i;
    }
    return Math.round(res);
  }

  static getCombinations<T>(arr: T[], k: number): T[][] {
    if (k === 0) return [[]];
    if (arr.length === 0 || k > arr.length) return [];

    const head = arr[0];
    const tail = arr.slice(1);

    const withHead = CombinatoricsEngine.getCombinations(tail, k - 1).map((c) => [head, ...c]);
    const withoutHead = CombinatoricsEngine.getCombinations(tail, k);

    return [...withHead, ...withoutHead];
  }

  static cartesianProduct<T>(setA: T[], setB: T[]): [T, T][] {
    const result: [T, T][] = [];
    for (const a of setA) {
      for (const b of setB) {
        if (a !== b) {
          result.push([a, b]);
        }
      }
    }
    return result;
  }
}

// ============================================================================
// GAME STRATEGIES
// ============================================================================

export interface IGameTypeStrategy {
  readonly code: GameTypeCode;
  validateAndCalculate(
    selections: SelectionPayload,
    stakePesewas: Pesewas,
    config: GameTypeConfig
  ): ValidationResult;
}

abstract class BaseGameStrategy implements IGameTypeStrategy {
  abstract readonly code: GameTypeCode;

  protected validateNumberRange(nums: number[]): string[] {
    const errors: string[] = [];
    for (const n of nums) {
      if (!Number.isInteger(n)) {
        errors.push(`Invalid number value: ${n} is not an integer.`);
      } else if (n < LOTTO_CONSTANTS.MIN_NUMBER || n > LOTTO_CONSTANTS.MAX_NUMBER) {
        errors.push(
          `Number ${n} is outside allowed range (${LOTTO_CONSTANTS.MIN_NUMBER}-${LOTTO_CONSTANTS.MAX_NUMBER}).`
        );
      }
    }
    return errors;
  }

  protected checkDuplicates(nums: number[]): boolean {
    return new Set(nums).size !== nums.length;
  }

  protected validateStake(
    stakePesewas: Pesewas,
    config: GameTypeConfig,
    linesCount: number
  ): { errors: string[]; totalStakePesewas: Pesewas } {
    const errors: string[] = [];
    const totalStake = stakePesewas * linesCount;

    if (stakePesewas < config.minStakePesewas) {
      errors.push(
        `Stake per line (${formatGhsDisplay(stakePesewas)}) is below minimum of ${formatGhsDisplay(config.minStakePesewas)}.`
      );
    }
    if (stakePesewas > config.maxStakePesewas) {
      errors.push(
        `Stake per line (${formatGhsDisplay(stakePesewas)}) exceeds maximum of ${formatGhsDisplay(config.maxStakePesewas)}.`
      );
    }
    if (
      config.stakeIncrementPesewas > 0 &&
      stakePesewas % config.stakeIncrementPesewas !== 0
    ) {
      errors.push(
        `Stake per line must be in increments of ${formatGhsDisplay(config.stakeIncrementPesewas)}.`
      );
    }

    return { errors, totalStakePesewas: totalStake };
  }

  abstract validateAndCalculate(
    selections: SelectionPayload,
    stakePesewas: Pesewas,
    config: GameTypeConfig
  ): ValidationResult;
}

export class DirectStrategy extends BaseGameStrategy {
  readonly code = GameTypeCode.DIRECT;

  validateAndCalculate(
    selections: SelectionPayload,
    stakePesewas: Pesewas,
    config: GameTypeConfig
  ): ValidationResult {
    const errors: string[] = [];
    const primary = (selections.primaryNumbers || []).sort((a, b) => a - b);

    errors.push(...this.validateNumberRange(primary));

    if (!config.allowDuplicates && this.checkDuplicates(primary)) {
      errors.push("Duplicate numbers are not allowed in Direct game selection.");
    }

    if (primary.length < config.minSelections) {
      errors.push(
        `Direct requires at least ${config.minSelections} number(s). Selected: ${primary.length}.`
      );
    }
    if (primary.length > config.maxSelections) {
      errors.push(
        `Direct allows at most ${config.maxSelections} number(s). Selected: ${primary.length}.`
      );
    }

    const totalLines = 1;
    const lines = [primary];

    const stakeRes = this.validateStake(stakePesewas, config, totalLines);
    errors.push(...stakeRes.errors);

    let potentialPayout: Pesewas | null = null;
    if (config.multiplierConfig?.baseMultiplier) {
      potentialPayout = Math.round(stakePesewas * config.multiplierConfig.baseMultiplier);
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalLines,
      stakePerLinePesewas: stakePesewas,
      totalStakePesewas: stakeRes.totalStakePesewas,
      estimatedPotentialPayoutPesewas: potentialPayout,
      generatedLines: lines,
      normalizedSelections: { primary },
    };
  }
}

export class Perm2Strategy extends BaseGameStrategy {
  readonly code = GameTypeCode.PERM_2;

  validateAndCalculate(
    selections: SelectionPayload,
    stakePesewas: Pesewas,
    config: GameTypeConfig
  ): ValidationResult {
    const errors: string[] = [];
    const primary = (selections.primaryNumbers || []).sort((a, b) => a - b);

    if (primary.length > LOTTO_CONSTANTS.MAX_SELECTION_CAP) {
      errors.push(
        `Selection cap exceeded. Maximum allowed selection count is ${LOTTO_CONSTANTS.MAX_SELECTION_CAP}.`
      );
    }

    errors.push(...this.validateNumberRange(primary));

    if (!config.allowDuplicates && this.checkDuplicates(primary)) {
      errors.push("Duplicate numbers are not allowed in Perm 2.");
    }

    if (primary.length < Math.max(2, config.minSelections)) {
      errors.push(`Perm 2 requires at least 2 numbers. Selected: ${primary.length}.`);
    }

    const totalLines = CombinatoricsEngine.nCr(primary.length, 2);

    if (totalLines > LOTTO_CONSTANTS.MAX_LINES_PER_BET) {
      errors.push(
        `Combination limit exceeded. Maximum allowed lines is ${LOTTO_CONSTANTS.MAX_LINES_PER_BET}.`
      );
    }

    const lines = CombinatoricsEngine.getCombinations(primary, 2);
    const stakeRes = this.validateStake(stakePesewas, config, totalLines);
    errors.push(...stakeRes.errors);

    let potentialPayout: Pesewas | null = null;
    if (config.multiplierConfig?.baseMultiplier) {
      potentialPayout = Math.round(
        totalLines * stakePesewas * config.multiplierConfig.baseMultiplier
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalLines,
      stakePerLinePesewas: stakePesewas,
      totalStakePesewas: stakeRes.totalStakePesewas,
      estimatedPotentialPayoutPesewas: potentialPayout,
      generatedLines: lines,
      normalizedSelections: { primary },
    };
  }
}

export class Perm3Strategy extends BaseGameStrategy {
  readonly code = GameTypeCode.PERM_3;

  validateAndCalculate(
    selections: SelectionPayload,
    stakePesewas: Pesewas,
    config: GameTypeConfig
  ): ValidationResult {
    const errors: string[] = [];
    const primary = (selections.primaryNumbers || []).sort((a, b) => a - b);

    if (primary.length > LOTTO_CONSTANTS.MAX_SELECTION_CAP) {
      errors.push(
        `Selection cap exceeded. Maximum allowed selection count is ${LOTTO_CONSTANTS.MAX_SELECTION_CAP}.`
      );
    }

    errors.push(...this.validateNumberRange(primary));

    if (!config.allowDuplicates && this.checkDuplicates(primary)) {
      errors.push("Duplicate numbers are not allowed in Perm 3.");
    }

    if (primary.length < Math.max(3, config.minSelections)) {
      errors.push(`Perm 3 requires at least 3 numbers. Selected: ${primary.length}.`);
    }

    const totalLines = CombinatoricsEngine.nCr(primary.length, 3);

    if (totalLines > LOTTO_CONSTANTS.MAX_LINES_PER_BET) {
      errors.push(
        `Combination limit exceeded. Maximum allowed lines is ${LOTTO_CONSTANTS.MAX_LINES_PER_BET}.`
      );
    }

    const lines = CombinatoricsEngine.getCombinations(primary, 3);
    const stakeRes = this.validateStake(stakePesewas, config, totalLines);
    errors.push(...stakeRes.errors);

    let potentialPayout: Pesewas | null = null;
    if (config.multiplierConfig?.baseMultiplier) {
      potentialPayout = Math.round(
        totalLines * stakePesewas * config.multiplierConfig.baseMultiplier
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalLines,
      stakePerLinePesewas: stakePesewas,
      totalStakePesewas: stakeRes.totalStakePesewas,
      estimatedPotentialPayoutPesewas: potentialPayout,
      generatedLines: lines,
      normalizedSelections: { primary },
    };
  }
}

export class BankerStrategy extends BaseGameStrategy {
  readonly code = GameTypeCode.BANKER;

  validateAndCalculate(
    selections: SelectionPayload,
    stakePesewas: Pesewas,
    config: GameTypeConfig
  ): ValidationResult {
    const errors: string[] = [];
    const bankers = (selections.primaryNumbers || []).sort((a, b) => a - b);
    const mainSet = (selections.secondaryNumbers || []).sort((a, b) => a - b);

    errors.push(...this.validateNumberRange(bankers));

    if (bankers.length === 0) {
      errors.push("Banker strategy requires at least one Banker number.");
    }

    const lines: number[][] = [];
    if (mainSet.length > 0) {
      errors.push(...this.validateNumberRange(mainSet));
      const overlap = bankers.filter((b) => mainSet.includes(b));
      if (overlap.length > 0) {
        errors.push(
          `Banker numbers and main numbers cannot overlap. Overlapping: ${overlap.map(formatLottoNumber).join(", ")}.`
        );
      }
      for (const banker of bankers) {
        for (const mainNum of mainSet) {
          lines.push([banker, mainNum].sort((a, b) => a - b));
        }
      }
    } else {
      // Single-number banker mode matching frontend rules (1 banker number = 1 line)
      for (const banker of bankers) {
        lines.push([banker]);
      }
    }

    const totalLines = lines.length;
    if (totalLines > LOTTO_CONSTANTS.MAX_LINES_PER_BET) {
      errors.push(`Line limit exceeded. Maximum ${LOTTO_CONSTANTS.MAX_LINES_PER_BET} lines.`);
    }

    const stakeRes = this.validateStake(stakePesewas, config, totalLines);
    errors.push(...stakeRes.errors);

    let potentialPayout: Pesewas | null = null;
    if (config.multiplierConfig?.baseMultiplier) {
      potentialPayout = Math.round(
        totalLines * stakePesewas * config.multiplierConfig.baseMultiplier
      );
    } else {
      // Default fixed payout for single banker (GH₵ 880.00 = 88000 pesewas)
      potentialPayout = 88000;
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalLines,
      stakePerLinePesewas: stakePesewas,
      totalStakePesewas: stakeRes.totalStakePesewas,
      estimatedPotentialPayoutPesewas: potentialPayout,
      generatedLines: lines,
      normalizedSelections: { primary: bankers, secondary: mainSet },
    };
  }
}

export class AgainstStrategy extends BaseGameStrategy {
  readonly code = GameTypeCode.AGAINST;

  validateAndCalculate(
    selections: SelectionPayload,
    stakePesewas: Pesewas,
    config: GameTypeConfig
  ): ValidationResult {
    const errors: string[] = [];
    const group1 = (selections.primaryNumbers || []).sort((a, b) => a - b);
    const group2 = (selections.secondaryNumbers || []).sort((a, b) => a - b);

    errors.push(...this.validateNumberRange(group1));
    errors.push(...this.validateNumberRange(group2));

    if (group1.length === 0 || group2.length === 0) {
      errors.push("Against strategy requires non-empty selections in both Group 1 and Group 2.");
    }

    const overlap = group1.filter((n) => group2.includes(n));
    if (overlap.length > 0) {
      errors.push(
        `Group 1 and Group 2 numbers cannot overlap. Overlapping: ${overlap.map(formatLottoNumber).join(", ")}.`
      );
    }

    const rawPairs = CombinatoricsEngine.cartesianProduct(group1, group2);
    const lines = rawPairs.map(([a, b]) => [a, b].sort((x, y) => x - y));

    const totalLines = lines.length;
    if (totalLines > LOTTO_CONSTANTS.MAX_LINES_PER_BET) {
      errors.push(`Line limit exceeded. Maximum ${LOTTO_CONSTANTS.MAX_LINES_PER_BET} lines.`);
    }

    const stakeRes = this.validateStake(stakePesewas, config, totalLines);
    errors.push(...stakeRes.errors);

    let potentialPayout: Pesewas | null = null;
    if (config.multiplierConfig?.baseMultiplier) {
      potentialPayout = Math.round(
        totalLines * stakePesewas * config.multiplierConfig.baseMultiplier
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalLines,
      stakePerLinePesewas: stakePesewas,
      totalStakePesewas: stakeRes.totalStakePesewas,
      estimatedPotentialPayoutPesewas: potentialPayout,
      generatedLines: lines,
      normalizedSelections: { primary: group1, secondary: group2 },
    };
  }
}

export class LuckyStrategy extends BaseGameStrategy {
  readonly code = GameTypeCode.LUCKY;

  validateAndCalculate(
    selections: SelectionPayload,
    stakePesewas: Pesewas,
    config: GameTypeConfig
  ): ValidationResult {
    const errors: string[] = [];
    const primary = (selections.primaryNumbers || []).sort((a, b) => a - b);

    errors.push(...this.validateNumberRange(primary));

    if (primary.length < config.minSelections) {
      errors.push(`Lucky game requires at least ${config.minSelections} selections.`);
    }

    const totalLines = 1;
    const lines = [primary];
    const stakeRes = this.validateStake(stakePesewas, config, totalLines);
    errors.push(...stakeRes.errors);

    let potentialPayout: Pesewas | null = null;
    if (config.multiplierConfig?.baseMultiplier) {
      potentialPayout = Math.round(stakePesewas * config.multiplierConfig.baseMultiplier);
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalLines,
      stakePerLinePesewas: stakePesewas,
      totalStakePesewas: stakeRes.totalStakePesewas,
      estimatedPotentialPayoutPesewas: potentialPayout,
      generatedLines: lines,
      normalizedSelections: { primary },
    };
  }
}

// ============================================================================
// GAME TYPE REGISTRY & BOOKING CODE GENERATOR
// ============================================================================

export class GameTypeRegistry {
  private static strategies: Map<GameTypeCode, IGameTypeStrategy> = new Map();

  static register(strategy: IGameTypeStrategy): void {
    this.strategies.set(strategy.code, strategy);
  }

  static get(code: GameTypeCode): IGameTypeStrategy {
    const strategy = this.strategies.get(code);
    if (!strategy) {
      throw new Error(`Unsupported or unregistered game type strategy: ${code}`);
    }
    return strategy;
  }
}

GameTypeRegistry.register(new DirectStrategy());
GameTypeRegistry.register(new Perm2Strategy());
GameTypeRegistry.register(new Perm3Strategy());
GameTypeRegistry.register(new BankerStrategy());
GameTypeRegistry.register(new AgainstStrategy());
GameTypeRegistry.register(new LuckyStrategy());

export class BookingCodeGenerator {
  static generate(): string {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 8; i++) {
      const idx = Math.floor(Math.random() * chars.length);
      result += chars[idx];
    }
    return `GZ-${result}`;
  }
}

// ============================================================================
// ZOD VALIDATION & SERVER LOTTERY ENGINE
// ============================================================================

export const ValidateBetSlipSchema = z.object({
  gameId: z.string().uuid(),
  drawId: z.string().uuid(),
  gameTypeCode: z.nativeEnum(GameTypeCode),
  primaryNumbers: z.array(z.number().int().min(1).max(90)).min(1).max(25), // Updated to max 25
  secondaryNumbers: z.array(z.number().int().min(1).max(90)).optional(),
  stakePesewas: z.number().int().positive(),
  idempotencyKey: z.string().min(16).max(64).optional(),
});

export type ValidateBetSlipInput = z.infer<typeof ValidateBetSlipSchema>;

export class ServerLotteryEngine {
  static validateSelection(
    selections: SelectionPayload,
    stakePesewas: Pesewas,
    config: GameTypeConfig,
    drawClosingTimeUtc: Date,
    drawStatus: DrawStatus
  ): ValidationResult {
    const errors: string[] = [];
    const nowUtc = new Date();

    if (nowUtc >= drawClosingTimeUtc) {
      errors.push("The draw for this game has already closed. Ticket submission rejected.");
    }

    if (drawStatus !== DrawStatus.OPEN) {
      errors.push(`Draw is not accepting bets. Current status: ${drawStatus}.`);
    }

    const strategy = GameTypeRegistry.get(config.gameTypeCode);
    const result = strategy.validateAndCalculate(selections, stakePesewas, config);

    if (errors.length > 0) {
      return {
        ...result,
        isValid: false,
        errors: [...errors, ...result.errors],
      };
    }

    return result;
  }
}