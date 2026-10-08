import { NextRequest } from "next/server";
import { POST as createDrawHandler } from "../src/app/api/admin/draws/route";
import { POST as setWinningNumberHandler } from "../src/app/api/admin/draws/[id]/winning-number/route";
import { POST as settleDrawHandler } from "../src/app/api/admin/draws/[id]/settle/route";
import { AdminDrawService } from "../src/services/admin-draw.service";
import { DrawSettlementService } from "../src/services/draw-settlement.service";

jest.mock("../src/services/admin-draw.service");
jest.mock("../src/services/draw-settlement.service");

describe("API Route Handlers - HTTP Error Coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/admin/draws", () => {
    test("should return 400 Bad Request if admin authorization header is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/draws", {
        method: "POST",
        body: JSON.stringify({
          gameId: "game-123",
          drawNumber: "101",
          scheduledAt: new Date().toISOString(),
        }),
      });

      const response = await createDrawHandler(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    test("should return 400 Bad Request when required body parameters are missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/draws", {
        method: "POST",
        headers: {
          "x-admin-user-id": "admin-123",
        },
        body: JSON.stringify({
          gameId: "game-123",
        }),
      });

      const response = await createDrawHandler(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing required fields.");
    });

    test("should return 500 or 400 when service throws an exception", async () => {
      (AdminDrawService.createDraw as jest.Mock).mockRejectedValue(new Error("Database connection failed"));

      const req = new NextRequest("http://localhost:3000/api/admin/draws", {
        method: "POST",
        headers: {
          "x-admin-user-id": "admin-123",
        },
        body: JSON.stringify({
          gameId: "game-123",
          drawNumber: "101",
          scheduledAt: new Date().toISOString(),
        }),
      });

      const response = await createDrawHandler(req);
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data).toHaveProperty("error");
    });
  });

  describe("POST /api/admin/draws/[id]/winning-number", () => {
    test("should return 400 Bad Request if admin headers are omitted", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/draws/draw-123/winning-number", {
        method: "POST",
        body: JSON.stringify({ winningNumbers: [1, 2, 3, 4, 5] }),
      });

      const response = await setWinningNumberHandler(req, { params: Promise.resolve({ id: "draw-123" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    test("should return 400 Bad Request when winningNumbers is not an array or is empty", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/draws/draw-123/winning-number", {
        method: "POST",
        headers: {
          "x-admin-user-id": "admin-123",
          "content-type": "application/json",
        },
        body: JSON.stringify({ winningNumbers: [] }),
      });

      const response = await setWinningNumberHandler(req, { params: Promise.resolve({ id: "draw-123" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    test("should return error message when service rejects edit", async () => {
      (AdminDrawService.setWinningNumbers as jest.Mock).mockRejectedValue(
        new Error("Cannot edit results for a published draw")
      );

      const req = new NextRequest("http://localhost:3000/api/admin/draws/draw-123/winning-number", {
        method: "POST",
        headers: { "x-admin-user-id": "admin-123" },
        body: JSON.stringify({ winningNumbers: [1, 2, 3, 4, 5] }),
      });

      const response = await setWinningNumberHandler(req, { params: Promise.resolve({ id: "draw-123" }) });
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data).toHaveProperty("error");
    });
  });

  describe("POST /api/admin/draws/[id]/settle", () => {
    test("should return 400 Bad Request if admin user header is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/draws/draw-123/settle", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await settleDrawHandler(req, { params: Promise.resolve({ id: "draw-123" }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    test("should return error when attempting to settle draw without winning numbers", async () => {
      (DrawSettlementService.settleDraw as jest.Mock).mockRejectedValue(new Error("Winning numbers not set"));

      const req = new NextRequest("http://localhost:3000/api/admin/draws/draw-123/settle", {
        method: "POST",
        headers: { "x-admin-user-id": "admin-123" },
        body: JSON.stringify({ adminUserId: "admin-123" }),
      });

      const response = await settleDrawHandler(req, { params: Promise.resolve({ id: "draw-123" }) });
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(data).toHaveProperty("error");
    });
  });
});