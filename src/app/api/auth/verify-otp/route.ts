import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { normalizePhoneNumber } from '@/lib/auth/phone';
import { verifyOTP } from '@/lib/auth/otp';

const VerifyOtpSchema = z.object({
  phone: z.string().optional(),
  phoneNumber: z.string().optional(),
  code: z.string().optional(),
  otp: z.string().optional(),
  otpCode: z.string().optional(),
}).refine((data) => (data.phone || data.phoneNumber) && (data.code || data.otp || data.otpCode), {
  message: 'Phone number and OTP code are required.',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = VerifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input parameters.' },
        { status: 400 }
      );
    }

    const rawPhone = validation.data.phoneNumber || validation.data.phone || '';
    const code = validation.data.otpCode || validation.data.otp || validation.data.code || '';
    
    const normalizedPhone = normalizePhoneNumber(rawPhone);

    // Find user by normalized phone number
    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // Verify OTP using helper function
    const isValid = await verifyOTP(user.id, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code.' },
        { status: 400 }
      );
    }

    // Mark phone verified in database
    await prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true },
    });

    return NextResponse.json(
      { message: 'Phone number verified successfully!' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}