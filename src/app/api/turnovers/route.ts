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
    const status = searchParams.get("status");
    const propertyId = searchParams.get("propertyId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {
      property: { companyId: session.companyId },
    };
    if (status) where.status = status;
    if (propertyId) where.propertyId = propertyId;
    if (dateFrom || dateTo) {
      where.guestCheckout = {};
      if (dateFrom) (where.guestCheckout as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.guestCheckout as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59Z");
    }

    const turnovers = await prisma.turnover.findMany({
      where,
      include: {
        property: { select: { id: true, name: true } },
        job: { select: { id: true, title: true, assignedTo: { select: { id: true, firstName: true, lastName: true } } } },
      },
      orderBy: { guestCheckout: "desc" },
      take: 100,
    });

    // Also fetch properties for filter dropdown
    const properties = await prisma.property.findMany({
      where: { companyId: session.companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    // Fetch team members for cleaner filter
    const team = await prisma.user.findMany({
      where: { companyId: session.companyId, isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ turnovers, properties, team });
  } catch (error) {
    console.error("GET /api/turnovers error:", error);
    return NextResponse.json({ error: "Failed to fetch turnovers" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    if (!session?.companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Turnover ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.turnover.findFirst({
      where: { id, property: { companyId: session.companyId } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Turnover not found" }, { status: 404 });
    }

    const turnover = await prisma.turnover.update({
      where: { id },
      data: { ...(status && { status }) },
    });

    return NextResponse.json({ turnover });
  } catch (error) {
    console.error("PATCH /api/turnovers error:", error);
    return NextResponse.json({ error: "Failed to update turnover" }, { status: 500 });
  }
}
