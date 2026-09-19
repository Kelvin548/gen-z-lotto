import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { normalizePhoneNumber } from '@/lib/auth/phone';
import { createSessionCookie } from '@/lib/auth/session';

const LoginSchema = z.object({
  phoneNumber: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => data.phoneNumber || data.phone, {
  message: 'Phone number is required',
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid credentials provided.' }, { status: 400 });
    }

    const rawPhone = result.data.phoneNumber || result.data.phone || '';
    const normalizedPhone = normalizePhoneNumber(rawPhone);

    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    // Generic response against account enumeration
    if (!user) {
      return NextResponse.json({ error: 'Invalid phone number or password.' }, { status: 401 });
    }

    // Check temporary account lockout
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json({
        error: `Account temporarily locked due to failed attempts. Try again in ${minutesRemaining} minutes.`
      }, { status: 423 });
    }

    // Fixed parameter order: verifyPassword(plainPassword, hash)
    const isPasswordValid = await verifyPassword(result.data.password, user.passwordHash);

    if (!isPasswordValid) {
      const newFailedCount = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;

      if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedCount,
          lockedUntil,
          status: lockedUntil ? 'LOCKED' : user.status,
        },
      });

      return NextResponse.json({ error: 'Invalid phone number or password.' }, { status: 401 });
    }

    if (user.status === 'SUSPENDED' || user.status === 'SELF_EXCLUDED' || user.status === 'DEACTIVATED') {
      return NextResponse.json({ error: `Account access restricted (${user.status}). Contact support.` }, { status: 403 });
    }

    // Reset failed attempts, clear locks, and auto-verify phone on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        isPhoneVerified: true,
      },
    });

    await createSessionCookie({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: 'USER',
      status: user.status,
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful.',
    });

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: error.message || 'Login failed.' }, { status: 500 });
  }
}