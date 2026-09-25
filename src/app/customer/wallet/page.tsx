// src/app/api/wallet/deposit/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, amountPesewas, userId } = await request.json();

    if (!email || !amountPesewas || !userId || amountPesewas <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payload, missing email, userId, or amount." },
        { status: 400 }
      );
    }

    // Initialize transaction with Paystack
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountPesewas, // Amount in pesewas
        currency: "GHS",
        channels: ["card", "mobile_money"],
        metadata: {
          userId, // Crucial for your webhook to credit the right user wallet
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { success: false, message: data.message || "Payment initialization failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error: any) {
    console.error("Deposit initialization error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}