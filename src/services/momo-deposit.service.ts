import { PrismaClient, FinancialTransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class MoMoDepositService {
  static async processPaymentResult(
    reference: string,
    verifiedResult: any,
    _provider: any
  ) {
    return await prisma.$transaction(async (tx: any) => {
      // 1. Fetch transaction with deposit relation
      const transaction = (await tx.financialTransaction.findUnique({
        where: { reference },
        include: { deposit: true },
      })) as any;

      if (!transaction) {
        throw new Error('TRANSACTION_NOT_FOUND');
      }

      const deposit = transaction.deposit;
      if (!deposit || !deposit.walletId) {
        throw new Error('WALLET_NOT_FOUND_FOR_DEPOSIT');
      }
      const walletId = deposit.walletId;

      // 2. Strict Idempotency: Prevent re-processing if already terminal
      if (
        transaction.status === FinancialTransactionStatus.COMPLETED ||
        transaction.status === FinancialTransactionStatus.FAILED
      ) {
        return { transaction, idempotencyIgnored: true };
      }

      // 3. Verify amount match expectation securely using BigInt
      const txAmount = BigInt(transaction.amountMinor);
      const verifiedAmount = BigInt(verifiedResult.amountMinor);

      if (txAmount !== verifiedAmount) {
        await tx.financialTransaction.update({
          where: { id: transaction.id },
          data: {
            status: FinancialTransactionStatus.FAILED,
            metadata: { error: 'MISMATCHED_AMOUNT' },
          },
        });
        throw new Error('PAYMENT_VERIFICATION_MISMATCH');
      }

      // 4. If status is FAILED from provider
      if (verifiedResult.status === 'FAILED') {
        const updated = await tx.financialTransaction.update({
          where: { id: transaction.id },
          data: {
            status: FinancialTransactionStatus.FAILED,
            providerRef: verifiedResult.financialTransactionId,
            metadata: { reason: verifiedResult.reason || 'PROVIDER_FAILED' },
          },
        });
        return { transaction: updated, idempotencyIgnored: false };
      }

      // 5. If status is SUCCESS/COMPLETED from provider
      if (verifiedResult.status === 'SUCCESS' || verifiedResult.status === 'COMPLETED') {
        const updatedTx = await tx.financialTransaction.update({
          where: { id: transaction.id },
          data: {
            status: FinancialTransactionStatus.COMPLETED,
            providerRef: verifiedResult.financialTransactionId,
            metadata: { verifiedAt: new Date().toISOString() },
          },
        });

        // Credit Wallet strictly once using BigInt minor units
        const updatedWallet = await tx.wallet.update({
          where: { id: walletId },
          data: { availableBalanceMinor: { increment: txAmount } },
        });

        // Record Double-Entry Ledger safely
        const { LedgerService } = await import('@/services/ledger.service');
        await LedgerService.recordEntry({
          transactionId: transaction.id,
          walletId: walletId,
          debitAccount: 'SYSTEM_MOMO_ESCROW',
          creditAccount: 'CUSTOMER_WALLET',
          amountMinor: txAmount,
          tx,
        });

        return { transaction: updatedTx, wallet: updatedWallet, idempotencyIgnored: false };
      }

      return { transaction, idempotencyIgnored: false };
    });
  }
}