import { NextResponse } from "next/server";
import crypto from "crypto";
import { WalletService } from "@/services/wallet.service";
import { FinancialTransactionType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // 1. Enforce secret existence and verify webhook signature using timingSafeEqual
    if (!secret || !signature) {
      return NextResponse.json(
        { success: false, message: "Missing secret key or signature header" },
        { status: 401 }
      );
    }

    const expectedHash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedHash);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    // 2. Handle successful deposit event (charge.success)
    if (event === "charge.success") {
      const { metadata, amount, reference, id: providerRef, channel } = data;
      const userId = metadata?.userId;

      if (!userId) {
        return NextResponse.json(
          { success: false, message: "Missing userId in transaction metadata" },
          { status: 400 }
        );
      }

      // Credit wallet, create financial transaction, ledger entries, and update deposit status
      await WalletService.creditWallet(
        userId,
        BigInt(amount), // Paystack amount is in minor units (Pesewas)
        FinancialTransactionType.DEPOSIT,
        reference,
        {
          providerRef: String(providerRef),
          paymentProvider: channel || "PAYSTACK",
          metadata: metadata || null,
        }
      );

      return NextResponse.json(
        { success: true, message: "Deposit processed successfully" },
        { status: 200 }
      );
    }

    // 3. Handle successful withdrawal transfer event (transfer.success)
    if (event === "transfer.success") {
      const { reference, amount, recipient, transfer_code } = data;
      const userId = recipient?.metadata?.userId;

      if (userId) {
        await WalletService.fulfillWithdrawal(
          userId,
          BigInt(amount),
          reference,
          {
            providerRef: transfer_code || null,
            paymentProvider: "PAYSTACK",
          }
        );
      }

      return NextResponse.json(
        { success: true, message: "Transfer fulfilled successfully" },
        { status: 200 }
      );
    }

    // 4. Handle failed or reversed transfer event (revert held funds)
    if (event === "transfer.failed" || event === "transfer.reversed") {
      const { reference, amount, recipient } = data;
      const userId = recipient?.metadata?.userId;

      if (userId) {
        await WalletService.cancelWithdrawal(
          userId,
          BigInt(amount),
          reference
        );
      }

      return NextResponse.json(
        { success: true, message: "Transfer failure handled and funds restored" },
        { status: 200 }
      );
    }

    // Acknowledge unhandled event types with HTTP 200 so Paystack does not retry them needlessly
    return NextResponse.json(
      { success: true, message: "Event ignored" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing payment webhook:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}