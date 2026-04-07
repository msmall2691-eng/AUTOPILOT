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

    const sequences = await prisma.sequence.findMany({
      where: { companyId: session.companyId },
      include: {
        steps: { orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sequences });
  } catch (error) {
    console.error("GET /api/marketing/sequences error:", error);
    return NextResponse.json({ error: "Failed to fetch sequences" }, { status: 500 });
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
    const { name, trigger, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Sequence name is required" }, { status: 400 });
    }

    const sequence = await prisma.sequence.create({
      data: {
        companyId: session.companyId,
        name: name.trim(),
        trigger: trigger || "job_completed",
        description: description?.trim() || null,
        isActive: false,
        steps: {
          create: [
            { order: 1, type: "sms", content: "Welcome message" },
            { order: 2, type: "delay", delayHours: 24 },
            { order: 3, type: "email", content: "Follow-up email", subject: "Following up" },
          ],
        },
      },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ sequence }, { status: 201 });
  } catch (error) {
    console.error("POST /api/marketing/sequences error:", error);
    return NextResponse.json({ error: "Failed to create sequence" }, { status: 500 });
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
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Sequence ID is required" }, { status: 400 });
    }

    const existing = await prisma.sequence.findFirst({
      where: { id, companyId: session.companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
    }

    const sequence = await prisma.sequence.update({
      where: { id },
      data: { isActive: typeof isActive === "boolean" ? isActive : existing.isActive },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ sequence });
  } catch (error) {
    console.error("PATCH /api/marketing/sequences error:", error);
    return NextResponse.json({ error: "Failed to update sequence" }, { status: 500 });
  }
}
