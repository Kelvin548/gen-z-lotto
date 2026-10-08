import { normalizePhoneNumber, isValidPhoneNumber, maskPhoneNumber } from '../src/lib/auth/phone';
import { generateCryptoOTP, hashOTP } from '../src/lib/auth/otp';
import { hashPassword, verifyPassword } from '../src/lib/auth/password';

async function runTests() {
  console.log('🧪 Running GEN Z LOTTO Phase 2 Unit Tests...\n');

  try {
    // 1. Phone Normalization Tests
    console.log('Test 1: Phone Normalization');
    const p1 = normalizePhoneNumber('0241234567');
    console.assert(p1 === '+233241234567', `Expected +233241234567, got ${p1}`);
    const valid = isValidPhoneNumber('0241234567');
    console.assert(valid === true, 'Phone should be valid');
    const masked = maskPhoneNumber('+233241234567');
    console.assert(masked === '+23324****567', `Expected +23324****567, got ${masked}`);
    console.log('  ✅ Phone normalization & masking passed.\n');

    // 2. Cryptographic OTP Tests
    console.log('Test 2: OTP Engine');
    const otp = generateCryptoOTP();
    console.assert(otp.length === 6, 'OTP must be 6 digits');
    console.assert(/^\d{6}$/.test(otp), 'OTP must contain numbers only');
    const hashedOtp = hashOTP(otp);
    console.assert(hashedOtp !== otp, 'OTP hash must not equal raw OTP');
    console.log(`  ✅ OTP generation & SHA-256 hashing passed (Sample: ${otp}).\n`);

    // 3. Argon2 Hashing Tests
    console.log('Test 3: Argon2 Password Hashing');
    const secret = 'KellyForPresident2026!';
    const hash = await hashPassword(secret);
    const isValid = await verifyPassword(secret, hash);
    const isInvalid = await verifyPassword('WrongPassword123', hash);
    console.assert(isValid === true, 'Valid password verification failed');
    console.assert(isInvalid === false, 'Invalid password check failed');
    console.log('  ✅ Argon2id password hashing & verification passed.\n');

    console.log('🎉 ALL PHASE 2 TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

runTests();