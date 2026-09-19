import { PrismaClient, WalletStatus } from "@prisma/client";
import { WalletService } from "../src/services/wallet.service";

const prisma = new PrismaClient();

describe("Demo Deposit Endpoint Integration & Double-Entry Integrity", () => {
  let testUserId: string;
  let testWalletId: string;

  beforeAll(async () => {
    // Clear lingering ledger entries and test users to ensure isolation
    await prisma.ledgerEntry.deleteMany({});
    await prisma.financialTransaction.deleteMany({});
    await prisma.user.deleteMany({
      where: { phoneNumber: "+233888888888" },
    });

    const user = await prisma.user.create({
      data: {
        phoneNumber: "+233888888888",
        passwordHash: "test_password_hash",
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

    testUserId = user.id;
    testWalletId = user.wallet!.id;
  });

  afterAll(async () => {
    await prisma.ledgerEntry.deleteMany({});
    await prisma.financialTransaction.deleteMany({});
    await prisma.user.deleteMany({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  test("Should execute demo deposit, update wallet, and record balanced double-entry ledger", async () => {
    const depositAmount = 10000n;
    const ref = `TEST-DEMO-${Date.now()}`;

    const { updatedWallet, transaction } = await prisma.$transaction(async (tx) => {
      const result = await WalletService.creditWallet(
        testUserId,
        depositAmount,
        "DEPOSIT",
        ref,
        tx
      );

      return result;
    });

    expect(updatedWallet.availableBalanceMinor).toBe(10000n);

    // Fetch ledger entries specifically for this test wallet
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: {
        walletId: testWalletId,
      },
    });

    expect(ledgerEntries.length).toBeGreaterThan(0);

    const credits = ledgerEntries
      .filter((e) => e.direction === "CREDIT")
      .reduce((sum, e) => sum + e.amountMinor, 0n);

    expect(credits).toBe(depositAmount);
  });
});