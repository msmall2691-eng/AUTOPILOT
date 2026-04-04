export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma, schemaReady } from "@/lib/db";
import { generateTrackingNumber } from "@/lib/utils";

// ---------------------------------------------------------------------------
// GET /api/jobs — List jobs with filtering, search, and pagination
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    await schemaReady;
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

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: Record<string, unknown> = {
      companyId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { trackingNumber: { contains: search } },
        { client: { firstName: { contains: search } } },
        { client: { lastName: { contains: search } } },
      ];
    }

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        dateFilter.lte = to;
      }
      where.scheduledDate = dateFilter;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          client: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          assignedTo: {
            select: { id: true, firstName: true, lastName: true },
          },
          service: {
            select: { id: true, name: true },
          },
          lineItems: true,
        },
        orderBy: { scheduledDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/jobs — Create a new job
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
      assignedToId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      address,
      city,
      state,
      zip,
      priority,
      lineItems,
      internalNotes,
    } = body;

    // Validate required fields
    if (!clientId) {
      return NextResponse.json({ error: "Client is required" }, { status: 400 });
    }
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!scheduledDate) {
      return NextResponse.json({ error: "Scheduled date is required" }, { status: 400 });
    }

    // Calculate total from line items
    let totalAmount = 0;
    const parsedLineItems: { name: string; description?: string; quantity: number; unitPrice: number; total: number }[] = [];

    if (Array.isArray(lineItems)) {
      for (const item of lineItems) {
        if (!item.name || item.name.trim() === "") continue;
        const qty = parseFloat(item.quantity) || 1;
        const price = parseFloat(item.unitPrice) || 0;
        const lineTotal = Math.round(qty * price * 100) / 100;
        totalAmount += lineTotal;
        parsedLineItems.push({
          name: item.name.trim(),
          description: item.description || undefined,
          quantity: qty,
          unitPrice: price,
          total: lineTotal,
        });
      }
    }

    totalAmount = Math.round(totalAmount * 100) / 100;

    // Generate a unique tracking number — retry if collision (unlikely)
    let trackingNumber = generateTrackingNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.job.findUnique({
        where: { trackingNumber },
        select: { id: true },
      });
      if (!existing) break;
      trackingNumber = generateTrackingNumber();
      attempts++;
    }

    const job = await prisma.job.create({
      data: {
        companyId,
        clientId,
        serviceId: serviceId || undefined,
        assignedToId: assignedToId || undefined,
        createdById: session.id,
        title: title.trim(),
        description: description?.trim() || undefined,
        status: "scheduled",
        priority: priority || "normal",
        scheduledDate: new Date(scheduledDate),
        scheduledTime: scheduledTime || undefined,
        address: address?.trim() || undefined,
        city: city?.trim() || undefined,
        state: state?.trim() || undefined,
        zip: zip?.trim() || undefined,
        totalAmount,
        internalNotes: internalNotes?.trim() || undefined,
        trackingNumber,
        lineItems: {
          create: parsedLineItems,
        },
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        service: {
          select: { id: true, name: true },
        },
        lineItems: true,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
