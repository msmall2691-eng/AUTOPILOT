export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/clients/[id] — Fetch a single client with related data
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

    const client = await prisma.client.findFirst({
      where: { id, companyId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const [recentJobs, recentInvoices, jobCount, invoiceCount, estimateCount] =
      await Promise.all([
        prisma.job.findMany({
          where: { clientId: id, companyId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            scheduledDate: true,
            totalAmount: true,
          },
        }),
        prisma.invoice.findMany({
          where: { clientId: id, companyId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalAmount: true,
          },
        }),
        prisma.job.count({ where: { clientId: id, companyId } }),
        prisma.invoice.count({ where: { clientId: id, companyId } }),
        prisma.estimate.count({ where: { clientId: id, companyId } }),
      ]);

    return NextResponse.json({
      client,
      recentJobs,
      recentInvoices,
      counts: {
        jobs: jobCount,
        invoices: invoiceCount,
        estimates: estimateCount,
      },
    });
  } catch (error) {
    console.error("GET /api/clients/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/clients/[id] — Update client fields
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

    const existing = await prisma.client.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zip",
      "source",
      "status",
      "tags",
      "notes",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        data[field] =
          typeof body[field] === "string" ? body[field].trim() : body[field];
      }
    }

    const client = await prisma.client.update({
      where: { id, companyId },
      data,
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error("PATCH /api/clients/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/clients/[id] — Delete client (only if no linked jobs/invoices)
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

    const existing = await prisma.client.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const [jobCount, invoiceCount] = await Promise.all([
      prisma.job.count({ where: { clientId: id, companyId } }),
      prisma.invoice.count({ where: { clientId: id, companyId } }),
    ]);

    if (jobCount > 0 || invoiceCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete client with linked jobs or invoices. Remove them first.",
        },
        { status: 400 }
      );
    }

    await prisma.client.delete({ where: { id, companyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/clients/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
