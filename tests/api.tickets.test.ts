import { POST } from "@/app/api/tickets/route";
import { NextRequest } from "next/server";
import { GameTypeCode } from "@/lib/lottery/phase4-lottery-engine";

// Mock next/headers including headers() function required by Next.js session helper
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  headers: jest.fn(() => new Map()),
}));

// Mock session helper
jest.mock("@/lib/auth", () => ({
  getSession: jest.fn().mockResolvedValue({
    user: { id: "usr_123", email: "test@example.com" },
  }),
}));

// Mock Prisma client mapped to @/lib/db/prisma
jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    ticket: { create: jest.fn().mockResolvedValue({ id: "tkt_123" }) },
    user: { findUnique: jest.fn().mockResolvedValue({ id: "usr_123", balancePesewas: 10000 }) },
  },
}));

describe("API Route: /api/tickets POST Handler", () => {
  const validPayload = {
    gameId: "123e4567-e89b-12d3-a456-426614174000",
    drawId: "123e4567-e89b-12d3-a456-426614174001",
    gameTypeCode: GameTypeCode.DIRECT,
    primaryNumbers: [5, 12],
    stakePesewas: 200,
    idempotencyKey: "a1b2c3d4e5f67890a1b2c3d4e5f67890",
  };

  it("handles invalid payload validation", async () => {
    const invalidPayload = { ...validPayload, primaryNumbers: [] };

    const req = new NextRequest("http://localhost:3000/api/tickets", {
      method: "POST",
      body: JSON.stringify(invalidPayload),
    });

    const response = await POST(req);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("handles malformed JSON body gracefully", async () => {
    const req = new NextRequest("http://localhost:3000/api/tickets", {
      method: "POST",
      body: "invalid-json-string",
    });

    const response = await POST(req);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});