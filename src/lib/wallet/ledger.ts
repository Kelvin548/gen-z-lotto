import { prisma } from "@/lib/db/prisma";
import {
  FinancialTransactionType,
  FinancialTransactionStatus,
  LedgerEntryDirection,
} from "@prisma/client";

export interface ExecuteTransactionParams {
  walletId: string;
  reference: string;
  type: FinancialTransactionType;
  grossAmountMinor: bigint;
  netAmountMinor: bigint;
  feeAmountMinor?: bigint;
  sourceAccount: string; // e.g., "USER_WALLET" or "EXTERNAL_PAYMENT_GATEWAY"
  destinationAccount: string; // e.g., "GAME_STAKE_POOL" or "USER_WALLET"
  description?: string;
}

/**
 * Executes an atomic financial transaction using a double-entry ledger system.
 * Follows strict ACID principles with database row locks (SELECT FOR UPDATE).
 */
export async function executeLedgerTransaction(params: ExecuteTransactionParams) {
  const {
    walletId,
    reference,
    type,
    grossAmountMinor,
    netAmountMinor,
    feeAmountMinor = BigInt(0),
    sourceAccount,
    destinationAccount,
    description,
  } = params;

  return await prisma.$transaction(async (tx) => {
    // 1. [DB Transaction Start] & Row Lock (SELECT FOR UPDATE)
    const wallet = await tx.$queryRaw<Array<{ id: string; user_id: string; available_balance_minor: bigint }>>`
      SELECT id, user_id, available_balance_minor 
      FROM wallets 
      WHERE id = ${walletId} 
      FOR UPDATE
    `;

    if (!wallet || wallet.length === 0) {
      throw new Error(`Wallet not found: ${walletId}`);
    }

    const currentBalance = wallet[0].available_balance_minor;
    const userId = wallet[0].user_id;

    // Check if user has sufficient funds if debiting the user wallet
    if (sourceAccount === "USER_WALLET" && currentBalance < netAmountMinor) {
      throw new Error("Insufficient wallet balance");
    }

    // 2. Create Transaction Record on FinancialTransaction Model (Status: PENDING)
    const transaction = await tx.financialTransaction.create({
      data: {
        reference,
        type,
        status: FinancialTransactionStatus.PENDING,
        amountMinor: netAmountMinor,
        currency: "GHS",
        ...(userId ? { actorId: userId } : {}),
      } as any,
    });

    // 3. Create Double-Entry Ledger Entries
    // Entry 1: Debit Source Account
    await tx.ledgerEntry.create({
      data: {
        walletId,
        transactionId: transaction.id,
        accountName: sourceAccount,
        direction: LedgerEntryDirection.DEBIT,
        amountMinor: netAmountMinor,
      } as any,
    });

    // Entry 2: Credit Destination Account
    await tx.ledgerEntry.create({
      data: {
        walletId,
        transactionId: transaction.id,
        accountName: destinationAccount,
        direction: LedgerEntryDirection.CREDIT,
        amountMinor: netAmountMinor,
      } as any,
    });

    // 4. Update Wallet Balance Atomically
    let newBalance = currentBalance;
    if (sourceAccount === "USER_WALLET") {
      newBalance -= netAmountMinor;
    } else if (destinationAccount === "USER_WALLET") {
      newBalance += netAmountMinor;
    }

    await tx.wallet.update({
      where: { id: walletId },
      data: { availableBalanceMinor: newBalance },
    });

    // 5. Mark Transaction Status: COMPLETED
    const completedTx = await tx.financialTransaction.update({
      where: { id: transaction.id },
      data: { status: FinancialTransactionStatus.COMPLETED },
    });

    // 6. [DB Commit] happens automatically if no error was thrown
    return completedTx;
  });
}