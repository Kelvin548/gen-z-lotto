import { normalizePhoneNumber, isValidPhoneNumber, maskPhoneNumber } from "@/lib/auth/phone";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateCryptoOTP, hashOTP } from "@/lib/auth/otp";

// Mock next/headers for Next.js 15+ dynamic headers/cookies context
jest.mock("next/headers", () => {
  const mockCookieStore = {
    get: jest.fn(),
    getAll: jest.fn().mockReturnValue([]),
    has: jest.fn().mockReturnValue(false),
    set: jest.fn(),
    delete: jest.fn(),
  };
  return {
    cookies: jest.fn().mockResolvedValue(mockCookieStore),
    headers: jest.fn().mockReturnValue(
      Promise.resolve({
        get: jest.fn().mockImplementation(() => null),
      })
    ),
  };
});

import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";

describe("GEN Z LOTTO - Phase 2 Security & Auth Unit Tests", () => {
  test("Phone Normalization & Validation", () => {
    expect(normalizePhoneNumber("0241234567")).toBe("+233241234567");
    expect(normalizePhoneNumber("233241234567")).toBe("+233241234567");
    expect(normalizePhoneNumber("+233241234567")).toBe("+233241234567");
    expect(isValidPhoneNumber("0241234567")).toBe(true);
    expect(maskPhoneNumber("+233241234567")).toBe("+23324****567");

    // Edge Cases
    expect(isValidPhoneNumber("invalid-phone")).toBe(false);
    expect(isValidPhoneNumber("12345")).toBe(false);
    expect(normalizePhoneNumber("0000000000000")).toBe("+233000000000000");
  });

  test("Argon2id Password Hashing & Verification", async () => {
    const rawPass = "SecretPassword123!";
    const hash = await hashPassword(rawPass);

    expect(hash).not.toEqual(rawPass);
    expect(await verifyPassword(rawPass, hash)).toBe(true);
    expect(await verifyPassword("WrongPassword", hash)).toBe(false);
    expect(await verifyPassword("", hash)).toBe(false);
  });

  test("Cryptographic OTP Generation & SHA-256 Hashing", () => {
    const otp1 = generateCryptoOTP();
    const otp2 = generateCryptoOTP();

    expect(otp1).toHaveLength(6);
    expect(/^\d{6}$/.test(otp1)).toBe(true);
    expect(hashOTP(otp1)).not.toEqual(otp1);
    expect(otp1).not.toEqual(otp2);
    expect(hashOTP(otp1)).toHaveLength(64);
  });
});

describe("Extended Auth Engine & Session Utility Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle null or missing auth cookies gracefully", async () => {
    const cookieStore = await cookies();
    (cookieStore.get as jest.Mock).mockReturnValueOnce(undefined);

    const session = await getSession();
    expect(session).toBeNull();
  });

  it("should return null when cookie contains an empty token string", async () => {
    const cookieStore = await cookies();
    (cookieStore.get as jest.Mock).mockReturnValueOnce({
      name: "session",
      value: "",
    });

    const session = await getSession();
    expect(session).toBeNull();
  });

  it("should return null for malformed or invalid session token", async () => {
    const cookieStore = await cookies();
    (cookieStore.get as jest.Mock).mockReturnValueOnce({
      name: "session",
      value: "invalid.jwt.token.structure",
    });

    const session = await getSession();
    expect(session).toBeNull();
  });

  it("should return null when JWT verification fails or token is expired", async () => {
    const cookieStore = await cookies();
    (cookieStore.get as jest.Mock).mockReturnValueOnce({
      name: "session",
      value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsImV4cCI6MTAwMDAwMH0.invalid_sig",
    });

    const session = await getSession();
    expect(session).toBeNull();
  });

  it("should handle OTP hashing edge cases consistently", () => {
    expect(() => hashOTP("")).not.toThrow();
    expect(hashOTP("123456")).toBe(hashOTP("123456"));
    expect(hashOTP("123456")).not.toBe(hashOTP("654321"));
  });
});