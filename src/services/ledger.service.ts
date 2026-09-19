import { PrismaClient, Prisma, FinancialTransactionType, FinancialTransactionStatus, LedgerEntryDirection } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Type alias for Prisma's interactive transaction client
export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export interface LedgerEntryInput {
  walletId?: string | null;
  direction: LedgerEntryDirection;
  amountMinor: bigint;
  description: string;
}

export class LedgerService {
  /**
   * Post an atomic double-entry transaction.
   * Ensures sum of DEBITS equals sum of CREDITS.
   */
  static async recordTransaction(
    type: FinancialTransactionType,
    amountMinor: bigint,
    entries: LedgerEntryInput[],
    options?: {
      reference?: string;
      idempotencyKey?: string;
      actorId?: string;
      ticketId?: string;
      metadata?: Prisma.InputJsonValue;
    },
    txClient?: TransactionClient
  ) {
    const reference = options?.reference || `TX-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Validate double-entry balance
    let totalDebit = 0n;
    let totalCredit = 0n;

    for (const entry of entries) {
      if (entry.direction === LedgerEntryDirection.DEBIT) {
        totalDebit += entry.amountMinor;
      } else {
        totalCredit += entry.amountMinor;
      }
    }

    if (totalDebit !== totalCredit) {
      throw new Error(`Unbalanced ledger transaction: Total Debits (${totalDebit}) must equal Total Credits (${totalCredit})`);
    }

    const execute = async (tx: TransactionClient) => {
      // Create Financial Transaction Header
      const transaction = await tx.financialTransaction.create({
        data: {
          type,
          status: FinancialTransactionStatus.COMPLETED,
          amountMinor,
          reference,
          idempotencyKey: options?.idempotencyKey || null,
          actorId: options?.actorId || null,
          ticketId: options?.ticketId || null,
          metadata: options?.metadata ?? Prisma.JsonNull,
        },
      });

      // Create Individual Ledger Entries
      for (const entry of entries) {
        await tx.ledgerEntry.create({
          data: {
            transactionId: transaction.id,
            walletId: entry.walletId || null,
            direction: entry.direction,
            amountMinor: entry.amountMinor,
            description: entry.description,
          },
        });
      }

      return transaction;
    };

    // Use passed transaction client if present, otherwise start new transaction
    if (txClient) {
      return await execute(txClient);
    } else {
      return await prisma.$transaction(execute);
    }
  }

  /**
   * Compatibility wrapper for single/escrow ledger entry postings (used by MoMoDepositService & tests)
   */
  static async recordEntry(params: {
    transactionId: string;
    walletId?: string | null;
    debitAccount?: string;
    creditAccount?: string;
    direction?: LedgerEntryDirection;
    amountMinor: bigint;
    currency?: string;
    description?: string;
    tx?: TransactionClient;
  }) {
    const db = params.tx || prisma;
    const direction = params.direction || (params.creditAccount ? LedgerEntryDirection.CREDIT : LedgerEntryDirection.DEBIT);
    
    return await db.ledgerEntry.create({
      data: {
        transactionId: params.transactionId,
        walletId: params.walletId || null,
        direction,
        amountMinor: params.amountMinor,
        description: params.description || `Ledger entry: ${params.debitAccount || 'SYSTEM'} -> ${params.creditAccount || 'WALLET'}`,
      },
    });
  }
}