import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "super-secret-at-least-32-characters-long-key"
);
const COOKIE_NAME = "gz_session";

export interface SessionPayload {
  userId: string;
  phoneNumber: string;
  role: string;
  status: string;
  exp?: number;
}

export async function createSessionCookie(
  payload: Omit<SessionPayload, "exp">
): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  let token: string | undefined;

  // 1. Try reading from httpOnly cookie
  const cookieStore = await cookies();
  token = cookieStore.get(COOKIE_NAME)?.value;

  // 2. Fallback to Authorization: Bearer <token> header
  if (!token) {
    const headerList = await headers();
    const authHeader = headerList.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Stub for legacy/NextAuth compatibility
export const authOptions = {} as any;