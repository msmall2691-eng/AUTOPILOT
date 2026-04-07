export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    if (!session?.companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const platform = searchParams.get("platform");

    const where: Record<string, unknown> = { companyId: session.companyId };
    if (platform && platform !== "all") where.platform = platform;

    const trackers = await prisma.adTracker.findMany({
      where,
      orderBy: { date: "desc" },
      take: 100,
    });

    // Aggregate into campaigns by campaignName + platform
    const campaignMap = new Map<string, {
      id: string;
      name: string;
      platform: string;
      status: string;
      clicks: number;
      impressions: number;
      conversions: number;
      spend: number;
      revenue: number;
    }>();

    for (const t of trackers) {
      const key = `${t.platform}:${t.campaignName ?? "unknown"}`;
      if (!campaignMap.has(key)) {
        campaignMap.set(key, {
          id: t.id,
          name: t.campaignName ?? "Unknown Campaign",
          platform: t.platform,
          status: "active",
          clicks: 0,
          impressions: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
        });
      }
      const c = campaignMap.get(key)!;
      c.clicks += t.clicks;
      c.impressions += t.impressions;
      c.conversions += t.conversions;
      c.spend += t.spend;
      c.revenue += t.revenue;
    }

    const campaigns = Array.from(campaignMap.values());

    // Weekly chart data (last 7 days)
    const now = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      const dayTrackers = trackers.filter(
        (t) => t.date.toISOString().split("T")[0] === dayStr
      );
      chartData.push({
        label: dayNames[d.getDay()],
        spend: dayTrackers.reduce((sum, t) => sum + t.spend, 0),
        revenue: dayTrackers.reduce((sum, t) => sum + t.revenue, 0),
      });
    }

    return NextResponse.json({ campaigns, chartData });
  } catch (error) {
    console.error("GET /api/ad-tracking error:", error);
    return NextResponse.json({ error: "Failed to fetch ad tracking data" }, { status: 500 });
  }
}
