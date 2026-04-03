export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/estimates/[id] — Fetch a single estimate with all relations
// ---------------------------------------------------------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const companyId = session.companyId;

    const estimate = await prisma.estimate.findFirst({
      where: { id, companyId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        lineItems: true,
      },
    });

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ estimate });
  } catch (error) {
    console.error("GET /api/estimates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch estimate" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/estimates/[id] — Update estimate fields
// ---------------------------------------------------------------------------
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const companyId = session.companyId;

    const existing = await prisma.estimate.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if ("status" in body) {
      data.status = body.status;

      // Set sentAt when status changes to "sent"
      if (body.status === "sent" && existing.status !== "sent") {
        data.sentAt = new Date();
      }

      // Set respondedAt when status changes to "accepted" or "declined"
      if (
        (body.status === "accepted" || body.status === "declined") &&
        existing.status !== "accepted" &&
        existing.status !== "declined"
      ) {
        data.respondedAt = new Date();
      }
    }

    if ("notes" in body) {
      data.notes =
        typeof body.notes === "string" ? body.notes.trim() : body.notes;
    }

    if ("validUntil" in body) {
      data.validUntil = body.validUntil ? new Date(body.validUntil) : null;
    }

    const estimate = await prisma.estimate.update({
      where: { id },
      data,
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

    return NextResponse.json({ estimate });
  } catch (error) {
    console.error("PATCH /api/estimates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update estimate" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/estimates/[id] — Convert estimate to invoice
// ---------------------------------------------------------------------------
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const companyId = session.companyId;

    const estimate = await prisma.estimate.findFirst({
      where: { id, companyId },
      include: { lineItems: true },
    });

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // Generate invoice number
    const settings = await prisma.companySettings.findUnique({
      where: { companyId },
    });

    const prefix = settings?.invoicePrefix || "INV";

    const lastInvoice = await prisma.invoice.findFirst({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });

    let nextNum = 1001;
    if (lastInvoice?.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    const invoiceNumber = `${prefix}-${String(nextNum).padStart(4, "0")}`;

    // Create invoice from estimate data
    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        clientId: estimate.clientId,
        createdById: session.id,
        invoiceNumber,
        status: "draft",
        subtotal: estimate.subtotal,
        taxRate: estimate.taxRate,
        taxAmount: estimate.taxAmount,
        totalAmount: estimate.totalAmount,
        notes: estimate.notes,
        lineItems: {
          create: estimate.lineItems.map((item) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
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

    // Mark estimate as converted
    await prisma.estimate.update({
      where: { id },
      data: { status: "accepted" },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("POST /api/estimates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to convert estimate to invoice" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/estimates/[id] — Delete estimate (only drafts)
// ---------------------------------------------------------------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const companyId = session.companyId;

    const existing = await prisma.estimate.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft estimates can be deleted" },
        { status: 400 }
      );
    }

    // Line items cascade-delete automatically
    await prisma.estimate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/estimates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete estimate" },
      { status: 500 }
    );
  }
}
