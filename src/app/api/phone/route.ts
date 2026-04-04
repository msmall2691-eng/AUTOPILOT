export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    if (!session?.companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const direction = searchParams.get("direction");

    const where: Record<string, unknown> = { companyId: session.companyId };
    if (direction && direction !== "all") {
      if (direction === "missed") {
        where.status = "missed";
      } else {
        where.direction = direction;
      }
    }

    const calls = await prisma.callLog.findMany({
      where,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error("GET /api/phone error:", error);
    return NextResponse.json({ error: "Failed to fetch call logs" }, { status: 500 });
  }
}
