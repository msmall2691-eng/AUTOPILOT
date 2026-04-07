"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  MousePointerClick,
  Target,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------
type PlatformFilter = "all" | "google_ads" | "facebook_ads";

const PLATFORM_TABS: { label: string; value: PlatformFilter }[] = [
  { label: "All Platforms", value: "all" },
  { label: "Google Ads", value: "google_ads" },
  { label: "Facebook Ads", value: "facebook_ads" },
];

const PLATFORM_BADGE_COLOR: Record<string, BadgeColor> = {
  google_ads: "blue",
  facebook_ads: "purple",
};

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  clicks: number;
  impressions: number;
  conversions: number;
  spend: number;
  revenue: number;
}

interface ChartDay {
  label: string;
  spend: number;
  revenue: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function calcROI(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return Math.round(((revenue - spend) / spend) * 100);
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function platformLabel(platform: string): string {
  switch (platform) {
    case "google_ads":
      return "Google Ads";
    case "facebook_ads":
      return "Facebook Ads";
    default:
      return platform;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdTrackingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [chartData, setChartData] = useState<ChartDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (platformFilter !== "all") params.set("platform", platformFilter);

      const res = await fetch(`/api/ad-tracking?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns ?? []);
        setChartData(data.chartData ?? []);
      }
    } catch (err) {
      console.error("Error fetching ad tracking data:", err);
    } finally {
      setLoading(false);
    }
  }, [platformFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totals = campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      conversions: acc.conversions + c.conversions,
      revenue: acc.revenue + c.revenue,
    }),
    { spend: 0, conversions: 0, revenue: 0 }
  );

  const costPerLead =
    totals.conversions > 0 ? Math.round(totals.spend / totals.conversions) : 0;
  const overallROI = calcROI(totals.revenue, totals.spend);

  const chartMax = Math.max(
    ...chartData.map((d) => Math.max(d.spend, d.revenue)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ad Tracking</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor campaign performance across advertising platforms.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={DollarSign} label="Total Spend" value={formatCurrency(totals.spend)} />
        <StatsCard icon={Target} label="Conversions" value={totals.conversions} />
        <StatsCard icon={MousePointerClick} label="Cost per Lead" value={formatCurrency(costPerLead)} />
        <StatsCard icon={TrendingUp} label="ROI" value={`${overallROI}%`} />
      </div>

      {/* Platform tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {PLATFORM_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPlatformFilter(tab.value)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              platformFilter === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Spend vs Revenue chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Spend vs Revenue (Last 7 Days)</CardTitle>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" />
                      Spend
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" />
                      Revenue
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-52">
                  {chartData.map((day) => (
                    <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full items-end justify-center gap-1 h-44">
                        <div
                          className="w-2/5 rounded-t-md bg-red-400 transition-all"
                          style={{
                            height: `${(day.spend / chartMax) * 100}%`,
                            minHeight: day.spend > 0 ? "4px" : "0px",
                          }}
                          title={`Spend: ${formatCurrency(day.spend)}`}
                        />
                        <div
                          className="w-2/5 rounded-t-md bg-green-500 transition-all"
                          style={{
                            height: `${(day.revenue / chartMax) * 100}%`,
                            minHeight: day.revenue > 0 ? "4px" : "0px",
                          }}
                          title={`Revenue: ${formatCurrency(day.revenue)}`}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{day.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign table */}
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-gray-500">
                        No campaigns found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaigns.map((campaign) => {
                      const roi = calcROI(campaign.revenue, campaign.spend);
                      return (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{campaign.name}</p>
                              <Badge
                                color={campaign.status === "active" ? "green" : "gray"}
                                dot
                                className="mt-1"
                              >
                                {campaign.status === "active" ? "Active" : "Paused"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge color={PLATFORM_BADGE_COLOR[campaign.platform] ?? "gray"}>
                              {platformLabel(campaign.platform)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatNumber(campaign.clicks)}</TableCell>
                          <TableCell className="text-right">{formatNumber(campaign.impressions)}</TableCell>
                          <TableCell className="text-right font-medium">{campaign.conversions}</TableCell>
                          <TableCell className="text-right">{formatCurrency(campaign.spend)}</TableCell>
                          <TableCell className="text-right font-medium text-gray-900">{formatCurrency(campaign.revenue)}</TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                                roi >= 200
                                  ? "bg-green-50 text-green-700"
                                  : roi >= 100
                                    ? "bg-blue-50 text-blue-700"
                                    : roi >= 0
                                      ? "bg-yellow-50 text-yellow-700"
                                      : "bg-red-50 text-red-700"
                              )}
                            >
                              {roi}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
