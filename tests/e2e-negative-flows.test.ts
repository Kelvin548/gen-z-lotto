import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { DrawSettlementService } from '@/services/draw-settlement.service';
import { TicketService } from '@/services/ticket.service';

const prisma = new PrismaClient();

describe('PHASE 5 Negative & Security Boundaries', () => {
  let userId: string;
  let adminUserId: string;
  let scheduledDrawId: string;
  let closedDrawId: string;
  let settledDrawId: string;

  beforeAll(async () => {
    // Clean up test state in relational order
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

    // Create Admin User
    const adminUser = await prisma.user.create({
      data: {
        phoneNumber: '0240000999',
        passwordHash: 'hash',
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
    });
    adminUserId = adminUser.id;

    // Create Standard User with empty wallet (Insufficient Funds)
    const user = await prisma.user.create({
      data: {
        phoneNumber: '0241111222',
        passwordHash: 'hash',
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
    });
    userId = user.id;

    await prisma.wallet.create({
      data: {
        userId: userId,
        availableBalanceMinor: 0n,
      },
    });

    // Create Game & GameType
    const game = await prisma.game.create({
      data: {
        name: 'Negative Test Game',
        slug: 'negative-test-game',
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
    const gameId = game.id;

    // Create Draws in respective states
    const scheduledDraw = await prisma.draw.create({
      data: {
        gameId,
        drawNumber: `SCH-${Date.now()}`,
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 3600000),
      },
    });
    scheduledDrawId = scheduledDraw.id;

    const closedDraw = await prisma.draw.create({
      data: {
        gameId,
        drawNumber: `CLS-${Date.now()}`,
        status: 'CLOSED',
        scheduledAt: new Date(),
      },
    });
    closedDrawId = closedDraw.id;

    const settledDraw = await prisma.draw.create({
      data: {
        gameId,
        drawNumber: `SET-${Date.now()}`,
        status: 'RESULT_PUBLISHED',
        scheduledAt: new Date(),
      },
    });
    settledDrawId = settledDraw.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('prevents ticket purchase with insufficient funds', async () => {
    await expect(
      TicketService.createTicket({
        userId: userId,
        drawId: scheduledDrawId,
        selectedNumbers: [1, 2],
        stakeAmountMinor: 999999n,
      })
    ).rejects.toThrow();
  });

  it('prevents settling a draw twice (Idempotency Guard)', async () => {
    await expect(
      DrawSettlementService.settleDraw(settledDrawId, adminUserId)
    ).rejects.toThrow('Draw already settled');
  });

  it('rejects ticket purchase on CLOSED or COMPLETED draw', async () => {
    await expect(
      TicketService.createTicket({
        userId: userId,
        drawId: closedDrawId,
        selectedNumbers: [1, 2],
        stakeAmountMinor: 10n,
      })
    ).rejects.toThrow();
  });
});