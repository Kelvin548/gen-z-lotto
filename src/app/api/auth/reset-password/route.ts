import { NextResponse } from 'next/server';
import { globalOtpStore } from '../forgot-password/route';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, otp, newPassword } = body;

    if (!phone || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const storedData = globalOtpStore.get(phone);

    if (!storedData) {
      return NextResponse.json({ error: 'No OTP found for this phone number. Please request a new one.' }, { status: 400 });
    }

    if (Date.now() > storedData.expiresAt) {
      globalOtpStore.delete(phone);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (storedData.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP code.' }, { status: 400 });
    }

    globalOtpStore.delete(phone);

    console.log('\n========================================');
    console.log('🔒 [PASSWORD RESET SUCCESSFUL]');
    console.log(`📱 Phone: ${phone}`);
    console.log('========================================\n');

    return NextResponse.json({ success: true, message: 'Password reset successfully.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}