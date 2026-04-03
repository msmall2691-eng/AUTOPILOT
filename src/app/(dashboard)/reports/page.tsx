"use client";

import { useState, useEffect, useCallback } from "react";
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
// Types for API response
// ---------------------------------------------------------------------------

interface StatsData {
  revenue: number;
  jobs: number;
  newClients: number;
  avgJobValue: number;
}

interface RevenueBar {
  label: string;
  value: number;
}

interface JobStatus {
  label: string;
  count: number;
  color: string;
}

interface ServiceData {
  name: string;
  jobs: number;
  revenue: number;
  avgPrice: number;
}

interface ClientData {
  name: string;
  jobs: number;
  totalSpent: number;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  completed: "bg-green-500",
  in_progress: "bg-blue-500",
  scheduled: "bg-indigo-500",
  cancelled: "bg-red-500",
};

const DEFAULT_STATS: StatsData = { revenue: 0, jobs: 0, newClients: 0, avgJobValue: 0 };

function calcChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS);
  const [previousStats, setPreviousStats] = useState<StatsData>(DEFAULT_STATS);
  const [revenueByPeriod, setRevenueByPeriod] = useState<RevenueBar[]>([]);
  const [jobStatuses, setJobStatuses] = useState<JobStatus[]>([]);
  const [topServices, setTopServices] = useState<ServiceData[]>([]);
  const [topClients, setTopClients] = useState<ClientData[]>([]);

  const fetchReports = useCallback(async (range: DateRange) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?range=${range}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();

      setStats(data.stats ?? DEFAULT_STATS);
      setPreviousStats(data.previousStats ?? DEFAULT_STATS);
      setRevenueByPeriod(data.revenueByPeriod ?? []);
      setJobStatuses(
        (data.jobsByStatus ?? []).map((s: { label: string; count: number; color?: string }) => ({
          ...s,
          color: STATUS_COLOR_MAP[s.color ?? ""] ?? s.color ?? "bg-gray-400",
        }))
      );
      setTopServices(data.topServices ?? []);
      setTopClients(data.topClients ?? []);
    } catch {
      // On error, reset to empty/zero state
      setStats(DEFAULT_STATS);
      setPreviousStats(DEFAULT_STATS);
      setRevenueByPeriod([]);
      setJobStatuses([]);
      setTopServices([]);
      setTopClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(dateRange);
  }, [dateRange, fetchReports]);

  const bars = revenueByPeriod.filter((b) => b.label);
  const maxBar = Math.max(...bars.map((b) => b.value), 1);
  const maxStatus = Math.max(...jobStatuses.map((s) => s.count), 1);

  const revenueChange = calcChange(stats.revenue, previousStats.revenue);
  const jobsChange = calcChange(stats.jobs, previousStats.jobs);
  const newClientsChange = calcChange(stats.newClients, previousStats.newClients);
  const avgJobValueChange = calcChange(stats.avgJobValue, previousStats.avgJobValue);

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

      {/* Loading overlay */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        </div>
      )}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={DollarSign}
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          change={revenueChange}
        />
        <StatsCard
          icon={Briefcase}
          label="Jobs Completed"
          value={stats.jobs}
          change={jobsChange}
        />
        <StatsCard
          icon={Users}
          label="New Clients"
          value={stats.newClients}
          change={newClientsChange}
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg Job Value"
          value={formatCurrency(stats.avgJobValue)}
          change={avgJobValueChange}
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
              {jobStatuses.map((s) => (
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
                {topServices.map((svc) => (
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
                {topClients.map((c) => (
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
