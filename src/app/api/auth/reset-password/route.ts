import { NextResponse } from 'next/server';
import { globalOtpStore } from '../forgot-password/route';
import { prisma } from '@/lib/db/prisma';
import { normalizePhoneNumber } from '@/lib/auth/phone';
import bcrypt from 'bcryptjs';

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

    const normalizedPhone = normalizePhoneNumber(phone);

    // Try finding the user by normalized phone, fallback to raw phone
    let user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { phoneNumber: phone },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'No account found with this phone number in the database.' }, { status: 404 });
    }

    // 1. Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 2. Update the user's password safely using their unique ID
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // 3. Clear the used OTP
    globalOtpStore.delete(phone);

    console.log('\n========================================');
    console.log('🔒 [PASSWORD RESET & DATABASE UPDATE SUCCESSFUL]');
    console.log(`📱 Phone: ${user.phoneNumber}`);
    console.log('========================================\n');

    return NextResponse.json({ success: true, message: 'Password reset successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Password reset database error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}