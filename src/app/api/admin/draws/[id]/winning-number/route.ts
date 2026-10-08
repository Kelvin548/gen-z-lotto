import { NextResponse } from "next/server";
import { AdminDrawService } from "@/services/admin-draw.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { winningNumbers, adminUserId } = body;

    const adminId = adminUserId || req.headers.get("x-admin-user-id");

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin user ID required." },
        { status: 400 }
      );
    }

    const draw = await AdminDrawService.setWinningNumbers(id, winningNumbers, adminId);
    return NextResponse.json(draw);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}