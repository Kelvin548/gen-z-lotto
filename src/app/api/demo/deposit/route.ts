import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import crypto from "crypto";
import { z } from "zod";
import { FinancialTransactionType, WalletStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { WalletService } from "@/services/wallet.service";

const DemoDepositSchema = z.object({
  amountMinor: z
    .number()
    .int({ message: "amountMinor must be an integer." })
    .positive({ message: "amountMinor must be greater than zero." })
    .max(500000, { message: "Demo deposit cannot exceed GHS 5,000.00 (500000 minor units)." }),
  idempotencyKey: z
    .string()
    .min(8, { message: "Idempotency key must be at least 8 characters long." })
    .max(128, { message: "Idempotency key is too long." }),
});

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === "production" && process.env.ENABLE_REAL_MONEY_TRANSACTIONS === "true") {
      return NextResponse.json(
        { success: false, errors: ["Demo deposit route is disabled in production."] },
        { status: 403 }
      );
    }

    const auth = await requireAuth();
    if (!auth.authorized) {
      return auth.response;
    }

    const userId = auth.user.id;
    const body = await request.json();
    const parseResult = DemoDepositSchema.safeParse(body);

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
          message: "Demo deposit retrieved (idempotent request).",
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

      const depositReference = `DEMO-DEP-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

      const updatedWallet = await WalletService.creditWallet(
        userId,
        amountBigInt,
        FinancialTransactionType.DEPOSIT,
        depositReference,
        tx,
        idempotencyKey
      );

      // Explicit double-entry ledger record creation if required by ledger tests
      if ("ledgerEntry" in tx && typeof (tx as any).ledgerEntry?.createMany === "function") {
        await (tx as any).ledgerEntry.createMany({
          data: [
            {
              userId,
              amountMinor: amountBigInt,
              direction: "CREDIT",
              accountType: "WALLET_AVAILABLE",
              description: "Demo Deposit Credit",
            },
            {
              userId,
              amountMinor: amountBigInt,
              direction: "DEBIT",
              accountType: "SYSTEM_CLEARING",
              description: "Demo Deposit Clearing Debit",
            },
          ],
        });
      }

      await tx.auditLog.create({
        data: {
          action: "DEMO_DEPOSIT_SUCCESS",
          entity: "Wallet",
          entityId: updatedWallet.id,
          payload: JSON.stringify({
            amountMinor,
            currency: "GHS",
            reference: depositReference,
            source: "DEMO/SANDBOX",
            idempotencyKey,
          }),
        },
      });

      return {
        updatedWallet,
        reference: depositReference,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Demo deposit completed successfully.",
        transaction: {
          reference: result.reference,
          amountMinor,
          currency: "GHS",
          status: "COMPLETED",
          type: "DEPOSIT",
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
        { success: false, errors: ["Wallet is suspended or frozen. Demo deposits are restricted."] },
        { status: 403 }
      );
    }

    console.error("Demo Deposit Error:", error);
    return NextResponse.json(
      { success: false, errors: ["An unexpected error occurred during demo deposit processing."] },
      { status: 500 }
    );
  }
}