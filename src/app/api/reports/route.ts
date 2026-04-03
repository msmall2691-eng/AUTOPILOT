export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/reports — Reporting metrics with date range support
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
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

    const { searchParams } = request.nextUrl;
    const range = searchParams.get("range") || "month";

    // Calculate date ranges
    const now = new Date();
    const { periodStart, previousStart, previousEnd, groupBy } =
      getDateRange(now, range);

    // --- Current period stats ---
    const [
      currentRevenueAgg,
      currentJobCount,
      currentNewClients,
      previousRevenueAgg,
      previousJobCount,
      previousNewClients,
      jobsByStatusRaw,
      allCompletedJobsInRange,
      topServicesRaw,
      topClientsRaw,
    ] = await Promise.all([
      // Current period revenue - sum of completed job amounts
      prisma.job.aggregate({
        where: {
          companyId,
          status: "completed",
          scheduledDate: { gte: periodStart, lte: now },
        },
        _sum: { totalAmount: true },
      }),
      // Current period completed jobs count
      prisma.job.count({
        where: {
          companyId,
          status: "completed",
          scheduledDate: { gte: periodStart, lte: now },
        },
      }),
      // New clients in current period
      prisma.client.count({
        where: {
          companyId,
          createdAt: { gte: periodStart, lte: now },
        },
      }),
      // Previous period revenue
      prisma.job.aggregate({
        where: {
          companyId,
          status: "completed",
          scheduledDate: { gte: previousStart, lt: previousEnd },
        },
        _sum: { totalAmount: true },
      }),
      // Previous period completed jobs count
      prisma.job.count({
        where: {
          companyId,
          status: "completed",
          scheduledDate: { gte: previousStart, lt: previousEnd },
        },
      }),
      // Previous period new clients
      prisma.client.count({
        where: {
          companyId,
          createdAt: { gte: previousStart, lt: previousEnd },
        },
      }),
      // Jobs by status (all time for the company)
      prisma.job.groupBy({
        by: ["status"],
        where: { companyId },
        _count: { id: true },
      }),
      // Completed jobs in range for revenue-by-period breakdown
      prisma.job.findMany({
        where: {
          companyId,
          status: "completed",
          scheduledDate: { gte: periodStart, lte: now },
        },
        select: { scheduledDate: true, totalAmount: true },
        orderBy: { scheduledDate: "asc" },
      }),
      // Top services by revenue (current period)
      prisma.job.groupBy({
        by: ["serviceId"],
        where: {
          companyId,
          status: "completed",
          scheduledDate: { gte: periodStart, lte: now },
          serviceId: { not: null },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: "desc" } },
        take: 5,
      }),
      // Top clients by total spent (current period)
      prisma.job.groupBy({
        by: ["clientId"],
        where: {
          companyId,
          status: "completed",
          scheduledDate: { gte: periodStart, lte: now },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: "desc" } },
        take: 5,
      }),
    ]);

    const revenue = currentRevenueAgg._sum.totalAmount ?? 0;
    const previousRevenue = previousRevenueAgg._sum.totalAmount ?? 0;
    const avgJobValue = currentJobCount > 0 ? revenue / currentJobCount : 0;
    const previousAvgJobValue =
      previousJobCount > 0
        ? (previousRevenue) / previousJobCount
        : 0;

    const stats = {
      revenue: Math.round(revenue * 100) / 100,
      jobs: currentJobCount,
      newClients: currentNewClients,
      avgJobValue: Math.round(avgJobValue * 100) / 100,
    };

    const previousStats = {
      revenue: Math.round(previousRevenue * 100) / 100,
      jobs: previousJobCount,
      newClients: previousNewClients,
      avgJobValue: Math.round(previousAvgJobValue * 100) / 100,
    };

    // --- Revenue by period ---
    const revenueByPeriod = buildRevenueByPeriod(
      allCompletedJobsInRange,
      periodStart,
      now,
      groupBy
    );

    // --- Jobs by status ---
    const statusColors: Record<string, string> = {
      scheduled: "#3b82f6",
      in_progress: "#f59e0b",
      completed: "#10b981",
      cancelled: "#ef4444",
    };

    const jobsByStatus = jobsByStatusRaw.map((row) => ({
      label: row.status,
      count: row._count.id,
      color: statusColors[row.status] || "#6b7280",
    }));

    // --- Top services (resolve names) ---
    const serviceIds = topServicesRaw
      .map((r) => r.serviceId)
      .filter((id): id is string => id !== null);

    const services =
      serviceIds.length > 0
        ? await prisma.service.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true, name: true },
          })
        : [];

    const serviceMap = new Map(services.map((s) => [s.id, s.name]));

    const topServices = topServicesRaw.map((row) => {
      const totalRev = row._sum.totalAmount ?? 0;
      const jobCount = row._count.id;
      return {
        name: serviceMap.get(row.serviceId!) || "Unknown",
        jobs: jobCount,
        revenue: Math.round(totalRev * 100) / 100,
        avgPrice: Math.round((jobCount > 0 ? totalRev / jobCount : 0) * 100) / 100,
      };
    });

    // --- Top clients (resolve names) ---
    const clientIds = topClientsRaw.map((r) => r.clientId);

    const clients =
      clientIds.length > 0
        ? await prisma.client.findMany({
            where: { id: { in: clientIds } },
            select: { id: true, firstName: true, lastName: true },
          })
        : [];

    const clientMap = new Map(
      clients.map((c) => [c.id, `${c.firstName} ${c.lastName}`])
    );

    const topClients = topClientsRaw.map((row) => ({
      name: clientMap.get(row.clientId) || "Unknown",
      jobs: row._count.id,
      totalSpent: Math.round((row._sum.totalAmount ?? 0) * 100) / 100,
    }));

    return NextResponse.json({
      stats,
      previousStats,
      revenueByPeriod,
      jobsByStatus,
      topServices,
      topClients,
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateRange(
  now: Date,
  range: string
): {
  periodStart: Date;
  previousStart: Date;
  previousEnd: Date;
  groupBy: "day" | "week" | "month";
} {
  const ms = now.getTime();

  switch (range) {
    case "week": {
      const periodStart = new Date(ms - 7 * 86400000);
      const previousEnd = new Date(periodStart);
      const previousStart = new Date(ms - 14 * 86400000);
      return { periodStart, previousStart, previousEnd, groupBy: "day" };
    }
    case "quarter": {
      const periodStart = new Date(ms - 90 * 86400000);
      const previousEnd = new Date(periodStart);
      const previousStart = new Date(ms - 180 * 86400000);
      return { periodStart, previousStart, previousEnd, groupBy: "week" };
    }
    case "year": {
      const periodStart = new Date(ms - 365 * 86400000);
      const previousEnd = new Date(periodStart);
      const previousStart = new Date(ms - 730 * 86400000);
      return { periodStart, previousStart, previousEnd, groupBy: "month" };
    }
    case "month":
    default: {
      const periodStart = new Date(ms - 30 * 86400000);
      const previousEnd = new Date(periodStart);
      const previousStart = new Date(ms - 60 * 86400000);
      return { periodStart, previousStart, previousEnd, groupBy: "day" };
    }
  }
}

function buildRevenueByPeriod(
  jobs: { scheduledDate: Date; totalAmount: number }[],
  periodStart: Date,
  periodEnd: Date,
  groupBy: "day" | "week" | "month"
): { label: string; value: number }[] {
  const buckets = new Map<string, number>();

  // Pre-fill buckets so we get zero-value entries
  const cursor = new Date(periodStart);
  while (cursor <= periodEnd) {
    const key = bucketKey(cursor, groupBy);
    buckets.set(key, 0);
    advanceCursor(cursor, groupBy);
  }

  // Sum revenue into buckets
  for (const job of jobs) {
    const key = bucketKey(job.scheduledDate, groupBy);
    buckets.set(key, (buckets.get(key) ?? 0) + job.totalAmount);
  }

  return Array.from(buckets.entries()).map(([label, value]) => ({
    label,
    value: Math.round(value * 100) / 100,
  }));
}

function bucketKey(date: Date, groupBy: "day" | "week" | "month"): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  switch (groupBy) {
    case "day":
      return `${y}-${m}-${d}`;
    case "week": {
      // Use the Monday of the ISO week
      const day = date.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      const monday = new Date(date);
      monday.setDate(monday.getDate() + diff);
      const wm = String(monday.getMonth() + 1).padStart(2, "0");
      const wd = String(monday.getDate()).padStart(2, "0");
      return `${monday.getFullYear()}-${wm}-${wd}`;
    }
    case "month":
      return `${y}-${m}`;
  }
}

function advanceCursor(cursor: Date, groupBy: "day" | "week" | "month"): void {
  switch (groupBy) {
    case "day":
      cursor.setDate(cursor.getDate() + 1);
      break;
    case "week":
      cursor.setDate(cursor.getDate() + 7);
      break;
    case "month":
      cursor.setMonth(cursor.getMonth() + 1);
      break;
  }
}
