import { NextResponse } from 'next/server';

export const globalOtpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = body?.phone;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins expiry
    globalOtpStore.set(phone, { otp, expiresAt });

    console.log('\n========================================');
    console.log('🔑 [GEN Z LOTTO OTP GENERATED]');
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔢 Code: ${otp}`);
    console.log('========================================\n');

    return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}