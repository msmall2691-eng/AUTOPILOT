"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
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
  Briefcase,
  Users,
  TrendingUp,
  Download,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type DateRange = "week" | "month" | "quarter" | "year" | "custom";

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Quarter", value: "quarter" },
  { label: "This Year", value: "year" },
  { label: "Custom", value: "custom" },
];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const STATS = {
  week: { revenue: 12_480, jobs: 18, newClients: 5, avgJobValue: 693 },
  month: { revenue: 48_320, jobs: 72, newClients: 19, avgJobValue: 671 },
  quarter: { revenue: 142_750, jobs: 213, newClients: 54, avgJobValue: 670 },
  year: { revenue: 524_600, jobs: 812, newClients: 187, avgJobValue: 646 },
  custom: { revenue: 48_320, jobs: 72, newClients: 19, avgJobValue: 671 },
};

const REVENUE_BARS = {
  week: [
    { label: "Mon", value: 1_820 },
    { label: "Tue", value: 2_340 },
    { label: "Wed", value: 1_560 },
    { label: "Thu", value: 2_810 },
    { label: "Fri", value: 1_950 },
    { label: "Sat", value: 1_200 },
    { label: "Sun", value: 800 },
  ],
  month: [
    { label: "Wk 1", value: 11_200 },
    { label: "Wk 2", value: 13_400 },
    { label: "Wk 3", value: 10_800 },
    { label: "Wk 4", value: 12_920 },
    { label: "Wk 5", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 },
  ],
  quarter: [
    { label: "Jan", value: 42_300 },
    { label: "Feb", value: 48_600 },
    { label: "Mar", value: 51_850 },
    { label: "", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 },
  ],
  year: [
    { label: "Q1", value: 142_750 },
    { label: "Q2", value: 128_400 },
    { label: "Q3", value: 136_200 },
    { label: "Q4", value: 117_250 },
    { label: "", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 },
  ],
  custom: [
    { label: "Wk 1", value: 11_200 },
    { label: "Wk 2", value: 13_400 },
    { label: "Wk 3", value: 10_800 },
    { label: "Wk 4", value: 12_920 },
    { label: "Wk 5", value: 0 },
    { label: "", value: 0 },
    { label: "", value: 0 },
  ],
};

const JOB_STATUSES = [
  { label: "Completed", count: 42, color: "bg-green-500" },
  { label: "In Progress", count: 15, color: "bg-blue-500" },
  { label: "Scheduled", count: 9, color: "bg-indigo-500" },
  { label: "Pending", count: 4, color: "bg-yellow-500" },
  { label: "Cancelled", count: 2, color: "bg-red-500" },
];

const TOP_SERVICES = [
  { name: "HVAC Repair", jobs: 28, revenue: 18_200, avgPrice: 650 },
  { name: "Plumbing", jobs: 19, revenue: 11_400, avgPrice: 600 },
  { name: "Electrical", jobs: 14, revenue: 9_800, avgPrice: 700 },
  { name: "Landscaping", jobs: 7, revenue: 4_550, avgPrice: 650 },
  { name: "Painting", jobs: 4, revenue: 4_370, avgPrice: 1_093 },
];

const TOP_CLIENTS = [
  { name: "Greenfield Properties", jobs: 12, totalSpent: 14_800 },
  { name: "Sunrise Apartments", jobs: 9, totalSpent: 11_200 },
  { name: "Coastal Living HOA", jobs: 8, totalSpent: 8_750 },
  { name: "Metro Office Park", jobs: 6, totalSpent: 7_400 },
  { name: "The Parkview Group", jobs: 5, totalSpent: 6_170 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("month");

  const stats = STATS[dateRange];
  const bars = REVENUE_BARS[dateRange].filter((b) => b.label);
  const maxBar = Math.max(...bars.map((b) => b.value), 1);
  const maxStatus = Math.max(...JOB_STATUSES.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <Button variant="outline" onClick={() => alert("Export functionality coming soon.")}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Date range selector */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {DATE_RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setDateRange(r.value)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              dateRange === r.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={DollarSign}
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          change={12.5}
        />
        <StatsCard
          icon={Briefcase}
          label="Jobs Completed"
          value={stats.jobs}
          change={8.2}
        />
        <StatsCard
          icon={Users}
          label="New Clients"
          value={stats.newClients}
          change={15.3}
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg Job Value"
          value={formatCurrency(stats.avgJobValue)}
          change={-2.1}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {bars.map((bar) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-gray-500">
                    {formatCurrency(bar.value)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-blue-500 transition-all"
                    style={{
                      height: `${(bar.value / maxBar) * 100}%`,
                      minHeight: bar.value > 0 ? "4px" : "0px",
                    }}
                  />
                  <span className="text-xs text-gray-500">{bar.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Jobs by status */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {JOB_STATUSES.map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{s.label}</span>
                    <span className="text-gray-500">{s.count}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100">
                    <div
                      className={cn("h-2.5 rounded-full transition-all", s.color)}
                      style={{ width: `${(s.count / maxStatus) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Jobs</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TOP_SERVICES.map((svc) => (
                  <TableRow key={svc.name}>
                    <TableCell className="font-medium text-gray-900">
                      {svc.name}
                    </TableCell>
                    <TableCell className="text-right">{svc.jobs}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(svc.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(svc.avgPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Jobs</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TOP_CLIENTS.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium text-gray-900">
                      {c.name}
                    </TableCell>
                    <TableCell className="text-right">{c.jobs}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(c.totalSpent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
