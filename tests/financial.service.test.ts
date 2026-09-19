import { PrismaClient, FinancialTransactionType, LedgerEntryDirection, WalletStatus } from '@prisma/client';
import { LedgerService } from '../src/services/ledger.service';
import { WalletService } from '../src/services/wallet.service';

const prisma = new PrismaClient();

describe('Phase 5 Financial Engine - Ledger & Wallet Service Integration Tests', () => {
  let testUserId: string;
  let testWalletId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { phoneNumber: '+233999999999' },
    });

    const testUser = await prisma.user.create({
      data: {
        phoneNumber: '+233999999999',
        passwordHash: 'hashed_password_for_testing',
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
        wallet: {
          create: {
            availableBalanceMinor: 0n,
            heldBalanceMinor: 0n,
            status: WalletStatus.ACTIVE,
          },
        },
      },
      include: { wallet: true },
    });

    testUserId = testUser.id;
    testWalletId = testUser.wallet!.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  describe('LedgerService Double-Entry Integrity', () => {
    test('Should reject unbalanced transactions (Debits != Credits)', async () => {
      const unbalancedEntries = [
        {
          walletId: testWalletId,
          direction: LedgerEntryDirection.CREDIT,
          amountMinor: 1000n,
          description: 'Credit 10.00 GHS',
        },
        {
          walletId: null,
          direction: LedgerEntryDirection.DEBIT,
          amountMinor: 500n,
          description: 'Debit 5.00 GHS',
        },
      ];

      await expect(
        LedgerService.recordTransaction(
          FinancialTransactionType.DEPOSIT,
          1000n,
          unbalancedEntries,
          { actorId: testUserId }
        )
      ).rejects.toThrow(/Unbalanced ledger transaction/);
    });

    test('Should record balanced double-entry transaction successfully', async () => {
      const depositAmount = 5000n;
      const balancedEntries = [
        {
          walletId: testWalletId,
          direction: LedgerEntryDirection.CREDIT,
          amountMinor: depositAmount,
          description: 'Deposit Credit',
        },
        {
          walletId: null,
          direction: LedgerEntryDirection.DEBIT,
          amountMinor: depositAmount,
          description: 'Payment Gateway Offset',
        },
      ];

      const txHeader = await LedgerService.recordTransaction(
        FinancialTransactionType.DEPOSIT,
        depositAmount,
        balancedEntries,
        { actorId: testUserId, reference: `TEST-DEP-${Date.now()}` }
      );

      expect(txHeader).toBeDefined();
      expect(txHeader.amountMinor).toBe(depositAmount);

      const entries = await prisma.ledgerEntry.findMany({
        where: { transactionId: txHeader.id },
      });

      expect(entries).toHaveLength(2);
    });
  });

  describe('WalletService Operations', () => {
    test('Should credit user wallet balance accurately', async () => {
      const creditAmount = 10000n;
      const { updatedWallet } = await WalletService.creditWallet(
        testUserId,
        creditAmount,
        FinancialTransactionType.DEPOSIT,
        `TEST-CRED-${Date.now()}`
      );

      expect(updatedWallet.availableBalanceMinor).toBe(10000n);
    });

    test('Should reject stake deduction on insufficient balance', async () => {
      const excessiveStake = 20000n;
      await expect(
        WalletService.deductStake(testUserId, excessiveStake, `TICKET-FAIL-${Date.now()}`)
      ).rejects.toThrow('Insufficient wallet balance to place stake.');
    });

    test('Should deduct stake and update ledger on sufficient balance', async () => {
      const validStake = 2500n;
      const ticketId = `TICKET-PASS-${Date.now()}`;

      const { updatedWallet } = await WalletService.deductStake(testUserId, validStake, ticketId);

      expect(updatedWallet.availableBalanceMinor).toBe(7500n);
    });
  });
});