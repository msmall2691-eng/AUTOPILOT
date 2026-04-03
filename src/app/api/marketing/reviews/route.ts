export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    if (!session?.companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const reviews = await prisma.reviewRequest.findMany({
      where: { companyId: session.companyId },
      orderBy: { sentAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("GET /api/marketing/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    if (!session?.companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { clientName, clientEmail, clientPhone, platform } = body;

    if (!clientName?.trim()) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    const review = await prisma.reviewRequest.create({
      data: {
        companyId: session.companyId,
        clientName: clientName.trim(),
        clientEmail: clientEmail?.trim() || null,
        clientPhone: clientPhone?.trim() || null,
        platform: platform || "google",
        status: "sent",
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("POST /api/marketing/reviews error:", error);
    return NextResponse.json({ error: "Failed to create review request" }, { status: 500 });
  }
}
