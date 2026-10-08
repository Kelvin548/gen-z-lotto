import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return auth.response;
    }

    const { id } = await context.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        lines: true,
        draw: {
          select: {
            id: true,
            drawNumber: true,
            scheduledAt: true,
            status: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, errors: ["Ticket not found."] },
        { status: 404 }
      );
    }

    if (ticket.userId !== auth.user.id && auth.session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, errors: ["Access denied."] },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...ticket,
          totalStakeMinor: ticket.totalStakeMinor.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      {
        success: false,
        errors: ["An unexpected server error occurred while fetching the ticket."],
      },
      { status: 500 }
    );
  }
}