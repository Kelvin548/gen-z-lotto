import { 
  ServerLotteryEngine, 
  GameTypeConfig, 
  SelectionPayload, 
  Pesewas, 
  DrawStatus, 
  ValidationResult, 
  GameTypeCode 
} from "./game-engine";

export interface TicketValidationContext {
  gameId: string;
  drawId: string;
  gameTypeCode: GameTypeCode;
  selections: SelectionPayload;
  stakePesewas: Pesewas;
  config: GameTypeConfig;
  drawClosingTimeUtc: Date;
  drawStatus: DrawStatus;
  userBalancePesewas: Pesewas;
}

export interface TicketValidationOutput extends ValidationResult {
  hasSufficientBalance: boolean;
  balanceDeficitPesewas: number;
}

export class TicketValidator {
  /**
   * Performs full end-to-end validation of a ticket before persistence and wagering.
   */
  static validateTicket(context: TicketValidationContext): TicketValidationOutput {
    // 1. Run the core server lottery engine checks (game rules, combinatorics, draw closing time, status)
    const engineResult = ServerLotteryEngine.validateSelection(
      context.selections,
      context.stakePesewas,
      context.config,
      context.drawClosingTimeUtc,
      context.drawStatus
    );

    // 2. Check wallet balance requirements
    const totalStake = engineResult.totalStakePesewas;
    const hasSufficientBalance = context.userBalancePesewas >= totalStake;
    const balanceDeficitPesewas = hasSufficientBalance ? 0 : totalStake - context.userBalancePesewas;

    const errors = [...engineResult.errors];

    if (!hasSufficientBalance) {
      errors.push(
        `Insufficient wallet balance. Required: ${totalStake} pesewas, Available: ${context.userBalancePesewas} pesewas.`
      );
    }

    return {
      ...engineResult,
      isValid: engineResult.isValid && hasSufficientBalance,
      errors,
      hasSufficientBalance,
      balanceDeficitPesewas,
    };
  }
}