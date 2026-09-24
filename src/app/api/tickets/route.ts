import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { WalletService } from "@/services/wallet.service";
import crypto from "crypto";

export async function POST(
  request: Request,
  _context?: { params?: Promise<Record<string, string>> }
) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, errors: ["Invalid JSON payload."] },
        { status: 400 }
      );
    }

    const auth = await requireAuth();
    if (!auth || !auth.authorized) {
      return NextResponse.json(
        { success: false, errors: ["Unauthorized."] },
        { status: 401 }
      );
    }

    let userId: string;

    if (!auth.user?.id || auth.user.id === 'f3a3db28-b555-46f6-a099-f18ffdd1c371') {
      const demoUser = await prisma.user.findUnique({
        where: { id: auth.user?.id || 'f3a3db28-b555-46f6-a099-f18ffdd1c371' },
      });
      if (!demoUser) {
        return NextResponse.json(
          { success: false, errors: ["Demo user wallet configuration not found."] },
          { status: 400 }
        );
      }
      userId = demoUser.id;
    } else {
      userId = auth.user.id;
    }

    const {
      drawId,
      gameTypeCode,
      primaryNumbers,
      secondaryNumbers = [],
      stakePesewas,
      idempotencyKey,
    } = body;

    if (idempotencyKey) {
      const existingTx = await prisma.financialTransaction.findFirst({
        where: { idempotencyKey, actorId: userId },
      });

      if (existingTx) {
        const existingTicket = await prisma.ticket.findFirst({
          where: { userId, ticketNumber: existingTx.reference },
        });

        if (existingTicket) {
          return NextResponse.json(
            {
              success: true,
              data: {
                ticketId: existingTicket.id,
                bookingCode: existingTicket.bookingCode,
                totalStakeMinor: existingTicket.totalStakeMinor.toString(),
              },
            },
            { status: 200 }
          );
        }
      }
    }

    if (!Array.isArray(primaryNumbers) || primaryNumbers.length === 0) {
      return NextResponse.json(
        { success: false, errors: ["Invalid selection: primaryNumbers required."] },
        { status: 400 }
      );
    }

    const hasDuplicates = new Set(primaryNumbers).size !== primaryNumbers.length;
    const isOutOfBounds = primaryNumbers.some(
      (n: number) => typeof n !== "number" || n < 1 || n > 90
    );

    if (hasDuplicates || isOutOfBounds) {
      return NextResponse.json(
        { success: false, errors: ["Invalid selection numbers provided."] },
        { status: 422 }
      );
    }

    const MIN_STAKE = 50;
    const MAX_STAKE = 1000000;

    if (
      typeof stakePesewas !== "number" ||
      stakePesewas < MIN_STAKE ||
      stakePesewas > MAX_STAKE
    ) {
      return NextResponse.json(
        { success: false, errors: ["Invalid stake amount."] },
        { status: 422 }
      );
    }

    const ticketResult = await prisma.$transaction(async (tx) => {
      const draw = await tx.draw.findUnique({
        where: { id: drawId },
      });

      if (!draw) {
        throw new Error("TARGET_DRAW_NOT_FOUND");
      }

      const now = Date.now();
      const scheduledTime = new Date(draw.scheduledAt).getTime();
      const isOpenStatus = draw.status === "OPEN" || draw.status === "SCHEDULED";

      if (!isOpenStatus || scheduledTime <= now) {
        throw new Error("DRAW_CLOSED");
      }

      const gameType = await tx.gameType.findFirst({
        where: { slug: gameTypeCode?.toLowerCase().replace("_", "-") || "direct-2" },
      });

      const resolvedGameTypeId = gameType ? gameType.id : draw.gameId;
      const bookingCode = `BK-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const ticketNumber = `TICK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newTicket = await tx.ticket.create({
        data: {
          userId,
          drawId,
          bookingCode,
          ticketNumber,
          totalStakeMinor: BigInt(stakePesewas),
        },
      });

      await tx.ticketLine.create({
        data: {
          ticketId: newTicket.id,
          gameTypeId: resolvedGameTypeId,
          lineStakeMinor: BigInt(stakePesewas),
          numbers: JSON.stringify({ primaryNumbers, secondaryNumbers }),
        },
      });

      const deducted = await WalletService.deductStake(
        userId,
        BigInt(stakePesewas),
        newTicket.id,
        { tx }
      );

      if (!deducted) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      await tx.auditLog.create({
        data: {
          action: "TICKET_CREATED",
          entity: "Ticket",
          entityId: newTicket.id,
          payload: JSON.stringify({ ticketId: newTicket.id, stakePesewas }),
        },
      });

      return newTicket;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Ticket created successfully",
        data: {
          ticketId: ticketResult.id,
          bookingCode: ticketResult.bookingCode,
          totalStakeMinor: ticketResult.totalStakeMinor.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.message === "TARGET_DRAW_NOT_FOUND") {
      return NextResponse.json(
        { success: false, errors: ["Target draw not found."] },
        { status: 404 }
      );
    }

    if (error?.message === "DRAW_CLOSED") {
      return NextResponse.json(
        { success: false, errors: ["Betting has closed for this draw."] },
        { status: 400 }
      );
    }

    if (
      error?.message === "INSUFFICIENT_FUNDS" ||
      error?.message?.includes("Insufficient balance") ||
      error?.name === "InsufficientBalanceError"
    ) {
      return NextResponse.json(
        { success: false, errors: ["Insufficient wallet balance."] },
        { status: 400 }
      );
    }

    console.error("Error creating ticket:", error);
    return NextResponse.json(
      {
        success: false,
        errors: ["An unexpected server error occurred while placing ticket."],
      },
      { status: 500 }
    );
  }
}