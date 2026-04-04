export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma, schemaReady } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!session.companyId) {
      return NextResponse.json(
        { error: "No company associated with this account" },
        { status: 401 }
      );
    }

    const companyId = session.companyId;

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      companyId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { estimateNumber: { contains: search } },
        { client: { firstName: { contains: search } } },
        { client: { lastName: { contains: search } } },
        { client: { email: { contains: search } } },
      ];
    }

    const [estimates, total] = await Promise.all([
      prisma.estimate.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          lineItems: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.estimate.count({ where }),
    ]);

    return NextResponse.json({
      estimates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List estimates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!session.companyId) {
      return NextResponse.json(
        { error: "No company associated with this account" },
        { status: 401 }
      );
    }

    const companyId = session.companyId;

    const body = await request.json();
    const { clientId, validUntil, lineItems, taxRate, notes, status } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: "Client is required" },
        { status: 400 }
      );
    }

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: "At least one line item is required" },
        { status: 400 }
      );
    }

    // Generate estimate number
    const settings = await prisma.companySettings.findUnique({
      where: { companyId },
    });

    const prefix = settings?.estimatePrefix || "EST";

    const lastEstimate = await prisma.estimate.findFirst({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      select: { estimateNumber: true },
    });

    let nextNum = 1001;
    if (lastEstimate?.estimateNumber) {
      const match = lastEstimate.estimateNumber.match(/(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    const estimateNumber = `${prefix}-${String(nextNum).padStart(4, "0")}`;

    // Calculate totals
    const computedItems = lineItems.map(
      (item: { name: string; description?: string; quantity: number; unitPrice: number }) => ({
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: Math.round(item.quantity * item.unitPrice * 100) / 100,
      })
    );

    const subtotal =
      Math.round(
        computedItems.reduce(
          (sum: number, item: { total: number }) => sum + item.total,
          0
        ) * 100
      ) / 100;

    const effectiveTaxRate = taxRate ?? settings?.taxRate ?? 0;
    const taxAmount = Math.round(subtotal * (effectiveTaxRate / 100) * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const estimateStatus = status === "sent" ? "sent" : "draft";

    const estimate = await prisma.estimate.create({
      data: {
        companyId,
        clientId,
        createdById: session.id,
        estimateNumber,
        status: estimateStatus,
        subtotal,
        taxRate: effectiveTaxRate,
        taxAmount,
        totalAmount,
        validUntil: validUntil ? new Date(validUntil) : null,
        sentAt: estimateStatus === "sent" ? new Date() : null,
        notes: notes || null,
        lineItems: {
          create: computedItems,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lineItems: true,
      },
    });

    return NextResponse.json({ estimate }, { status: 201 });
  } catch (error) {
    console.error("Create estimate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
