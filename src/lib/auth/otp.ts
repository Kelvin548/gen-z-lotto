import crypto from 'crypto';
import { prisma } from '../db/prisma';

const OTP_EXPIRATION_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;

export function generateCryptoOTP(): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function createAndDeliverOTP(
  param1: string,
  param2: string = 'REGISTRATION',
  param3?: string
) {
  let userId: string | undefined;
  let phoneNumber: string;
  let purpose = 'REGISTRATION';

  // Flexible argument handling: supports both (userId, phoneNumber) and (phoneNumber, purpose, userId)
  if (param2 && (param2.startsWith('+') || /^\d{7,15}$/.test(param2))) {
    userId = param1;
    phoneNumber = param2;
    purpose = param3 || 'REGISTRATION';
  } else {
    phoneNumber = param1;
    purpose = param2 || 'REGISTRATION';
    userId = param3;
  }

  // Check resend cooldown
  const latestOTP = await prisma.oTPVerification.findFirst({
    where: { phoneNumber, purpose },
    orderBy: { createdAt: 'desc' },
  });

  if (latestOTP) {
    const secondsSinceLast = (Date.now() - latestOTP.createdAt.getTime()) / 1000;
    if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLast);
      throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP.`);
    }
  }

  const rawOTP = generateCryptoOTP();
  const codeHash = hashOTP(rawOTP);
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  // Invalidate old pending OTPs for this number/purpose
  await prisma.oTPVerification.updateMany({
    where: { phoneNumber, purpose, isVerified: false },
    data: { isVerified: true },
  });

  await prisma.oTPVerification.create({
    data: {
      userId,
      phoneNumber,
      codeHash,
      purpose,
      expiresAt,
    },
  });

  // Sandbox Delivery Logging - Prints clearly in your terminal console!
  console.log('\n========================================');
  console.log(`🔑 OTP CODE FOR ${phoneNumber}: [ ${rawOTP} ]`);
  console.log(`⏱️  Expires in ${OTP_EXPIRATION_MINUTES} minutes`);
  console.log('========================================\n');

  return { success: true, expiresAt, rawOTP };
}

export async function verifyOTP(phoneNumber: string, rawOTP: string, purpose = 'REGISTRATION') {
  const candidateHash = hashOTP(rawOTP);

  const record = await prisma.oTPVerification.findFirst({
    where: {
      phoneNumber,
      purpose,
      isVerified: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return { success: false, reason: 'INVALID_OR_EXPIRED' };
  }

  if (new Date() > record.expiresAt) {
    return { success: false, reason: 'EXPIRED' };
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    return { success: false, reason: 'MAX_ATTEMPTS_EXCEEDED' };
  }

  if (record.codeHash !== candidateHash) {
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { success: false, reason: 'INCORRECT_CODE', remainingAttempts: MAX_OTP_ATTEMPTS - (record.attempts + 1) };
  }

  // Mark OTP as verified/used
  await prisma.oTPVerification.update({
    where: { id: record.id },
    data: { isVerified: true },
  });

  return { success: true, record };
}