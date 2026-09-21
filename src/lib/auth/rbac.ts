import { getSession, SessionPayload } from "./session";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export interface AuthSuccess {
  authorized: true;
  session: SessionPayload;
  user: {
    id: string;
    status: string;
    phoneNumber: string;
  };
  response?: undefined;
}

export interface AuthFailure {
  authorized: false;
  response: NextResponse;
  session: null;
  user?: undefined;
}

export type AuthResult = AuthSuccess | AuthFailure;

export async function requireAuth(): Promise<AuthResult> {
  const session = await getSession();

  if (!session || !session.userId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, errors: ["Unauthorized access. Session invalid or missing."] },
        { status: 401 }
      ),
      session: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, status: true, phoneNumber: true },
  });

  if (
    !user ||
    user.status === "SUSPENDED" ||
    user.status === "LOCKED" ||
    user.status === "DEACTIVATED"
  ) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, errors: ["Account access restricted or deactivated."] },
        { status: 403 }
      ),
      session: null,
    };
  }

  return {
    authorized: true,
    session,
    user,
  };
}

export async function requireRole(allowedRoles: string[]): Promise<AuthResult> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth;

  let userRoles = [auth.session.role || "USER"];

  if (allowedRoles.includes("ADMIN")) {
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        phoneNumber: auth.user.phoneNumber,
        isActive: true,
      },
    });

    if (adminUser) {
      userRoles = [...userRoles, "ADMIN"];
    }
  }

  const hasRole = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasRole) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, errors: ["Forbidden: Insufficient privileges."] },
        { status: 403 }
      ),
      session: null,
    };
  }

  return auth;
}