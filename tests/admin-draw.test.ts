import { AdminDrawService } from "../src/services/admin-draw.service";
import { DrawStatus } from "@prisma/client";

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    draw: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
    DrawStatus: {
      DRAFT: "DRAFT",
      SCHEDULED: "SCHEDULED",
      OPEN: "OPEN",
      CLOSED: "CLOSED",
      RESULT_PENDING: "RESULT_PENDING",
      RESULT_PUBLISHED: "RESULT_PUBLISHED",
      CANCELLED: "CANCELLED",
    },
  };
});

import { PrismaClient } from "@prisma/client";
const mockPrisma = new PrismaClient() as any;

describe("AdminDrawService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createDraw", () => {
    it("should create a draw with SCHEDULED status and log an audit entry if adminUserId is provided", async () => {
      const mockDraw = {
        id: "draw-uuid-1",
        gameId: "game-uuid-1",
        drawNumber: "DW-001",
        scheduledAt: new Date(),
        status: DrawStatus.SCHEDULED,
      };

      mockPrisma.draw.create.mockResolvedValueOnce(mockDraw);
      mockPrisma.auditLog.create.mockResolvedValueOnce({ id: "audit-1" });

      const result = await AdminDrawService.createDraw({
        gameId: "game-uuid-1",
        drawNumber: "DW-001",
        scheduledAt: new Date(),
        adminUserId: "admin-uuid-1",
      });

      expect(result).toEqual(mockDraw);
      expect(mockPrisma.draw.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          gameId: "game-uuid-1",
          status: DrawStatus.SCHEDULED,
        }),
      });
      expect(mockPrisma.auditLog.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateDrawStatus", () => {
    it("should successfully update draw status on a valid transition", async () => {
      const existingDraw = {
        id: "draw-uuid-1",
        status: DrawStatus.SCHEDULED,
        closedAt: null,
      };

      const updatedDraw = {
        ...existingDraw,
        status: DrawStatus.OPEN,
      };

      mockPrisma.draw.findUnique.mockResolvedValueOnce(existingDraw);
      mockPrisma.draw.update.mockResolvedValueOnce(updatedDraw);
      mockPrisma.auditLog.create.mockResolvedValueOnce({ id: "audit-2" });

      const result = await AdminDrawService.updateDrawStatus(
        "draw-uuid-1",
        DrawStatus.OPEN,
        "admin-uuid-1"
      );

      expect(result.status).toBe(DrawStatus.OPEN);
      expect(mockPrisma.draw.update).toHaveBeenCalledWith({
        where: { id: "draw-uuid-1" },
        data: { status: DrawStatus.OPEN },
      });
    });

    it("should throw an error on an invalid status transition", async () => {
      const existingDraw = {
        id: "draw-uuid-1",
        status: DrawStatus.RESULT_PUBLISHED, // Published cannot transition further
      };

      mockPrisma.draw.findUnique.mockResolvedValueOnce(existingDraw);

      await expect(
        AdminDrawService.updateDrawStatus(
          "draw-uuid-1",
          DrawStatus.OPEN,
          "admin-uuid-1"
        )
      ).rejects.toThrow("Invalid status transition from RESULT_PUBLISHED to OPEN");
    });
  });

  describe("setWinningNumbers", () => {
    it("should successfully set winning numbers when draw is closed", async () => {
      const existingDraw = {
        id: "draw-uuid-1",
        status: DrawStatus.CLOSED,
      };

      const drawWithNumbers = {
        ...existingDraw,
        winningNumber: { id: "wn-1", numbers: [5, 12, 23, 34, 45] },
      };

      mockPrisma.draw.findUnique.mockResolvedValueOnce(existingDraw);
      mockPrisma.draw.update.mockResolvedValueOnce(drawWithNumbers);
      mockPrisma.auditLog.create.mockResolvedValueOnce({ id: "audit-3" });

      const result = await AdminDrawService.setWinningNumbers(
        "draw-uuid-1",
        [5, 12, 23, 34, 45],
        "admin-uuid-1"
      );

      expect(result.winningNumber.numbers).toEqual([5, 12, 23, 34, 45]);
      expect(mockPrisma.draw.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "draw-uuid-1" },
          data: expect.objectContaining({
            winningNumber: expect.any(Object),
          }),
        })
      );
    });

    it("should throw an error if attempting to edit winning numbers for a published draw", async () => {
      const existingDraw = {
        id: "draw-uuid-1",
        status: DrawStatus.RESULT_PUBLISHED,
      };

      mockPrisma.draw.findUnique.mockResolvedValueOnce(existingDraw);

      await expect(
        AdminDrawService.setWinningNumbers(
          "draw-uuid-1",
          [1, 2, 3, 4, 5],
          "admin-uuid-1"
        )
      ).rejects.toThrow("Cannot edit results for a published draw");
    });
  });
});