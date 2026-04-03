"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Briefcase,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  UserPlus,
  CreditCard,
  Send,
  PlusCircle,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

// ---- Types ----

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeJobs: number;
  activeJobsChange: number;
  newClients: number;
  newClientsChange: number;
  pendingInvoices: number;
  pendingInvoicesChange: number;
}

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
  stats: DashboardStats;
  upcomingJobs: UpcomingJob[];
  recentActivity: ActivityItem[];
}

// ---- Helpers ----

const STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  scheduled: "blue",
  in_progress: "yellow",
  completed: "green",
  cancelled: "red",
  pending: "gray",
};

const ACTIVITY_ICONS: Record<string, typeof DollarSign> = {
  job_created: PlusCircle,
  job_completed: CheckCircle2,
  invoice_sent: Send,
  client_added: UserPlus,
  payment_received: CreditCard,
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

// ---- Skeleton components ----

function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>
      <div className="mt-4 h-8 w-28 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-32 rounded bg-gray-200" />
    </div>
  );
}

function JobRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-3 w-28 rounded bg-gray-200" />
      </div>
      <div className="h-5 w-16 rounded-full bg-gray-200" />
    </div>
  );
}

function ActivityRowSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-3 w-16 rounded bg-gray-200" />
      </div>
    </div>
  );
}

// ---- Revenue chart (simple bar chart) ----

const SAMPLE_REVENUE = [
  { label: "Mon", value: 3200 },
  { label: "Tue", value: 4100 },
  { label: "Wed", value: 2800 },
  { label: "Thu", value: 5300 },
  { label: "Fri", value: 4700 },
  { label: "Sat", value: 2100 },
  { label: "Sun", value: 1400 },
];

function RevenueChart() {
  const max = Math.max(...SAMPLE_REVENUE.map((d) => d.value));

  return (
    <div className="flex items-end gap-3 h-48 pt-4">
      {SAMPLE_REVENUE.map((day) => {
        const pct = (day.value / max) * 100;
        return (
          <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-gray-500">
              {formatCurrency(day.value)}
            </span>
            <div
              className="w-full rounded-t-md bg-blue-500 transition-all duration-500 min-h-[4px]"
              style={{ height: `${pct}%` }}
            />
            <span className="text-xs text-gray-500">{day.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function RevenueChartSkeleton() {
  return (
    <div className="flex items-end gap-3 h-48 pt-4 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className="h-3 w-10 rounded bg-gray-200" />
          <div
            className="w-full rounded-t-md bg-gray-200"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
          <div className="h-3 w-6 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

// ---- Main page component ----

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const json: DashboardData = await res.json();
        setData(json);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here&#39;s an overview of your business.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !data ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              icon={DollarSign}
              label="Total Revenue"
              value={formatCurrency(data.stats.totalRevenue)}
              change={data.stats.revenueChange}
              changeLabel="vs last 30 days"
            />
            <StatsCard
              icon={Briefcase}
              label="Active Jobs"
              value={data.stats.activeJobs}
              change={data.stats.activeJobsChange}
              changeLabel="vs last 30 days"
            />
            <StatsCard
              icon={Users}
              label="New Clients"
              value={data.stats.newClients}
              change={data.stats.newClientsChange}
              changeLabel="vs last 30 days"
            />
            <StatsCard
              icon={FileText}
              label="Pending Invoices"
              value={data.stats.pendingInvoices}
              change={data.stats.pendingInvoicesChange}
              changeLabel="vs last 30 days"
            />
          </>
        )}
      </div>

      {/* Upcoming jobs + Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              Upcoming Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {loading || !data ? (
              Array.from({ length: 5 }).map((_, i) => <JobRowSkeleton key={i} />)
            ) : data.upcomingJobs.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No upcoming jobs scheduled.
              </p>
            ) : (
              data.upcomingJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(job.scheduledDate)} &middot; {job.clientName}
                      {job.serviceName && (
                        <span className="text-gray-400">
                          {" "}
                          &middot; {job.serviceName}
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge
                    color={STATUS_BADGE_COLOR[job.status] ?? "gray"}
                    dot
                  >
                    {job.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {loading || !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <ActivityRowSkeleton key={i} />
              ))
            ) : data.recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No recent activity.
              </p>
            ) : (
              data.recentActivity.map((item) => {
                const ActivityIcon = ACTIVITY_ICONS[item.type] ?? Clock;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <ActivityIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700">{item.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue This Week</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <RevenueChartSkeleton /> : <RevenueChart />}
        </CardContent>
      </Card>
    </div>
  );
}
