import { PrismaClient, DrawStatus, TicketStatus } from "@prisma/client";
import { PayoutEngine } from "./payout-engine";

const prisma = new PrismaClient();

export class DrawSettlementService {
  static async settleDraw(drawId: string, adminUserId: string) {
    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        winningNumber: true,
        game: {
          include: { gameTypes: true },
        },
      },
    });

    if (!draw) throw new Error("Draw not found");

    if (draw.status === DrawStatus.RESULT_PUBLISHED) {
      throw new Error("Draw already settled");
    }

    const winningNumbers = (draw.winningNumber?.numbers as number[]) || null;
    if (!winningNumbers || winningNumbers.length === 0) {
      throw new Error("Winning numbers not set");
    }

    await prisma.auditLog.create({
      data: {
        action: "START_DRAW_SETTLEMENT",
        entity: "Draw",
        entityId: drawId,
        adminUser: { connect: { id: adminUserId } },
      },
    });

    await prisma.draw.update({
      where: { id: drawId },
      data: { status: DrawStatus.RESULT_PENDING },
    });

    const tickets = await prisma.ticket.findMany({
      where: { drawId },
      include: { lines: true },
    });

    for (const ticket of tickets) {
      let ticketPayoutMinor = BigInt(0);

      for (const line of ticket.lines) {
        const selectedNumbers = line.numbers as number[];
        const evaluation = PayoutEngine.evaluateLine(selectedNumbers, winningNumbers);

        let linePayoutMinor = BigInt(0);
        if (evaluation.isWinner) {
          const multiplier = 1;
          linePayoutMinor = BigInt(Math.floor(Number(line.lineStakeMinor) * multiplier));
        }

        ticketPayoutMinor += linePayoutMinor;
      }

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: ticketPayoutMinor > BigInt(0) ? TicketStatus.WON : TicketStatus.LOST,
        },
      });
    }

    const finalDraw = await prisma.draw.update({
      where: { id: drawId },
      data: { status: DrawStatus.RESULT_PUBLISHED },
    });

    await prisma.auditLog.create({
      data: {
        action: "COMPLETE_DRAW_SETTLEMENT",
        entity: "Draw",
        entityId: drawId,
        adminUser: { connect: { id: adminUserId } },
        payload: { drawId },
      },
    });

    return finalDraw;
  }
}