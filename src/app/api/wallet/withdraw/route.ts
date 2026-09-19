import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

import crypto from "crypto";
import { z } from "zod";
import { FinancialTransactionType, WalletStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { WalletService } from "@/services/wallet.service";

const WithdrawSchema = z.object({
  amountMinor: z
    .number()
    .int({ message: "amountMinor must be an integer." })
    .positive({ message: "amountMinor must be greater than zero." }),
  idempotencyKey: z
    .string()
    .min(8, { message: "Idempotency key must be at least 8 characters long." })
    .max(128, { message: "Idempotency key is too long." }),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, errors: ["Unauthorized. Please log in."] },
        { status: 401 }
      );
    }

    const userId = session.userId;

    const body = await request.json();
    const parseResult = WithdrawSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parseResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        },
        { status: 422 }
      );
    }

    const { amountMinor, idempotencyKey } = parseResult.data;
    const amountBigInt = BigInt(amountMinor);

    const existingTx = await prisma.financialTransaction.findFirst({
      where: {
        idempotencyKey,
        actorId: userId,
      },
    });

    if (existingTx) {
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
        select: { availableBalanceMinor: true },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Withdrawal request retrieved (idempotent request).",
          transaction: {
            id: existingTx.id,
            reference: existingTx.reference,
            amountMinor: Number(existingTx.amountMinor),
            currency: existingTx.currency,
            status: existingTx.status,
            type: existingTx.type,
          },
          wallet: {
            availableBalanceMinor: wallet ? Number(wallet.availableBalanceMinor) : 0,
          },
        },
        { status: 200 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      if (wallet.status !== WalletStatus.ACTIVE) {
        throw new Error("WALLET_SUSPENDED");
      }

      if (wallet.availableBalanceMinor < amountBigInt) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const withdrawReference = `WITHDRAW-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

      const { updatedWallet, transaction } = await WalletService.debitWallet(
        userId,
        amountBigInt,
        FinancialTransactionType.WITHDRAWAL,
        withdrawReference,
        tx,
        idempotencyKey
      );

      await tx.auditLog.create({
        data: {
          action: "WITHDRAWAL_SUCCESS",
          entity: "Wallet",
          entityId: updatedWallet.id,
          payload: JSON.stringify({
            amountMinor,
            currency: "GHS",
            reference: withdrawReference,
            idempotencyKey,
            transactionId: transaction?.id ?? null,
          }),
        },
      });

      return {
        updatedWallet,
        reference: withdrawReference,
        transactionId: transaction?.id || "N/A",
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Withdrawal request processed successfully.",
        transaction: {
          id: result.transactionId,
          reference: result.reference,
          amountMinor,
          currency: "GHS",
          status: "COMPLETED",
          type: "WITHDRAWAL",
        },
        wallet: {
          availableBalanceMinor: Number(result.updatedWallet.availableBalanceMinor),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "WALLET_NOT_FOUND") {
      return NextResponse.json(
        { success: false, errors: ["Wallet record not found for user."] },
        { status: 404 }
      );
    }

    if (error.message === "WALLET_SUSPENDED") {
      return NextResponse.json(
        { success: false, errors: ["Wallet is suspended or frozen. Withdrawals are restricted."] },
        { status: 403 }
      );
    }

    if (error.message === "INSUFFICIENT_FUNDS") {
      return NextResponse.json(
        { success: false, errors: ["Insufficient funds to complete this withdrawal."] },
        { status: 400 }
      );
    }

    console.error("Withdrawal Error:", error);
    return NextResponse.json(
      { success: false, errors: ["An unexpected error occurred during withdrawal processing."] },
      { status: 500 }
    );
  }
}