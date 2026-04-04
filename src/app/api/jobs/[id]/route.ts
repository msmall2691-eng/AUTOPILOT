export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/jobs/[id] — Fetch a single job with all relations
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

    const job = await prisma.job.findFirst({
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
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        service: {
          select: { id: true, name: true },
        },
        lineItems: true,
        invoice: true,
        timeEntries: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/jobs/[id] — Update job fields
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

    const existing = await prisma.job.findFirst({
      where: { id, companyId },
      include: { lineItems: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      "status",
      "title",
      "description",
      "priority",
      "scheduledDate",
      "scheduledTime",
      "assignedToId",
      "address",
      "notes",
      "internalNotes",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        if (field === "scheduledDate" && body[field]) {
          data[field] = new Date(body[field]);
        } else if (typeof body[field] === "string") {
          data[field] = body[field].trim();
        } else {
          data[field] = body[field];
        }
      }
    }

    // When status changes to "completed", recalculate totalAmount from lineItems
    // and increment client's jobCount
    const statusChangedToCompleted =
      body.status === "completed" && existing.status !== "completed";

    if (statusChangedToCompleted && existing.lineItems.length > 0) {
      const totalAmount =
        Math.round(
          existing.lineItems.reduce((sum, item) => sum + item.total, 0) * 100
        ) / 100;
      data.totalAmount = totalAmount;
    }

    const job = await prisma.job.update({
      where: { id, companyId },
      data,
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
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        service: {
          select: { id: true, name: true },
        },
        lineItems: true,
      },
    });

    // Update client jobCount when job is completed
    if (statusChangedToCompleted && existing.clientId) {
      await prisma.client.update({
        where: { id: existing.clientId },
        data: { jobCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("PATCH /api/jobs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/jobs/[id] — Delete job (cascade lineItems, timeEntries)
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

    const existing = await prisma.job.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Delete time entries first (no cascade), then the job (lineItems cascade-delete)
    await prisma.$transaction([
      prisma.timeEntry.deleteMany({ where: { jobId: id } }),
      prisma.job.delete({ where: { id, companyId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
