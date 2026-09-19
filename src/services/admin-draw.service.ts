import { PrismaClient, DrawStatus, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const VALID_TRANSITIONS: Record<DrawStatus, DrawStatus[]> = {
  DRAFT: [DrawStatus.SCHEDULED, DrawStatus.CANCELLED],
  SCHEDULED: [DrawStatus.OPEN, DrawStatus.CANCELLED],
  OPEN: [DrawStatus.CLOSED, DrawStatus.CANCELLED],
  CLOSED: [DrawStatus.RESULT_PENDING, DrawStatus.CANCELLED],
  RESULT_PENDING: [DrawStatus.RESULT_PUBLISHED, DrawStatus.CANCELLED],
  RESULT_PUBLISHED: [],
  CANCELLED: [],
};

export interface CreateDrawInput {
  gameId: string;
  drawNumber: string;
  scheduledAt: Date;
  adminUserId?: string;
}

export class AdminDrawService {
  static async createDraw(data: CreateDrawInput) {
    const draw = await prisma.draw.create({
      data: {
        gameId: data.gameId,
        drawNumber: data.drawNumber,
        scheduledAt: data.scheduledAt,
        status: DrawStatus.SCHEDULED,
      },
    });

    if (data.adminUserId) {
      await prisma.auditLog.create({
        data: {
          action: "CREATE_DRAW",
          entity: "Draw",
          adminUser: { connect: { id: data.adminUserId } },
          payload: { drawId: draw.id },
        },
      });
    }

    return draw;
  }

  static async updateDrawStatus(drawId: string, nextStatus: DrawStatus, adminUserId: string) {
    const draw = await prisma.draw.findUnique({ where: { id: drawId } });
    if (!draw) throw new Error("Draw not found");

    const allowedTransitions = VALID_TRANSITIONS[draw.status];
    if (!allowedTransitions || !allowedTransitions.includes(nextStatus)) {
      throw new Error(`Invalid status transition from ${draw.status} to ${nextStatus}`);
    }

    const updateData: Prisma.DrawUpdateInput = { status: nextStatus };

    if (nextStatus === DrawStatus.CLOSED && !draw.closedAt) {
      updateData.closedAt = new Date();
    }

    const updated = await prisma.draw.update({
      where: { id: drawId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_DRAW_STATUS",
        entity: "Draw",
        adminUser: { connect: { id: adminUserId } },
        payload: { drawId, previousStatus: draw.status, nextStatus },
      },
    });

    return updated;
  }

  static async setWinningNumbers(drawId: string, numbers: number[], adminUserId: string) {
    const draw = await prisma.draw.findUnique({ where: { id: drawId } });
    if (!draw) throw new Error("Draw not found");

    if (draw.status === DrawStatus.RESULT_PUBLISHED) {
      throw new Error("Cannot edit results for a published draw");
    }

    if (draw.status !== DrawStatus.CLOSED && draw.status !== DrawStatus.RESULT_PENDING) {
      throw new Error("Draw must be closed or result pending to enter winning numbers");
    }

    const updated = await prisma.draw.update({
      where: { id: drawId },
      data: {
        winningNumber: {
          upsert: {
            create: { numbers },
            update: { numbers },
          },
        },
      },
      include: { winningNumber: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "ENTER_WINNING_NUMBERS",
        entity: "Draw",
        adminUser: { connect: { id: adminUserId } },
        payload: { drawId, numbers },
      },
    });

    return updated;
  }
}