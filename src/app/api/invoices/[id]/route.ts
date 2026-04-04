export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/invoices/[id] — Fetch a single invoice with all relations
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

    const invoice = await prisma.invoice.findFirst({
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
        job: {
          select: { id: true, title: true, trackingNumber: true },
        },
        lineItems: true,
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("GET /api/invoices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/invoices/[id] — Update invoice fields
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

    const existing = await prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if ("status" in body) {
      data.status = body.status;

      // Set paidAt when status changes to "paid"
      if (body.status === "paid" && existing.status !== "paid") {
        data.paidAt = new Date();
      }

      // Set sentAt when status changes to "sent"
      if (body.status === "sent" && existing.status !== "sent") {
        data.sentAt = new Date();
      }
    }

    if ("dueDate" in body) {
      data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    if ("notes" in body) {
      data.notes =
        typeof body.notes === "string" ? body.notes.trim() : body.notes;
    }

    if ("tipAmount" in body) {
      data.tipAmount = body.tipAmount;
    }

    const invoice = await prisma.invoice.update({
      where: { id, companyId },
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
        payments: true,
      },
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("PATCH /api/invoices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/invoices/[id] — Delete invoice (only drafts)
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

    const existing = await prisma.invoice.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft invoices can be deleted" },
        { status: 400 }
      );
    }

    // Line items cascade-delete automatically
    await prisma.invoice.delete({ where: { id, companyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/invoices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
