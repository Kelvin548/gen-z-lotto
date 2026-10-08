import { prisma } from '@/lib/db/prisma';
import { WalletService } from '@/services/wallet.service';
import crypto from 'crypto';

export interface CreateTicketParams {
  userId: string;
  drawId: string;
  selectedNumbers: number[];
  stakeAmountMinor: bigint;
}

export class TicketService {
  static async createTicket(params: CreateTicketParams) {
    const { userId, drawId, selectedNumbers, stakeAmountMinor } = params;

    const bookingCode = `BK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const ticketNumber = `TICK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return await prisma.$transaction(async (tx) => {
      const draw = await tx.draw.findUnique({ where: { id: drawId } });
      if (!draw) {
        throw new Error('TARGET_DRAW_NOT_FOUND');
      }

      if (draw.status !== 'OPEN' && draw.status !== 'SCHEDULED') {
        throw new Error('DRAW_CLOSED');
      }

      // 1. Hold funds first to validate and reserve the stake securely
      const holdResult = await WalletService.holdFunds(userId, stakeAmountMinor, bookingCode, {
        paymentProvider: 'WALLET',
        metadata: { drawId, ticketNumber, selectedNumbers }
      });

      if (!holdResult) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // 2. Create the ticket record after successful fund reservation
      const ticket = await tx.ticket.create({
        data: {
          userId,
          drawId,
          bookingCode,
          ticketNumber,
          totalStakeMinor: stakeAmountMinor,
        },
      });

      return ticket;
    });
  }
}