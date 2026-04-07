export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/recurring — List recurring schedules for the company
// ---------------------------------------------------------------------------
export async function GET() {
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

    const companyId = session.companyId;

    const schedules = await prisma.recurringSchedule.findMany({
      where: { companyId },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        service: {
          select: { id: true, name: true },
        },
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("List recurring schedules error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/recurring — Create a recurring schedule
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
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

    const companyId = session.companyId;
    const body = await request.json();

    const {
      clientId,
      serviceId,
      title,
      description,
      frequency,
      startDate,
      endDate,
      dayOfWeek,
      dayOfMonth,
      preferredTime,
      estimatedDuration,
      address,
      city,
      state,
      zip,
      totalAmount,
      assignedToId,
      notes,
    } = body;

    // Validate required fields
    if (!clientId) {
      return NextResponse.json({ error: "Client is required" }, { status: 400 });
    }
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!frequency) {
      return NextResponse.json({ error: "Frequency is required" }, { status: 400 });
    }
    if (!startDate) {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 });
    }

    const validFrequencies = ["once", "weekly", "biweekly", "monthly", "custom"];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: `Invalid frequency. Must be one of: ${validFrequencies.join(", ")}` },
        { status: 400 }
      );
    }

    const schedule = await prisma.recurringSchedule.create({
      data: {
        companyId,
        clientId,
        serviceId: serviceId || undefined,
        title: title.trim(),
        description: description?.trim() || undefined,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        dayOfWeek: dayOfWeek || undefined,
        dayOfMonth: dayOfMonth != null ? parseInt(dayOfMonth, 10) : undefined,
        preferredTime: preferredTime || undefined,
        estimatedDuration: estimatedDuration
          ? parseInt(estimatedDuration, 10)
          : undefined,
        address: address?.trim() || undefined,
        city: city?.trim() || undefined,
        state: state?.trim() || undefined,
        zip: zip?.trim() || undefined,
        totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
        assignedToId: assignedToId || undefined,
        notes: notes?.trim() || undefined,
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        service: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("Create recurring schedule error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/recurring — Update a recurring schedule
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest) {
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

    const companyId = session.companyId;
    const body = await request.json();

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.recurringSchedule.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Recurring schedule not found" },
        { status: 404 }
      );
    }

    // Build data object from allowed fields
    const data: Record<string, unknown> = {};

    if (updates.clientId !== undefined) data.clientId = updates.clientId;
    if (updates.serviceId !== undefined) data.serviceId = updates.serviceId || null;
    if (updates.title !== undefined) data.title = updates.title.trim();
    if (updates.description !== undefined)
      data.description = updates.description?.trim() || null;
    if (updates.frequency !== undefined) {
      const validFrequencies = ["once", "weekly", "biweekly", "monthly", "custom"];
      if (!validFrequencies.includes(updates.frequency)) {
        return NextResponse.json(
          { error: `Invalid frequency. Must be one of: ${validFrequencies.join(", ")}` },
          { status: 400 }
        );
      }
      data.frequency = updates.frequency;
    }
    if (updates.startDate !== undefined)
      data.startDate = new Date(updates.startDate);
    if (updates.endDate !== undefined)
      data.endDate = updates.endDate ? new Date(updates.endDate) : null;
    if (updates.dayOfWeek !== undefined)
      data.dayOfWeek = updates.dayOfWeek || null;
    if (updates.dayOfMonth !== undefined)
      data.dayOfMonth = updates.dayOfMonth != null ? parseInt(updates.dayOfMonth, 10) : null;
    if (updates.preferredTime !== undefined)
      data.preferredTime = updates.preferredTime || null;
    if (updates.estimatedDuration !== undefined)
      data.estimatedDuration = updates.estimatedDuration
        ? parseInt(updates.estimatedDuration, 10)
        : null;
    if (updates.address !== undefined)
      data.address = updates.address?.trim() || null;
    if (updates.city !== undefined) data.city = updates.city?.trim() || null;
    if (updates.state !== undefined) data.state = updates.state?.trim() || null;
    if (updates.zip !== undefined) data.zip = updates.zip?.trim() || null;
    if (updates.totalAmount !== undefined)
      data.totalAmount = parseFloat(updates.totalAmount) || 0;
    if (updates.assignedToId !== undefined)
      data.assignedToId = updates.assignedToId || null;
    if (updates.isActive !== undefined) data.isActive = Boolean(updates.isActive);
    if (updates.notes !== undefined)
      data.notes = updates.notes?.trim() || null;

    const schedule = await prisma.recurringSchedule.update({
      where: { id },
      data,
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        service: {
          select: { id: true, name: true },
        },
        _count: {
          select: { jobs: true },
        },
      },
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Update recurring schedule error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/recurring — Deactivate a recurring schedule
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
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

    const companyId = session.companyId;
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.recurringSchedule.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Recurring schedule not found" },
        { status: 404 }
      );
    }

    await prisma.recurringSchedule.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Deactivate recurring schedule error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
