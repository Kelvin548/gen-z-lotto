import { NextResponse } from "next/server";
import { DrawSettlementService } from "@/services/draw-settlement.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { adminUserId } = body;

    if (!adminUserId) {
      return NextResponse.json(
        { success: false, error: "Admin user ID required." },
        { status: 400 }
      );
    }

    const draw = await DrawSettlementService.settleDraw(id, adminUserId);
    return NextResponse.json({ success: true, data: draw });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}