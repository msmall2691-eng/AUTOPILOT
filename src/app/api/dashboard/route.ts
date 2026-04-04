export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma, schemaReady } from "@/lib/db";

export async function GET() {
  try {
    await schemaReady;
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session?.companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const companyId = session.companyId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

    // Run all aggregations in parallel
    const [
      currentRevenue,
      previousRevenue,
      activeJobs,
      previousActiveJobs,
      newClients,
      previousNewClients,
      pendingInvoices,
      previousPendingInvoices,
      upcomingJobsRaw,
      totalClients,
      totalJobs,
      completedJobs,
      totalEstimates,
      acceptedEstimates,
      recentJobs,
      recentClients,
      recentInvoices,
      recentPaidInvoices,
    ] = await Promise.all([
      // Current period revenue (last 30 days)
      prisma.invoice.aggregate({
        where: { companyId, status: "paid", paidAt: { gte: thirtyDaysAgo } },
        _sum: { totalAmount: true },
      }),
      // Previous period revenue (30-60 days ago)
      prisma.invoice.aggregate({
        where: { companyId, status: "paid", paidAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { totalAmount: true },
      }),
      // Active jobs
      prisma.job.count({
        where: { companyId, status: { in: ["scheduled", "in_progress"] } },
      }),
      prisma.job.count({
        where: { companyId, status: { in: ["scheduled", "in_progress"] }, createdAt: { lt: thirtyDaysAgo } },
      }),
      // New clients
      prisma.client.count({
        where: { companyId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.client.count({
        where: { companyId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      // Pending invoices
      prisma.invoice.count({
        where: { companyId, status: { in: ["sent", "overdue"] } },
      }),
      prisma.invoice.count({
        where: { companyId, status: { in: ["sent", "overdue"] }, createdAt: { lt: thirtyDaysAgo } },
      }),
      // Upcoming jobs
      prisma.job.findMany({
        where: { companyId, status: { in: ["scheduled", "in_progress"] }, scheduledDate: { gte: now } },
        include: {
          client: { select: { firstName: true, lastName: true } },
          service: { select: { name: true } },
          assignedTo: { select: { firstName: true, lastName: true } },
        },
        orderBy: { scheduledDate: "asc" },
        take: 5,
      }),
      // Conversion metrics
      prisma.client.count({ where: { companyId } }),
      prisma.job.count({ where: { companyId } }),
      prisma.job.count({ where: { companyId, status: "completed" } }),
      prisma.estimate.count({ where: { companyId } }),
      prisma.estimate.count({ where: { companyId, status: "accepted" } }),
      // Recent activity sources
      prisma.job.findMany({
        where: { companyId },
        include: { client: { select: { firstName: true, lastName: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.client.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.invoice.findMany({
        where: { companyId },
        include: { client: { select: { firstName: true, lastName: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      // Revenue by day (last 7 days) for chart
      prisma.invoice.findMany({
        where: {
          companyId,
          status: "paid",
          paidAt: { gte: new Date(now.getTime() - 7 * 86400000) },
        },
        select: { totalAmount: true, paidAt: true },
      }),
    ]);

    function calcChange(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 1000) / 10;
    }

    const currentRevenueVal = currentRevenue._sum.totalAmount ?? 0;
    const previousRevenueVal = previousRevenue._sum.totalAmount ?? 0;

    // Build daily revenue chart data
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const revenueByDay: { label: string; value: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateKey = d.toISOString().split("T")[0];
      revenueByDay.push({ label: dayNames[d.getDay()], value: 0, date: dateKey });
    }
    for (const inv of recentPaidInvoices) {
      if (inv.paidAt) {
        const dateKey = inv.paidAt.toISOString().split("T")[0];
        const entry = revenueByDay.find((d) => d.date === dateKey);
        if (entry) entry.value += inv.totalAmount;
      }
    }

    // Build upcoming jobs
    const upcomingJobs = upcomingJobsRaw.map((job) => ({
      id: job.id,
      title: job.title,
      scheduledDate: job.scheduledDate.toISOString(),
      scheduledTime: job.scheduledTime,
      status: job.status,
      clientName: `${job.client.firstName} ${job.client.lastName}`,
      serviceName: job.service?.name ?? null,
      assignedTo: job.assignedTo ? `${job.assignedTo.firstName} ${job.assignedTo.lastName}` : null,
    }));

    // Build recent activity
    const recentActivity: { id: string; type: string; description: string; timestamp: string }[] = [];

    for (const job of recentJobs) {
      const clientName = `${job.client.firstName} ${job.client.lastName}`;
      if (job.status === "completed") {
        recentActivity.push({
          id: `job-done-${job.id}`,
          type: "job_completed",
          description: `Job "${job.title}" marked as completed`,
          timestamp: job.updatedAt.toISOString(),
        });
      } else {
        recentActivity.push({
          id: `job-new-${job.id}`,
          type: "job_created",
          description: `New job "${job.title}" created for ${clientName}`,
          timestamp: job.createdAt.toISOString(),
        });
      }
    }

    for (const client of recentClients) {
      recentActivity.push({
        id: `client-${client.id}`,
        type: "client_added",
        description: `New client ${client.firstName} ${client.lastName} added`,
        timestamp: client.createdAt.toISOString(),
      });
    }

    for (const inv of recentInvoices) {
      const clientName = `${inv.client.firstName} ${inv.client.lastName}`;
      if (inv.status === "paid") {
        recentActivity.push({
          id: `pay-${inv.id}`,
          type: "payment_received",
          description: `Payment of $${inv.totalAmount.toFixed(2)} received from ${clientName}`,
          timestamp: inv.updatedAt.toISOString(),
        });
      } else if (inv.status !== "draft") {
        recentActivity.push({
          id: `inv-${inv.id}`,
          type: "invoice_sent",
          description: `Invoice #${inv.invoiceNumber} sent to ${clientName}`,
          timestamp: inv.createdAt.toISOString(),
        });
      }
    }

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    recentActivity.splice(10);

    return NextResponse.json({
      stats: {
        totalRevenue: currentRevenueVal,
        revenueChange: calcChange(currentRevenueVal, previousRevenueVal),
        activeJobs,
        activeJobsChange: calcChange(activeJobs, previousActiveJobs),
        newClients,
        newClientsChange: calcChange(newClients, previousNewClients),
        pendingInvoices,
        pendingInvoicesChange: calcChange(pendingInvoices, previousPendingInvoices),
      },
      conversions: {
        totalClients,
        totalJobs,
        completedJobs,
        jobCompletionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
        totalEstimates,
        acceptedEstimates,
        estimateConversionRate: totalEstimates > 0 ? Math.round((acceptedEstimates / totalEstimates) * 100) : 0,
      },
      revenueChart: revenueByDay,
      upcomingJobs,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
