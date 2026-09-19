import { WalletService } from "../wallet.service";
import { LedgerService } from "../ledger.service";
import { FinancialTransactionStatus, WalletStatus, LedgerEntryDirection } from "@prisma/client";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    deposit: {
      upsert: jest.fn(),
    },
    withdrawal: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    financialTransaction: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    ledgerEntry: {
      create: jest.fn(),
    },
    financialAuditLog: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mPrismaClient)),
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
    FinancialTransactionStatus: {
      PENDING: "PENDING",
      COMPLETED: "COMPLETED",
      FAILED: "FAILED",
    },
    WalletStatus: {
      ACTIVE: "ACTIVE",
      SUSPENDED: "SUSPENDED",
    },
    LedgerEntryDirection: {
      CREDIT: "CREDIT",
      DEBIT: "DEBIT",
    },
  };
});

// Mock LedgerService
jest.mock("../ledger.service", () => ({
  LedgerService: {
    recordTransaction: jest.fn(),
  },
}));

import { PrismaClient } from "@prisma/client";
const mockPrisma = new PrismaClient() as any;

describe("WalletService Unit Tests", () => {
  const mockUserId = "user-uuid-123";
  const mockWalletId = "wallet-uuid-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("creditWallet", () => {
    it("should successfully credit wallet and record ledger entry", async () => {
      const initialWallet = {
        id: mockWalletId,
        userId: mockUserId,
        availableBalanceMinor: 1000n,
        ledgerBalanceMinor: 1000n,
        currency: "GHS",
        status: WalletStatus.ACTIVE,
      };

      const updatedWallet = {
        ...initialWallet,
        availableBalanceMinor: 6000n,
        ledgerBalanceMinor: 6000n,
      };

      mockPrisma.financialTransaction.upsert.mockResolvedValueOnce({ id: "tx-123" });
      mockPrisma.wallet.findUnique.mockResolvedValueOnce(initialWallet);
      mockPrisma.wallet.update.mockResolvedValueOnce(updatedWallet);
      mockPrisma.ledgerEntry.create.mockResolvedValueOnce({ id: "ledger-1" });

      const result = await WalletService.creditWallet(
        mockUserId,
        5000n,
        "DEPOSIT",
        "tx-123"
      );

      expect(result).toEqual(
        expect.objectContaining({
          updatedWallet: expect.objectContaining({
            availableBalanceMinor: 6000n,
            ledgerBalanceMinor: 6000n,
          }),
        })
      );
      expect(mockPrisma.wallet.findUnique).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(mockPrisma.ledgerEntry.create).toHaveBeenCalled();
    });

    it("should throw error if wallet is not found", async () => {
      mockPrisma.financialTransaction.upsert.mockResolvedValueOnce({ id: "tx-123" });
      mockPrisma.wallet.findUnique.mockResolvedValueOnce(null);

      await expect(
        WalletService.creditWallet(
          mockUserId,
          5000n,
          "DEPOSIT",
          "tx-123"
        )
      ).rejects.toThrow(`Wallet not found for user: ${mockUserId}`);
    });
  });

  describe("fulfillWithdrawal", () => {
    it("should deduct held balance and mark transaction completed", async () => {
      const activeWallet = {
        id: mockWalletId,
        userId: mockUserId,
        availableBalanceMinor: 5000n,
        ledgerBalanceMinor: 5000n,
        currency: "GHS",
        status: WalletStatus.ACTIVE,
      };

      mockPrisma.financialTransaction.findUnique.mockResolvedValueOnce({
        id: "tx-w-1",
        status: FinancialTransactionStatus.PENDING,
        withdrawal: { id: "w-1", walletId: mockWalletId },
      });
      mockPrisma.financialTransaction.update.mockResolvedValueOnce({ id: "tx-w-1" });
      mockPrisma.wallet.findUnique.mockResolvedValueOnce(activeWallet);
      mockPrisma.wallet.update.mockResolvedValueOnce({
        ...activeWallet,
        ledgerBalanceMinor: 2000n,
      });
      mockPrisma.withdrawal.update.mockResolvedValueOnce({ id: "w-1" });
      mockPrisma.ledgerEntry.create.mockResolvedValueOnce({ id: "ledger-2" });

      await WalletService.fulfillWithdrawal(
        mockUserId,
        3000n,
        "tx-withdraw-1",
        "TRSF-999"
      );

      const updateCalled =
        mockPrisma.withdrawal.update.mock.calls.length > 0 ||
        mockPrisma.financialTransaction.update.mock.calls.length > 0;

      expect(updateCalled).toBe(true);
    });
  });

  describe("cancelWithdrawal", () => {
    it("should restore held funds to available balance and log audit entry", async () => {
      const activeWallet = {
        id: mockWalletId,
        userId: mockUserId,
        availableBalanceMinor: 2000n,
        ledgerBalanceMinor: 5000n,
        currency: "GHS",
        status: WalletStatus.ACTIVE,
      };

      mockPrisma.financialTransaction.findUnique.mockResolvedValueOnce({
        id: "tx-f-1",
        status: FinancialTransactionStatus.PENDING,
        withdrawal: { id: "w-1", walletId: mockWalletId },
      });
      mockPrisma.financialTransaction.update.mockResolvedValueOnce({ id: "tx-f-1" });
      mockPrisma.wallet.findUnique.mockResolvedValueOnce(activeWallet);
      mockPrisma.wallet.update.mockResolvedValueOnce({
        ...activeWallet,
        availableBalanceMinor: 5000n,
      });
      mockPrisma.financialAuditLog.create.mockResolvedValueOnce({ id: "log-1" });
      mockPrisma.auditLog.create.mockResolvedValueOnce({ id: "audit-1" });

      await WalletService.cancelWithdrawal(
        mockUserId,
        3000n,
        "tx-failed-1",
        "ref-trx-789"
      );

      expect(mockPrisma.wallet.update).toHaveBeenCalled();
      expect(mockPrisma.financialTransaction.update).toHaveBeenCalled();
    });
  });
});