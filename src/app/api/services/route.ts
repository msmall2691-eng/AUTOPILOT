export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!session.companyId) {
      return NextResponse.json(
        { error: "No company associated with this account" },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const services = await prisma.service.findMany({
      where: { companyId: session.companyId, isActive: true },
      orderBy: { name: "asc" },
      take: limit,
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session || !session.companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, duration, price } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Service name is required" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        companyId: session.companyId,
        name: name.trim(),
        description: description?.trim() || null,
        duration: duration ?? 60,
        price: price ?? 0,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
