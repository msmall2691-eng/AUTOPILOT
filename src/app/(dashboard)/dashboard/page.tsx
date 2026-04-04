"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  TrendingUp,
  Target,
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

interface Conversions {
  totalClients: number;
  totalJobs: number;
  completedJobs: number;
  jobCompletionRate: number;
  totalEstimates: number;
  acceptedEstimates: number;
  estimateConversionRate: number;
}

interface RevenueDay {
  label: string;
  value: number;
  date: string;
}

interface UpcomingJob {
  id: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string | null;
  status: string;
  clientName: string;
  serviceName: string | null;
  assignedTo: string | null;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface DashboardData {
  stats: DashboardStats;
  conversions: Conversions;
  revenueChart: RevenueDay[];
  upcomingJobs: UpcomingJob[];
  recentActivity: ActivityItem[];
}

// ---- Helpers ----

const STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  scheduled: "blue",
  in_progress: "yellow",
  completed: "green",
  cancelled: "red",
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

// ---- Skeletons ----

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

function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="space-y-1.5">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="h-3 w-28 rounded bg-gray-200" />
          </div>
          <div className="h-5 w-16 rounded-full bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

// ---- Revenue Chart ----

function RevenueChart({ data }: { data: RevenueDay[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-3 h-48 pt-4">
      {data.map((day) => {
        const pct = (day.value / max) * 100;
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-gray-500">
              {day.value > 0 ? formatCurrency(day.value) : "$0"}
            </span>
            <div
              className="w-full rounded-t-md bg-blue-500 transition-all duration-500 min-h-[4px]"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            <span className="text-xs text-gray-500">{day.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---- Conversion Ring ----

function ConversionRing({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-xs text-gray-400">{value} / {total}</p>
      </div>
    </div>
  );
}

// ---- Main Page ----

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here&apos;s an overview of your business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/jobs/new" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <PlusCircle className="h-4 w-4" />
            New Job
          </Link>
        </div>
      </div>

      {/* Stats Row */}
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
              label="Revenue (30d)"
              value={formatCurrency(data.stats.totalRevenue)}
              change={data.stats.revenueChange}
              changeLabel="vs prev 30 days"
            />
            <StatsCard
              icon={Briefcase}
              label="Active Jobs"
              value={data.stats.activeJobs}
              change={data.stats.activeJobsChange}
              changeLabel="vs prev 30 days"
            />
            <StatsCard
              icon={Users}
              label="New Clients"
              value={data.stats.newClients}
              change={data.stats.newClientsChange}
              changeLabel="vs prev 30 days"
            />
            <StatsCard
              icon={FileText}
              label="Pending Invoices"
              value={data.stats.pendingInvoices}
              change={data.stats.pendingInvoicesChange}
              changeLabel="vs prev 30 days"
            />
          </>
        )}
      </div>

      {/* Middle row: Revenue Chart + Conversion Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue chart - spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              Revenue This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <div className="h-48 animate-pulse rounded bg-gray-100" />
            ) : (
              <RevenueChart data={data.revenueChart} />
            )}
          </CardContent>
        </Card>

        {/* Conversion metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-gray-400" />
              Conversion Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <div className="h-48 animate-pulse rounded bg-gray-100" />
            ) : (
              <div className="flex items-center justify-around py-4">
                <ConversionRing
                  label="Jobs Completed"
                  value={data.conversions.completedJobs}
                  total={data.conversions.totalJobs}
                  color="#22c55e"
                />
                <ConversionRing
                  label="Estimates Won"
                  value={data.conversions.acceptedEstimates}
                  total={data.conversions.totalEstimates}
                  color="#3b82f6"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Upcoming Jobs + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              Upcoming Jobs
            </CardTitle>
            <Link href="/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100">
            {loading || !data ? (
              <CardSkeleton />
            ) : data.upcomingJobs.length === 0 ? (
              <div className="py-8 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">No upcoming jobs scheduled.</p>
                <Link href="/jobs/new" className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700">
                  Schedule a job
                </Link>
              </div>
            ) : (
              data.upcomingJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-gray-50 -mx-6 px-6 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(job.scheduledDate)}
                      {job.scheduledTime && ` at ${job.scheduledTime}`}
                      {" \u00b7 "}
                      {job.clientName}
                      {job.assignedTo && (
                        <span className="text-gray-400"> &middot; {job.assignedTo}</span>
                      )}
                    </p>
                  </div>
                  <Badge color={STATUS_BADGE_COLOR[job.status] ?? "gray"} dot>
                    {job.status.replace(/_/g, " ")}
                  </Badge>
                </Link>
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
              <CardSkeleton />
            ) : data.recentActivity.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">No recent activity yet.</p>
                <p className="text-xs text-gray-400 mt-1">Activity will appear as you use the app.</p>
              </div>
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
    </div>
  );
}
