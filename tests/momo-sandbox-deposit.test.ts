import { PrismaClient } from "@prisma/client";
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { prisma } from '@/services/wallet.service';
import { MoMoDepositService } from '@/services/momo-deposit.service';

describe('MoMo Sandbox Deposit & Idempotency Tests', () => {
  let userId: string;
  let userWalletId: string;
  // Declare reference at the suite level so it is shared between tests
  const reference = `MOMO-REF-${Date.now()}`;

  beforeAll(async () => {
    await prisma.$transaction([
      prisma.ledgerEntry.deleteMany(),
      prisma.deposit.deleteMany(),
      prisma.auditLog.deleteMany(),
      prisma.financialTransaction.deleteMany(),
      prisma.ticketLine.deleteMany(),
      prisma.ticket.deleteMany(),
      prisma.draw.deleteMany(),
      prisma.wallet.deleteMany(),
      prisma.userProfile.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    const user = await prisma.user.create({
      data: {
        phoneNumber: '0249876543',
        passwordHash: 'hashed_password',
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
        profile: {
          create: { fullName: 'MoMo Tester' },
        },
        wallet: {
          create: { availableBalanceMinor: 0n },
        },
      },
      include: { wallet: true },
    });

    userId = user.id;
    userWalletId = user.wallet!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Successfully processes a verified successful MoMo deposit', async () => {
    const amountMinor = 5000n; // 50 GHS

    // Create financial transaction first
    const financialTx = await prisma.financialTransaction.create({
      data: {
        type: 'DEPOSIT',
        status: 'PENDING',
        amountMinor,
        reference,
        actorId: userId,
      },
    });

    // Create deposit record separately with walletId and transactionId
    await prisma.deposit.create({
      data: ({
        provider: 'MTN_MOMO',
        amountMinor,
        status: 'PENDING',
        walletId: userWalletId,
        transactionId: financialTx.id,
        userId: userId,
      } as any),
    });

    const verifiedResult = {
      status: 'SUCCESS',
      amountMinor: Number(amountMinor),
      financialTransactionId: 'PROV-TX-999',
    };

    const result = await MoMoDepositService.processPaymentResult(reference, verifiedResult, null);

    expect(result.idempotencyIgnored).toBe(false);
    expect(result.transaction.status).toBe('COMPLETED');

    const walletAfter = await prisma.wallet.findUnique({ where: { id: userWalletId } });
    expect(walletAfter?.availableBalanceMinor).toBe(amountMinor);
  });

  it('2. Enforces strict idempotency when processing the same successful transaction twice', async () => {
    const walletBefore = await prisma.wallet.findUnique({ where: { id: userWalletId } });

    const verifiedResult = {
      status: 'SUCCESS',
      amountMinor: 5000,
      financialTransactionId: 'PROV-TX-999',
    };

    // Re-processing the exact same reference stored from test 1
    const resultSecond = await MoMoDepositService.processPaymentResult(reference, verifiedResult, null);
    expect(resultSecond.idempotencyIgnored).toBe(true);

    const walletAfterSecond = await prisma.wallet.findUnique({ where: { id: userWalletId } });
    expect(walletAfterSecond?.availableBalanceMinor).toBe(walletBefore?.availableBalanceMinor);
  });
});