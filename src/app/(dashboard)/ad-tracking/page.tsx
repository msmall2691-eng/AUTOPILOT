"use client";

import { useState } from "react";
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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type PlatformFilter = "all" | "google" | "facebook";

const PLATFORM_TABS: { label: string; value: PlatformFilter }[] = [
  { label: "All Platforms", value: "all" },
  { label: "Google Ads", value: "google" },
  { label: "Facebook Ads", value: "facebook" },
];

const PLATFORM_BADGE_COLOR: Record<string, BadgeColor> = {
  google: "blue",
  facebook: "purple",
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface Campaign {
  id: string;
  name: string;
  platform: "google" | "facebook";
  status: "active" | "paused";
  clicks: number;
  impressions: number;
  conversions: number;
  spend: number;
  revenue: number;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "HVAC Emergency Repair - Local",
    platform: "google",
    status: "active",
    clicks: 1_245,
    impressions: 28_400,
    conversions: 47,
    spend: 2_340,
    revenue: 14_100,
  },
  {
    id: "2",
    name: "Spring AC Tune-Up Promo",
    platform: "facebook",
    status: "active",
    clicks: 892,
    impressions: 42_100,
    conversions: 31,
    spend: 1_560,
    revenue: 8_680,
  },
  {
    id: "3",
    name: "Plumbing Services - Search",
    platform: "google",
    status: "active",
    clicks: 734,
    impressions: 18_600,
    conversions: 28,
    spend: 1_870,
    revenue: 9_800,
  },
  {
    id: "4",
    name: "Home Renovation Awareness",
    platform: "facebook",
    status: "paused",
    clicks: 2_150,
    impressions: 85_200,
    conversions: 19,
    spend: 3_200,
    revenue: 7_600,
  },
  {
    id: "5",
    name: "Electrical Safety Inspection",
    platform: "google",
    status: "active",
    clicks: 412,
    impressions: 9_800,
    conversions: 16,
    spend: 980,
    revenue: 5_600,
  },
  {
    id: "6",
    name: "Landscaping Seasonal Offer",
    platform: "facebook",
    status: "active",
    clicks: 1_080,
    impressions: 36_500,
    conversions: 22,
    spend: 1_450,
    revenue: 6_380,
  },
];

const SPEND_REVENUE_CHART = [
  { label: "Mon", spend: 420, revenue: 1_800 },
  { label: "Tue", spend: 380, revenue: 2_100 },
  { label: "Wed", spend: 510, revenue: 1_650 },
  { label: "Thu", spend: 460, revenue: 2_400 },
  { label: "Fri", spend: 390, revenue: 1_950 },
  { label: "Sat", spend: 280, revenue: 1_200 },
  { label: "Sun", spend: 220, revenue: 860 },
];

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdTrackingPage() {
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");

  const filtered =
    platformFilter === "all"
      ? CAMPAIGNS
      : CAMPAIGNS.filter((c) => c.platform === platformFilter);

  const totals = filtered.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      conversions: acc.conversions + c.conversions,
      revenue: acc.revenue + c.revenue,
    }),
    { spend: 0, conversions: 0, revenue: 0 }
  );

  const costPerLead =
    totals.conversions > 0
      ? Math.round(totals.spend / totals.conversions)
      : 0;
  const overallROI = calcROI(totals.revenue, totals.spend);

  const chartMax = Math.max(
    ...SPEND_REVENUE_CHART.map((d) => Math.max(d.spend, d.revenue)),
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
        <StatsCard
          icon={DollarSign}
          label="Total Spend"
          value={formatCurrency(totals.spend)}
          change={-5.2}
          changeLabel="vs last week"
        />
        <StatsCard
          icon={Target}
          label="Conversions"
          value={totals.conversions}
          change={12.8}
          changeLabel="vs last week"
        />
        <StatsCard
          icon={MousePointerClick}
          label="Cost per Lead"
          value={formatCurrency(costPerLead)}
          change={-8.3}
          changeLabel="vs last week"
        />
        <StatsCard
          icon={TrendingUp}
          label="ROI"
          value={`${overallROI}%`}
          change={15.4}
          changeLabel="vs last week"
        />
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

      {/* Spend vs Revenue chart */}
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
            {SPEND_REVENUE_CHART.map((day) => (
              <div
                key={day.label}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div className="flex w-full items-end justify-center gap-1 h-44">
                  {/* Spend bar */}
                  <div
                    className="w-2/5 rounded-t-md bg-red-400 transition-all"
                    style={{
                      height: `${(day.spend / chartMax) * 100}%`,
                      minHeight: day.spend > 0 ? "4px" : "0px",
                    }}
                    title={`Spend: ${formatCurrency(day.spend)}`}
                  />
                  {/* Revenue bar */}
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
              {filtered.map((campaign) => {
                const roi = calcROI(campaign.revenue, campaign.spend);
                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {campaign.name}
                        </p>
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
                      <Badge color={PLATFORM_BADGE_COLOR[campaign.platform]}>
                        {campaign.platform === "google"
                          ? "Google Ads"
                          : "Facebook Ads"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(campaign.clicks)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(campaign.impressions)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {campaign.conversions}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(campaign.spend)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
                      {formatCurrency(campaign.revenue)}
                    </TableCell>
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <p className="text-sm font-medium text-gray-900">
            No campaigns found
          </p>
          <p className="mt-1 text-sm text-gray-500">
            No campaigns match the selected platform filter.
          </p>
        </div>
      )}
    </div>
  );
}
