export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface UpcomingJob {
  id: string;
  title: string;
  scheduledDate: string;
  status: string;
  clientName: string;
  serviceName: string | null;
}

interface ActivityItem {
  id: string;
  type: "job_created" | "job_completed" | "invoice_sent" | "client_added" | "payment_received";
  description: string;
  timestamp: string;
}

interface DashboardData {
  stats: {
    totalRevenue: number;
    revenueChange: number;
    activeJobs: number;
    activeJobsChange: number;
    newClients: number;
    newClientsChange: number;
    pendingInvoices: number;
    pendingInvoicesChange: number;
  };
  upcomingJobs: UpcomingJob[];
  recentActivity: ActivityItem[];
}

function getMockData(): DashboardData {
  const today = new Date();

  return {
    stats: {
      totalRevenue: 48250.0,
      revenueChange: 12.5,
      activeJobs: 24,
      activeJobsChange: 8.3,
      newClients: 18,
      newClientsChange: 14.2,
      pendingInvoices: 7,
      pendingInvoicesChange: -3.1,
    },
    upcomingJobs: [
      {
        id: "job-1",
        title: "Lawn Maintenance",
        scheduledDate: new Date(today.getTime() + 1 * 86400000).toISOString(),
        status: "scheduled",
        clientName: "Sarah Johnson",
        serviceName: "Lawn Care",
      },
      {
        id: "job-2",
        title: "HVAC Repair",
        scheduledDate: new Date(today.getTime() + 1 * 86400000).toISOString(),
        status: "scheduled",
        clientName: "Mike Davis",
        serviceName: "HVAC Service",
      },
      {
        id: "job-3",
        title: "Kitchen Remodel - Phase 2",
        scheduledDate: new Date(today.getTime() + 2 * 86400000).toISOString(),
        status: "in_progress",
        clientName: "Emily Chen",
        serviceName: "Remodeling",
      },
      {
        id: "job-4",
        title: "Roof Inspection",
        scheduledDate: new Date(today.getTime() + 3 * 86400000).toISOString(),
        status: "scheduled",
        clientName: "James Wilson",
        serviceName: "Inspection",
      },
      {
        id: "job-5",
        title: "Plumbing Installation",
        scheduledDate: new Date(today.getTime() + 4 * 86400000).toISOString(),
        status: "scheduled",
        clientName: "Lisa Anderson",
        serviceName: "Plumbing",
      },
    ],
    recentActivity: [
      {
        id: "act-1",
        type: "payment_received",
        description: "Payment of $1,250.00 received from Sarah Johnson",
        timestamp: new Date(today.getTime() - 1 * 3600000).toISOString(),
      },
      {
        id: "act-2",
        type: "job_completed",
        description: 'Job "Deck Staining" marked as completed',
        timestamp: new Date(today.getTime() - 3 * 3600000).toISOString(),
      },
      {
        id: "act-3",
        type: "invoice_sent",
        description: "Invoice #INV-1042 sent to Mike Davis",
        timestamp: new Date(today.getTime() - 5 * 3600000).toISOString(),
      },
      {
        id: "act-4",
        type: "client_added",
        description: "New client Emily Chen added",
        timestamp: new Date(today.getTime() - 8 * 3600000).toISOString(),
      },
      {
        id: "act-5",
        type: "job_created",
        description: 'New job "Roof Inspection" created for James Wilson',
        timestamp: new Date(today.getTime() - 12 * 3600000).toISOString(),
      },
      {
        id: "act-6",
        type: "payment_received",
        description: "Payment of $3,400.00 received from Robert Martinez",
        timestamp: new Date(today.getTime() - 24 * 3600000).toISOString(),
      },
      {
        id: "act-7",
        type: "job_completed",
        description: 'Job "Bathroom Renovation" marked as completed',
        timestamp: new Date(today.getTime() - 26 * 3600000).toISOString(),
      },
      {
        id: "act-8",
        type: "invoice_sent",
        description: "Invoice #INV-1041 sent to Lisa Anderson",
        timestamp: new Date(today.getTime() - 30 * 3600000).toISOString(),
      },
      {
        id: "act-9",
        type: "client_added",
        description: "New client David Kim added",
        timestamp: new Date(today.getTime() - 48 * 3600000).toISOString(),
      },
      {
        id: "act-10",
        type: "job_created",
        description: 'New job "Plumbing Installation" created for Lisa Anderson',
        timestamp: new Date(today.getTime() - 50 * 3600000).toISOString(),
      },
    ],
  };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    // Return mock data if no session (demo mode)
    if (!session) {
      return NextResponse.json(getMockData());
    }

    if (!session.companyId) {
      return NextResponse.json(getMockData());
    }
    const companyId = session.companyId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

    // Run aggregations in parallel
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
    ] = await Promise.all([
      // Current period revenue (last 30 days) - sum of paid invoices
      prisma.invoice.aggregate({
        where: {
          companyId,
          status: "paid",
          paidAt: { gte: thirtyDaysAgo },
        },
        _sum: { totalAmount: true },
      }),
      // Previous period revenue (30-60 days ago)
      prisma.invoice.aggregate({
        where: {
          companyId,
          status: "paid",
          paidAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _sum: { totalAmount: true },
      }),
      // Active jobs (scheduled or in_progress)
      prisma.job.count({
        where: {
          companyId,
          status: { in: ["scheduled", "in_progress"] },
        },
      }),
      // Previous period active jobs count (snapshot approximation)
      prisma.job.count({
        where: {
          companyId,
          status: { in: ["scheduled", "in_progress"] },
          createdAt: { lt: thirtyDaysAgo },
        },
      }),
      // New clients this period
      prisma.client.count({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // New clients previous period
      prisma.client.count({
        where: {
          companyId,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      // Pending invoices (sent but not paid)
      prisma.invoice.count({
        where: {
          companyId,
          status: { in: ["sent", "overdue"] },
        },
      }),
      // Previous period pending invoices
      prisma.invoice.count({
        where: {
          companyId,
          status: { in: ["sent", "overdue"] },
          createdAt: { lt: thirtyDaysAgo },
        },
      }),
      // Upcoming jobs
      prisma.job.findMany({
        where: {
          companyId,
          status: { in: ["scheduled", "in_progress"] },
          scheduledDate: { gte: now },
        },
        include: {
          client: { select: { firstName: true, lastName: true } },
          service: { select: { name: true } },
        },
        orderBy: { scheduledDate: "asc" },
        take: 5,
      }),
    ]);

    function calcChange(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 1000) / 10;
    }

    const currentRevenueVal = currentRevenue._sum.totalAmount ?? 0;
    const previousRevenueVal = previousRevenue._sum.totalAmount ?? 0;

    const upcomingJobs: UpcomingJob[] = upcomingJobsRaw.map((job) => ({
      id: job.id,
      title: job.title,
      scheduledDate: job.scheduledDate.toISOString(),
      status: job.status,
      clientName: `${job.client.firstName} ${job.client.lastName}`,
      serviceName: job.service?.name ?? null,
    }));

    // Build recent activity from various sources
    const [recentJobs, recentClients, recentInvoices] = await Promise.all([
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
    ]);

    const recentActivity: ActivityItem[] = [];

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
      } else {
        recentActivity.push({
          id: `inv-${inv.id}`,
          type: "invoice_sent",
          description: `Invoice #${inv.invoiceNumber} sent to ${clientName}`,
          timestamp: inv.createdAt.toISOString(),
        });
      }
    }

    // Sort by timestamp descending and take 10
    recentActivity.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    recentActivity.splice(10);

    const data: DashboardData = {
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
      upcomingJobs,
      recentActivity,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard API error:", error);
    // Fallback to mock data on error
    return NextResponse.json(getMockData());
  }
}
