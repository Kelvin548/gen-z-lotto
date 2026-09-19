import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { normalizePhoneNumber, isValidPhoneNumber } from '@/lib/auth/phone';
import { createAndDeliverOTP } from '@/lib/auth/otp';

const RegisterSchema = z.object({
  phoneNumber: z.string().refine(isValidPhoneNumber, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Map 'phone' from frontend to 'phoneNumber' if needed
    const payload = {
      phoneNumber: body.phoneNumber || body.phone,
      password: body.password,
    };

    const validation = RegisterSchema.safeParse(payload);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(payload.phoneNumber);

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Phone number is already registered.' },
        { status: 400 }
      );
    }

    // Hash password & create user
const passwordHash = await hashPassword(payload.password);

const user = await prisma.user.create({
  data: {
    phoneNumber: normalizedPhone,
    passwordHash,
    termsAcceptedAt: new Date(),
    privacyAcceptedAt: new Date(),
  },
});

    // Generate & Log OTP
    const otp = await createAndDeliverOTP(user.id, normalizedPhone);

    return NextResponse.json(
      { message: 'Registration successful! Check console for OTP.', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}