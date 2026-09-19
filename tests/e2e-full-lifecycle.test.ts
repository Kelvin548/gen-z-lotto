import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { DrawSettlementService } from '@/services/draw-settlement.service';

const prisma = new PrismaClient();

describe('PHASE 5 E2E Lifecycle — Customer to Draw Settlement', () => {
  let userId: string;
  let adminUserId: string;
  let userPhone = '0241234567';
  let userWalletId: string;
  let gameId: string;
  let gameTypeId: string;
  let drawId: string;
  let ticketId: string;

  beforeAll(async () => {
    // Teardown test state safely in correct relational order (children first)
    await prisma.$transaction([
      prisma.ledgerEntry.deleteMany(),
      prisma.winningNumber.deleteMany(),
      prisma.auditLog.deleteMany(),
      prisma.financialTransaction.deleteMany(),
      prisma.deposit.deleteMany(),
      prisma.ticketLine.deleteMany(),
      prisma.ticket.deleteMany(),
      prisma.draw.deleteMany(),
      prisma.gameType.deleteMany(),
      prisma.game.deleteMany(),
      prisma.wallet.deleteMany(),
      prisma.userProfile.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    // Create Admin User directly via Prisma
    const adminUser = await prisma.user.create({
      data: {
        phoneNumber: '0240000000',
        passwordHash: 'hashed_admin_password',
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
        profile: {
          create: {
            fullName: 'System Admin',
          },
        },
      },
    });
    adminUserId = adminUser.id;

    // Create a default Game and GameType for testing draws & tickets
    const game = await prisma.game.create({
      data: {
        name: 'Direct 2 Lotto',
        slug: 'direct-2-lotto',
        description: 'Standard 5/90 Direct 2 Game',
        gameTypes: {
          create: {
            name: 'Direct 2',
            slug: 'direct-2',
            minSelection: 2,
            maxSelection: 2,
            multiplier: 240,
          },
        },
      },
      include: { gameTypes: true },
    });
    gameId = game.id;
    gameTypeId = game.gameTypes[0].id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Customer Registration & Wallet Initialization', async () => {
    const user = await prisma.user.create({
      data: {
        phoneNumber: userPhone,
        passwordHash: 'hashed_user_password',
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
        profile: {
          create: {
            fullName: 'Test Customer',
          },
        },
      },
    });
    expect(user.id).toBeDefined();
    userId = user.id;

    const wallet = await prisma.wallet.create({
      data: {
        userId: userId,
        availableBalanceMinor: 0n,
      },
    });
    expect(wallet).toBeDefined();
    userWalletId = wallet.id;
  });

  it('2. Demo Deposit & Financial Ledger Verification', async () => {
    const depositAmountMinor = 10000n; // 100 GHS in minor units
    const reference = `DEMO-DEPT-${Date.now()}`;
    
    // Create the Deposit with the required user and wallet relation connections
    const deposit = await prisma.deposit.create({
      data: {
        provider: 'MTN_MOMO',
        amountMinor: depositAmountMinor,
        status: 'COMPLETED',
        user: {
          connect: { id: userId },
        },
        wallet: {
          connect: { id: userWalletId },
        },
        transaction: {
          create: {
            type: 'DEPOSIT',
            status: 'COMPLETED',
            amountMinor: depositAmountMinor,
            reference: reference,
            actorId: userId,
          },
        },
      },
      include: { transaction: true },
    });

    // Increment wallet balance
    await prisma.wallet.update({
      where: { id: userWalletId },
      data: { availableBalanceMinor: { increment: depositAmountMinor } },
    });

    expect(deposit.transaction?.id).toBeDefined();

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    expect(wallet?.availableBalanceMinor).toBe(10000n);
  });

  it('3. Select Draw, Game & Book Ticket', async () => {
    const draw = await prisma.draw.create({
      data: {
        gameId: gameId,
        drawNumber: `DRAW-${Date.now()}`,
        scheduledAt: new Date(Date.now() + 1800000),
        status: 'SCHEDULED',
      },
    });
    drawId = draw.id;

    const stakeMinor = 2000n; // 20 GHS
    
    const ticket = await prisma.ticket.create({
      data: {
        userId,
        drawId,
        ticketNumber: `TICK-${Date.now()}`,
        bookingCode: `BK-${Date.now()}`,
        totalStakeMinor: stakeMinor,
        status: 'PENDING',
        lines: {
          create: {
            gameTypeId: gameTypeId,
            lineStakeMinor: stakeMinor,
            numbers: [5, 12],
          },
        },
      },
    });

    await prisma.wallet.update({
      where: { id: userWalletId },
      data: { availableBalanceMinor: { decrement: stakeMinor } },
    });

    expect(ticket.bookingCode).toBeDefined();
    ticketId = ticket.id;

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    expect(wallet?.availableBalanceMinor).toBe(8000n);
  });

  it('4. Admin Draw Management, Winning Numbers & Settlement', async () => {
    // Ensure an AdminUser record exists matching the correct schema definition
    await prisma.adminUser.upsert({
      where: { id: adminUserId },
      update: {},
      create: {
        id: adminUserId,
        name: 'System Admin',
        email: `admin_${Date.now()}@example.com`,
        passwordHash: 'hashed_admin_user_password',
      },
    });

    await prisma.draw.update({
      where: { id: drawId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        winningNumber: {
          create: {
            numbers: [5, 12, 30, 45, 88],
          },
        },
      },
    });

    const settlementResult = await DrawSettlementService.settleDraw(drawId, adminUserId);
    expect(settlementResult.status).toBe('RESULT_PUBLISHED');

    const winningTicketsCount = await prisma.ticket.count({
      where: { drawId, status: 'WON' },
    });
    expect(winningTicketsCount).toBe(1);

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    expect(ticket?.status).toBe('WON');
  });
});