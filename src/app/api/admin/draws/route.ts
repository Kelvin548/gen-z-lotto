import { NextResponse } from "next/server";
import { AdminDrawService } from "@/services/admin-draw.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const draws = await prisma.draw.findMany({
      include: {
        game: { select: { name: true, slug: true } },
        _count: { select: { tickets: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: draws });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gameId, drawNumber, scheduledAt, adminUserId } = body;

    if (!gameId || !drawNumber || !scheduledAt || !adminUserId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const draw = await AdminDrawService.createDraw({
      gameId,
      drawNumber,
      scheduledAt: new Date(scheduledAt),
      adminUserId,
    });

    return NextResponse.json({ success: true, data: draw }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}