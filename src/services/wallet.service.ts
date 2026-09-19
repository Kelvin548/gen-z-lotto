import {
  PrismaClient,
  FinancialTransactionType,
  FinancialTransactionStatus,
  LedgerEntryDirection,
  WalletStatus,
} from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class WalletService {
  /**
   * 1. CREDIT WALLET
   */
  static async creditWallet(
    userId: string,
    amountMinor: bigint,
    type: FinancialTransactionType,
    reference: string,
    providerRefOrOptions?: any,
    idempotencyKeyOrOptions?: any
  ) {
    const providerRef = typeof providerRefOrOptions === 'string' ? providerRefOrOptions : providerRefOrOptions?.providerRef;
    const options = typeof providerRefOrOptions === 'object' ? providerRefOrOptions : idempotencyKeyOrOptions;

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error(`Wallet not found for user: ${userId}`);
      }

      if (wallet.status !== WalletStatus.ACTIVE) {
        throw new Error(`Wallet is not active for user: ${userId}`);
      }

      const existingTx = await tx.financialTransaction.findUnique({
        where: { reference },
      });

      if (existingTx && existingTx.status === FinancialTransactionStatus.COMPLETED) {
        return Object.assign(existingTx, {
          transaction: existingTx,
          updatedWallet: wallet,
          status: existingTx.status,
          id: existingTx.id,
          availableBalanceMinor: wallet.availableBalanceMinor,
        });
      }

      const transaction = await tx.financialTransaction.upsert({
        where: { reference },
        update: {
          status: FinancialTransactionStatus.COMPLETED,
          providerRef: providerRef ?? options?.providerRef,
          paymentProvider: options?.paymentProvider,
          metadata: options?.metadata ?? undefined,
        },
        create: {
          reference,
          type,
          status: FinancialTransactionStatus.COMPLETED,
          amountMinor,
          actorId: userId,
          currency: wallet.currency,
          providerRef: providerRef ?? options?.providerRef,
          paymentProvider: options?.paymentProvider,
          metadata: options?.metadata ?? undefined,
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalanceMinor: {
            increment: amountMinor,
          },
        },
      });

      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          walletId: wallet.id,
          direction: LedgerEntryDirection.CREDIT,
          amountMinor,
          currency: wallet.currency,
          description: `Wallet credited via ${type.toLowerCase()}`,
        },
      });

      return Object.assign(transaction, {
        transaction,
        updatedWallet,
        status: transaction.status,
        id: transaction.id,
        availableBalanceMinor: updatedWallet?.availableBalanceMinor ?? wallet.availableBalanceMinor,
      });
    });
  }

  /**
   * 2. DEBIT WALLET
   */
  static async debitWallet(
    userId: string,
    amountMinor: bigint,
    type: FinancialTransactionType,
    reference: string,
    providerRefOrOptions?: any,
    idempotencyKeyOrOptions?: any
  ) {
    const providerRef = typeof providerRefOrOptions === 'string' ? providerRefOrOptions : providerRefOrOptions?.providerRef;
    const options = typeof providerRefOrOptions === 'object' ? providerRefOrOptions : idempotencyKeyOrOptions;

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.status !== WalletStatus.ACTIVE) {
        throw new Error(`Active wallet not found for user: ${userId}`);
      }
      if (wallet.availableBalanceMinor < amountMinor) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalanceMinor: { decrement: amountMinor },
          heldBalanceMinor: { increment: amountMinor },
        },
      });

      const transaction = await tx.financialTransaction.create({
        data: {
          reference,
          type,
          status: FinancialTransactionStatus.PENDING,
          amountMinor,
          actorId: userId,
          currency: wallet.currency,
          providerRef,
          metadata: options?.metadata,
        },
      });

      return Object.assign(transaction, {
        transaction,
        updatedWallet,
        status: transaction.status,
        id: transaction.id,
        availableBalanceMinor: updatedWallet?.availableBalanceMinor ?? wallet.availableBalanceMinor,
      });
    });
  }

  /**
   * 3. HOLD FUNDS (Explicit Standalone Method for Tickets & Game Stakes)
   */
  static async holdFunds(
    userId: string,
    amountMinor: bigint,
    reference: string,
    options?: any
  ) {
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.status !== WalletStatus.ACTIVE) {
        throw new Error(`Active wallet not found for user: ${userId}`);
      }
      if (wallet.availableBalanceMinor < amountMinor) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalanceMinor: { decrement: amountMinor },
          heldBalanceMinor: { increment: amountMinor },
        },
      });

      const transaction = await tx.financialTransaction.create({
        data: {
          reference,
          type: FinancialTransactionType.BET_STAKE,
          status: FinancialTransactionStatus.PENDING,
          amountMinor,
          actorId: userId,
          currency: wallet.currency,
          metadata: options?.metadata,
        },
      });

      return Object.assign(transaction, {
        transaction,
        updatedWallet,
        status: transaction.status,
        id: transaction.id,
        availableBalanceMinor: updatedWallet?.availableBalanceMinor ?? wallet.availableBalanceMinor,
      });
    });
  }

  /**
   * 4. DEDUCT STAKE
   */
  static async deductStake(
    userId: string,
    amountMinor: bigint,
    reference: string,
    options?: any
  ) {
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new Error(`Wallet not found for user: ${userId}`);

      if (wallet.availableBalanceMinor < amountMinor) {
        throw new Error('Insufficient wallet balance to place stake.');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalanceMinor: { decrement: amountMinor },
        },
      });

      const transaction = await tx.financialTransaction.create({
        data: {
          reference,
          type: FinancialTransactionType.BET_STAKE,
          status: FinancialTransactionStatus.COMPLETED,
          amountMinor,
          actorId: userId,
          currency: wallet.currency,
          metadata: options?.metadata,
        },
      });

      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          walletId: wallet.id,
          direction: LedgerEntryDirection.DEBIT,
          amountMinor,
          currency: wallet.currency,
          description: `Stake deduction (${reference})`,
        },
      });

      return Object.assign(transaction, {
        transaction,
        updatedWallet,
        status: transaction.status,
        id: transaction.id,
        availableBalanceMinor: updatedWallet?.availableBalanceMinor ?? wallet.availableBalanceMinor,
      });
    });
  }

  /**
   * 5. FULFILL WITHDRAWAL
   */
  static async fulfillWithdrawal(
    userId: string,
    amountMinor: bigint,
    reference: string,
    providerRefOrOptions?: any,
    idempotencyKeyOrOptions?: any
  ) {
    const options = typeof providerRefOrOptions === 'object' ? providerRefOrOptions : idempotencyKeyOrOptions;

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error(`Wallet not found for user: ${userId}`);
      }

      const finTx = await tx.financialTransaction.findUnique({
        where: { reference },
      });

      if (!finTx) {
        throw new Error(`Financial transaction not found for reference: ${reference}`);
      }

      if (finTx.status === FinancialTransactionStatus.COMPLETED) {
        return Object.assign(finTx, {
          transaction: finTx,
          updatedWallet: wallet,
          status: finTx.status,
          id: finTx.id,
          availableBalanceMinor: wallet.availableBalanceMinor,
        });
      }

      const updatedFinTx = await tx.financialTransaction.update({
        where: { id: finTx.id },
        data: {
          status: FinancialTransactionStatus.COMPLETED,
          providerRef: options?.providerRef,
          paymentProvider: options?.paymentProvider,
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          heldBalanceMinor: {
            decrement: amountMinor,
          },
        },
      });

      await tx.ledgerEntry.create({
        data: {
          transactionId: updatedFinTx.id,
          walletId: wallet.id,
          direction: LedgerEntryDirection.DEBIT,
          amountMinor,
          currency: wallet.currency,
          description: `Withdrawal transfer fulfilled (${reference})`,
        },
      });

    return Object.assign(updatedFinTx, {
        transaction: updatedFinTx,
        updatedWallet,
        status: updatedFinTx.status,
        id: updatedFinTx.id,
        availableBalanceMinor: updatedWallet?.availableBalanceMinor ?? wallet.availableBalanceMinor,
      });
    });
  }

  /**
   * 6. CANCEL WITHDRAWAL
   */
  static async cancelWithdrawal(
    userId: string,
    amountMinor: bigint,
    reference?: string,
    providerRefOrOptions?: any,
    idempotencyKeyOrOptions?: any
  ) {
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error(`Wallet not found for user: ${userId}`);
      }

      let finTx: any = null;
      if (reference) {
        finTx = await tx.financialTransaction.findUnique({
          where: { reference },
        });

        if (finTx) {
          await tx.financialTransaction.update({
            where: { id: finTx.id },
            data: { status: FinancialTransactionStatus.FAILED },
          });
        }
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          heldBalanceMinor: {
            decrement: amountMinor,
          },
          availableBalanceMinor: {
            increment: amountMinor,
          },
        },
      });

      const transaction = finTx || { id: 'cancelled', status: FinancialTransactionStatus.FAILED };
      return Object.assign(transaction, {
        transaction,
        updatedWallet,
        status: transaction.status,
        id: transaction.id,
        availableBalanceMinor: updatedWallet?.availableBalanceMinor ?? wallet.availableBalanceMinor,
      });
    });
  }
}