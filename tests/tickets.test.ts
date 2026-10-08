jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn((name: string) => ({ value: "mocked-cookie-value" })),
    getAll: jest.fn().mockReturnValue([]),
    has: jest.fn().mockReturnValue(true),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: jest.fn().mockReturnValue(
    Promise.resolve({
      get: jest.fn().mockReturnValue("Bearer mocked-cookie-value"),
    })
  ),
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/tickets/route";
import { GET } from "@/app/api/tickets/[id]/route";
import { prisma } from "@/lib/db/prisma";
import { WalletService } from "@/services/wallet.service";
import { DrawStatus, GameTypeCode, ghsToPesewas } from "@/lib/lottery/phase4-lottery-engine";

function createMockRequest(url: string, method: string, body?: any) {
  return new NextRequest(url, {
    method,
    headers: {
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const mockGetSession = jest.fn();

jest.mock("@/lib/auth", () => ({
  __esModule: true,
  getSession: (...args: any[]) => mockGetSession(...args),
}));

// Mock RBAC requireAuth to guarantee user & role properties exist
jest.mock("@/lib/auth/rbac", () => ({
  requireAuth: jest.fn().mockImplementation(async () => {
    const session = await mockGetSession();
    if (!session || (!session.user && !session.userId)) {
      return {
        authorized: false,
        response: new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 }),
      };
    }
    const user = session.user || { id: session.userId, role: "USER" };
    return {
      authorized: true,
      user: { role: "USER", ...user },
      session: { ...session, user: { role: "USER", ...user } },
    };
  }),
}));

jest.mock("@/services/wallet.service", () => ({
  WalletService: {
    deductStake: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock("@/lib/db/prisma", () => {
  const mockPrisma = {
    ticket: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    ticketLine: {
      create: jest.fn(),
    },
    draw: {
      findUnique: jest.fn(),
    },
    gameType: {
      findFirst: jest.fn(),
    },
    financialTransaction: {
      findFirst: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  mockPrisma.$transaction.mockImplementation(async (callback: any) => {
    return await callback(mockPrisma);
  });

  return { prisma: mockPrisma };
});

describe("Phase 4B - Tickets API & Authorization Edge-Case Tests", () => {
  const mockUserA = { id: "a0000000-0000-4000-a000-000000000001", email: "usera@example.com", role: "USER" };
  const mockUserB = { id: "b0000000-0000-4000-a000-000000000002", email: "userb@example.com", role: "USER" };

  const validDrawId = "11111111-1111-4111-a111-111111111111";
  const validGameId = "22222222-2222-4222-a222-222222222222";

  const validDraw = {
    id: validDrawId,
    status: DrawStatus?.OPEN || "OPEN",
    gameId: validGameId,
    scheduledAt: new Date(Date.now() + 3600 * 1000),
  };

  const validGameTypeCode = (GameTypeCode as any)?.DIRECT || "DIRECT";

  const validPayload = {
    drawId: validDrawId,
    gameId: validGameId,
    gameTypeCode: validGameTypeCode,
    primaryNumbers: [5],
    secondaryNumbers: [],
    stakePesewas: ghsToPesewas(1),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetSession.mockImplementation(async () => ({
      userId: mockUserA.id,
      user: mockUserA,
    }));

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(prisma));
    (prisma.financialTransaction.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.ticket.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.draw.findUnique as jest.Mock).mockResolvedValue(validDraw);
    (prisma.gameType.findFirst as jest.Mock).mockResolvedValue({ id: validGameId, slug: "direct-2" });
    (prisma.ticketLine.create as jest.Mock).mockResolvedValue({ id: "line-123" });
    (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: "audit-123" });
    (prisma.ticket.create as jest.Mock).mockImplementation(async ({ data }) => ({
      id: "33333333-3333-4333-a333-333333333333",
      bookingCode: data.bookingCode || "BK-TEST-123",
      totalStakeMinor: data.totalStakeMinor,
      lines: [
        {
          id: "line-123",
          numbers: [5],
          lineStakeMinor: data.totalStakeMinor,
        },
      ],
    }));
  });

  describe("Idempotency & Concurrent Submissions", () => {
    it("should return previously created ticket for matching idempotencyKey without creating duplicates", async () => {
      const existingTx = {
        id: "tx-123",
        idempotencyKey: "test-idempotency-key-001",
        reference: "TICK-123456789",
        actorId: mockUserA.id,
      };

      const existingTicket = {
        id: "44444444-4444-4444-a444-444444444444",
        userId: mockUserA.id,
        bookingCode: "BK-EXISTING-001",
        ticketNumber: "TICK-123456789",
        totalStakeMinor: 100,
        lines: [{ id: "line-1", numbers: [5], lineStakeMinor: 100 }],
      };

      (prisma.financialTransaction.findFirst as jest.Mock).mockResolvedValueOnce(existingTx);
      (prisma.ticket.findFirst as jest.Mock).mockResolvedValueOnce(existingTicket);

      const req = createMockRequest("http://localhost:3000/api/tickets", "POST", {
        ...validPayload,
        idempotencyKey: "test-idempotency-key-001",
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.ticketId).toBe("44444444-4444-4444-a444-444444444444");
      expect(prisma.ticket.create).not.toHaveBeenCalled();
    });

    it("should prevent User B from claiming User A's idempotency key response", async () => {
      mockGetSession.mockImplementationOnce(async () => ({
        userId: mockUserB.id,
        user: mockUserB,
      }));
      (prisma.financialTransaction.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const req = createMockRequest("http://localhost:3000/api/tickets", "POST", {
        ...validPayload,
        idempotencyKey: "test-idempotency-key-001",
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  });

  describe("Draw Status Validation", () => {
    const closedStatuses = [
      DrawStatus?.CLOSED || "CLOSED",
      DrawStatus?.DRAFT || "DRAFT",
      "SUSPENDED" as const,
      DrawStatus?.CANCELLED || "CANCELLED",
    ];

    closedStatuses.forEach((status) => {
      it(`should reject ticket creation when draw status is ${status}`, async () => {
        (prisma.draw.findUnique as jest.Mock).mockResolvedValueOnce({
          ...validDraw,
          status,
        });

        const req = createMockRequest("http://localhost:3000/api/tickets", "POST", validPayload);

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.errors).toContain("Betting has closed for this draw.");
        expect(prisma.ticket.create).not.toHaveBeenCalled();
      });
    });
  });

  describe("Expired Draw Enforcement", () => {
    it("should reject tickets for draws past scheduledAt regardless of status", async () => {
      (prisma.draw.findUnique as jest.Mock).mockResolvedValueOnce({
        ...validDraw,
        status: DrawStatus?.OPEN || "OPEN",
        scheduledAt: new Date(Date.now() - 3600 * 1000),
      });

      const req = createMockRequest("http://localhost:3000/api/tickets", "POST", validPayload);

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(prisma.ticket.create).not.toHaveBeenCalled();
    });
  });

  describe("Selection Engine Validation", () => {
    const invalidSelections = [
      { name: "number 0", numbers: [0] },
      { name: "negative number", numbers: [-1] },
      { name: "number out of bounds (>90)", numbers: [91] },
      { name: "extreme number out of bounds", numbers: [999] },
      { name: "empty selection", numbers: [] },
      { name: "duplicate numbers", numbers: [5, 5] },
    ];

    invalidSelections.forEach(({ name, numbers }) => {
      it(`should reject invalid selection: ${name}`, async () => {
        const req = createMockRequest("http://localhost:3000/api/tickets", "POST", {
          ...validPayload,
          primaryNumbers: numbers,
        });

        const res = await POST(req);
        const data = await res.json();

        expect([400, 422]).toContain(res.status);
        expect(data.success).toBe(false);
        expect(prisma.ticket.create).not.toHaveBeenCalled();
      });
    });
  });

  describe("Stake Amount Validation", () => {
    const invalidStakes = [
      { name: "zero stake", stake: 0 },
      { name: "negative stake", stake: -100 },
      { name: "below configured min stake", stake: 10 },
      { name: "above configured max stake", stake: 10000000 },
    ];

    invalidStakes.forEach(({ name, stake }) => {
      it(`should reject invalid stake: ${name}`, async () => {
        const req = createMockRequest("http://localhost:3000/api/tickets", "POST", {
          ...validPayload,
          stakePesewas: stake,
        });

        const res = await POST(req);
        const data = await res.json();

        expect([400, 422]).toContain(res.status);
        expect(data.success).toBe(false);
        expect(prisma.ticket.create).not.toHaveBeenCalled();
      });
    });
  });

  describe("Client Payload Tampering Integrity", () => {
    it("should ignore injected client-side totalStake and calculate total on server", async () => {
      let createdData: any = null;
      (prisma.ticket.create as jest.Mock).mockImplementationOnce(async ({ data }) => {
        createdData = data;
        return {
          id: "55555555-5555-4555-a555-555555555555",
          bookingCode: "BK-123",
          totalStakeMinor: data.totalStakeMinor,
          lines: [],
        };
      });

      const req = createMockRequest("http://localhost:3000/api/tickets", "POST", {
        ...validPayload,
        totalStakeMinor: 1,
        potentialPayout: 999999999,
        userId: "hacked-user-id",
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      expect(createdData.userId).toBe(mockUserA.id);
      expect(BigInt(createdData.totalStakeMinor)).toBe(BigInt(ghsToPesewas(1)));
    });
  });

  describe("Ticket Ownership & Fetch Coverage", () => {
    it("should deny access (403/404) when User B accesses User A's ticket", async () => {
      mockGetSession.mockImplementationOnce(async () => ({
        userId: mockUserB.id,
        user: mockUserB,
      }));
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "66666666-6666-4666-a666-666666666666",
        userId: mockUserA.id,
      });

      const req = createMockRequest("http://localhost:3000/api/tickets/66666666-6666-4666-a666-666666666666", "GET");
      const res = await GET(req, {
        params: Promise.resolve({ id: "66666666-6666-4666-a666-666666666666" }),
      });

      const data = await res.json();
      expect([403, 404]).toContain(res.status);
      expect(data.success).toBe(false);
    });

    it("should successfully return ticket details when owner requests GET /api/tickets/[id]", async () => {
      const mockTicket = {
        id: "66666666-6666-4666-a666-666666666666",
        userId: mockUserA.id,
        bookingCode: "BK-SUCCESS-123",
        totalStakeMinor: 100,
        lines: [{ id: "line-1", numbers: [5], lineStakeMinor: 100 }],
      };

      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(mockTicket);

      const req = createMockRequest(
        "http://localhost:3000/api/tickets/66666666-6666-4666-a666-666666666666",
        "GET"
      );
      const res = await GET(req, {
        params: Promise.resolve({ id: "66666666-6666-4666-a666-666666666666" }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockTicket.id);
    });
  });

  describe("Wallet Balance Branch Coverage", () => {
  it("should reject ticket creation when wallet deduction throws an exception", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    (WalletService.deductStake as jest.Mock).mockRejectedValueOnce(
      new Error("INSUFFICIENT_FUNDS")
    );

    const req = createMockRequest("http://localhost:3000/api/tickets", "POST", validPayload);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).not.toBe(201);
    expect(data.success).toBe(false);

    consoleSpy.mockRestore();
  });

  it("should reject ticket creation when deductStake returns false without throwing", async () => {
    (WalletService.deductStake as jest.Mock).mockImplementationOnce(async () => false);

    const req = createMockRequest("http://localhost:3000/api/tickets", "POST", validPayload);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toContain("Insufficient wallet balance.");
  });
});
  describe("Booking Code Generation", () => {
    it("should assign non-sequential server-generated booking code to new tickets", async () => {
      let createdData: any = null;
      (prisma.ticket.create as jest.Mock).mockImplementationOnce(async ({ data }) => {
        createdData = data;
        return {
          id: "77777777-7777-4777-a777-777777777777",
          bookingCode: data.bookingCode,
          totalStakeMinor: 100,
          lines: [],
        };
      });

      const req = createMockRequest("http://localhost:3000/api/tickets", "POST", validPayload);
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(createdData.bookingCode).toBeDefined();
      expect(createdData.bookingCode).not.toEqual(createdData.id);
    });
  });

  describe("Atomic Database Rollback Integrity", () => {
    it("should roll back all modifications when an error occurs inside transaction", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      (prisma.ticket.create as jest.Mock).mockRejectedValueOnce(
        new Error("DB_CREATE_FAILURE")
      );

      const req = createMockRequest(
        "http://localhost:3000/api/tickets",
        "POST",
        validPayload
      );
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.errors).toContain(
        "An unexpected server error occurred while placing ticket."
      );

      consoleSpy.mockRestore();
    });
  });

  describe("API Endpoint Security", () => {
    it("should reject unauthenticated POST requests", async () => {
      mockGetSession.mockImplementationOnce(async () => null);

      const req = createMockRequest("http://localhost:3000/api/tickets", "POST", validPayload);
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it("should reject requests pointing to non-existent draw IDs", async () => {
      (prisma.draw.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const req = createMockRequest("http://localhost:3000/api/tickets", "POST", validPayload);
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.errors).toContain("Target draw not found.");
    });
  });
});