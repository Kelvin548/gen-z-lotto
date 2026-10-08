import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db/prisma';
import { maskPhoneNumber } from '@/lib/auth/phone';

export async function GET() {
  const auth = await requireAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: {
      id: true,
      phoneNumber: true,
      email: true,
      status: true,
      isPhoneVerified: true,
      createdAt: true,
      profile: {
        select: {
          fullName: true,
        },
      },
      wallet: {
        select: {
          availableBalanceMinor: true,
          heldBalanceMinor: true,
          currency: true,
        },
      },
    },
  });

  if (!userProfile) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      ...userProfile,
      maskedPhone: maskPhoneNumber(userProfile.phoneNumber),
      wallet: userProfile.wallet
        ? {
            ...userProfile.wallet,
            availableBalanceMinor: userProfile.wallet.availableBalanceMinor.toString(),
            heldBalanceMinor: userProfile.wallet.heldBalanceMinor.toString(),
          }
        : null,
    },
  });
}