import { POST as createDrawHandler } from "../src/app/api/admin/draws/route";
import { POST as setWinningNumberHandler } from "../src/app/api/admin/draws/[id]/winning-number/route";
import { POST as settleDrawHandler } from "../src/app/api/admin/draws/[id]/settle/route";
import { AdminDrawService } from "../src/services/admin-draw.service";
import { DrawSettlementService } from "../src/services/draw-settlement.service";

jest.mock("../src/services/admin-draw.service");
jest.mock("../src/services/draw-settlement.service");

describe("PHASE 4D.1 — API Route Coverage & Guardrail Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. POST /api/admin/draws (Draw Creation)", () => {
    test("SUCCESS: Creates draw with valid parameters and admin session", async () => {
      const mockCreatedDraw = {
        id: "draw-999",
        gameId: "game-123",
        drawNumber: "101",
        status: "SCHEDULED",
        scheduledAt: new Date().toISOString(),
      };
      (AdminDrawService.createDraw as jest.Mock).mockResolvedValue(mockCreatedDraw);

      const req = new Request("http://localhost:3000/api/admin/draws", {
        method: "POST",
        headers: {
          "x-admin-user-id": "admin-1",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          adminUserId: "admin-1",
          gameId: "game-123",
          drawNumber: "101",
          scheduledAt: new Date().toISOString(),
        }),
      });

      const res = await createDrawHandler(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data).toHaveProperty("id", "draw-999");
      expect(AdminDrawService.createDraw).toHaveBeenCalledTimes(1);
    });

    test("AUTH FAILURE: Missing admin credentials", async () => {
      const req = new Request("http://localhost:3000/api/admin/draws", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gameId: "game-123", drawNumber: "101", scheduledAt: new Date().toISOString() }),
      });

      const res = await createDrawHandler(req);
      expect(res.status).toBe(400);
    });

    test("INVALID PAYLOAD: Missing scheduledAt parameter", async () => {
      const req = new Request("http://localhost:3000/api/admin/draws", {
        method: "POST",
        headers: {
          "x-admin-user-id": "admin-1",
          "content-type": "application/json",
        },
        body: JSON.stringify({ gameId: "game-123" }),
      });

      const res = await createDrawHandler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Missing required fields.");
    });
  });
  
  describe("2. POST /api/admin/draws/[id]/winning-number (Resulting & State Transition)", () => {
    test("SUCCESS: Sets winning numbers for valid scheduled draw", async () => {
      const mockResult = { id: "draw-123", status: "RESULTED", winningNumbers: [5, 12, 23, 34, 45] };
      (AdminDrawService.setWinningNumbers as jest.Mock).mockResolvedValue(mockResult);

      const req = new Request("http://localhost:3000/api/admin/draws/draw-123/winning-number", {
        method: "POST",
        headers: {
          "x-admin-user-id": "admin-1",
          "content-type": "application/json",
        },
        body: JSON.stringify({ winningNumbers: [5, 12, 23, 34, 45] }),
      });

      const res = await setWinningNumberHandler(req, { params: Promise.resolve({ id: "draw-123" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe("RESULTED");
    });

    test("LOCKED DRAW FAILURE: Rejects modification on already settled/completed draw", async () => {
      (AdminDrawService.setWinningNumbers as jest.Mock).mockRejectedValue(
        new Error("Cannot set winning numbers for a draw that is already settled.")
      );

      const req = new Request("http://localhost:3000/api/admin/draws/draw-123/winning-number", {
        method: "POST",
        headers: {
          "x-admin-user-id": "admin-1",
          "content-type": "application/json",
        },
        body: JSON.stringify({ winningNumbers: [1, 2, 3, 4, 5] }),
      });

      const res = await setWinningNumberHandler(req, { params: Promise.resolve({ id: "draw-123" }) });
      const data = await res.json();

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(data.error).toBe("Cannot set winning numbers for a draw that is already settled.");
    });
  });

  describe("3. POST /api/admin/draws/[id]/settle (Settlement & Idempotency)", () => {
    test("SUCCESS: Settles draw and processes payouts", async () => {
      const mockSettlement = { id: "draw-123", status: "SETTLED", settledTicketsCount: 42, totalPayout: 1500.0 };
      (DrawSettlementService.settleDraw as jest.Mock).mockResolvedValue(mockSettlement);

      const req = new Request("http://localhost:3000/api/admin/draws/draw-123/settle", {
        method: "POST",
        headers: {
          "x-admin-user-id": "admin-1",
          "content-type": "application/json",
        },
        body: JSON.stringify({ adminUserId: "admin-1" }),
      });

      const res = await settleDrawHandler(req, { params: Promise.resolve({ id: "draw-123" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.status).toBe("SETTLED");
      expect(data.data.settledTicketsCount).toBe(42);
    });

    test("DUPLICATE SETTLEMENT PROTECTION: Prevents secondary execution", async () => {
      (DrawSettlementService.settleDraw as jest.Mock).mockRejectedValue(
        new Error("Draw is already settled.")
      );

      const req = new Request("http://localhost:3000/api/admin/draws/draw-123/settle", {
        method: "POST",
        headers: {
          "x-admin-user-id": "admin-1",
          "content-type": "application/json",
        },
        body: JSON.stringify({ adminUserId: "admin-1" }),
      });

      const res = await settleDrawHandler(req, { params: Promise.resolve({ id: "draw-123" }) });
      const data = await res.json();

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(data.error).toBe("Draw is already settled.");
    });
  });
});