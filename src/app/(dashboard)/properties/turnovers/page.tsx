"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn, formatDate } from "@/lib/utils";
import {
  CalendarCheck,
  Clock,
  AlertTriangle,
  Plus,
  List,
  LayoutGrid,
  Play,
  CheckCircle2,
  UserPlus,
  Eye,
  Zap,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TurnoverStatus = "upcoming" | "in_progress" | "completed" | "missed";

interface ApiTurnover {
  id: string;
  propertyId: string;
  guestCheckout: string;
  guestCheckin: string | null;
  guestName: string | null;
  platform: string | null;
  status: string;
  autoCreated: boolean;
  turnaroundHrs: number | null;
  notes: string | null;
  property: { id: string; name: string };
  job: { id: string; title: string; assignedTo: { id: string; firstName: string; lastName: string } | null } | null;
}

interface PropertyOption {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  TurnoverStatus,
  { label: string; color: BadgeColor }
> = {
  upcoming: { label: "Upcoming", color: "blue" },
  in_progress: { label: "In Progress", color: "yellow" },
  completed: { label: "Completed", color: "green" },
  missed: { label: "Missed", color: "red" },
};

function turnaroundTime(checkout: string, checkin: string | null): string {
  if (!checkin) return "—";
  const out = new Date(checkout);
  const inn = new Date(checkin);
  const diffMs = inn.getTime() - out.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours < 1) return `${minutes}m`;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatTime12h(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// ---------------------------------------------------------------------------
// Timeline bar helpers
// ---------------------------------------------------------------------------
const TIMELINE_START = 8;
const TIMELINE_END = 20;
const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START;

function timeToPercent(isoDate: string): number {
  const d = new Date(isoDate);
  const fraction = d.getHours() + d.getMinutes() / 60;
  return ((fraction - TIMELINE_START) / TIMELINE_HOURS) * 100;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TurnoversPage() {
  const [turnovers, setTurnovers] = useState<ApiTurnover[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "timeline">("list");

  // Filters
  const [filterProperty, setFilterProperty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCleaner, setFilterCleaner] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const fetchTurnovers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterProperty) params.set("propertyId", filterProperty);
      if (filterStatus) params.set("status", filterStatus);
      if (filterDateFrom) params.set("dateFrom", filterDateFrom);
      if (filterDateTo) params.set("dateTo", filterDateTo);

      const res = await fetch(`/api/turnovers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTurnovers(data.turnovers ?? []);
        setProperties(data.properties ?? []);
        setTeam(data.team ?? []);
      }
    } catch (err) {
      console.error("Error fetching turnovers:", err);
    } finally {
      setLoading(false);
    }
  }, [filterProperty, filterStatus, filterDateFrom, filterDateTo]);

  useEffect(() => {
    fetchTurnovers();
  }, [fetchTurnovers]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch("/api/turnovers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setTurnovers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Error updating turnover:", err);
    }
  };

  // Client-side cleaner filter
  const filtered = filterCleaner
    ? turnovers.filter((t) => {
        if (filterCleaner === "unassigned") return !t.job?.assignedTo;
        return t.job?.assignedTo?.id === filterCleaner;
      })
    : turnovers;

  // Stats
  const today = new Date().toISOString().split("T")[0];
  const todayTurnovers = turnovers.filter(
    (t) => t.guestCheckout.split("T")[0] === today
  ).length;
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split("T")[0];
  const thisWeekTurnovers = turnovers.filter((t) => {
    const d = t.guestCheckout.split("T")[0];
    return d >= today && d <= weekEndStr;
  }).length;
  const pendingAssignment = turnovers.filter(
    (t) => !t.job?.assignedTo && t.status !== "completed" && t.status !== "missed"
  ).length;
  const overdue = turnovers.filter((t) => t.status === "missed").length;

  // Timeline view
  const todayFiltered = filtered.filter(
    (t) => t.guestCheckout.split("T")[0] === today
  );
  const timelineProperties = Array.from(
    new Set(todayFiltered.map((t) => t.property.name))
  );

  const STATUS_FILTER_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "upcoming", label: "Upcoming" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "missed", label: "Missed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Turnovers</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setView("timeline")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === "timeline"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Timeline
            </button>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Turnover
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={CalendarCheck} label="Today's Turnovers" value={todayTurnovers} />
        <StatsCard icon={Clock} label="This Week" value={thisWeekTurnovers} />
        <StatsCard icon={UserPlus} label="Pending Assignment" value={pendingAssignment} />
        <StatsCard icon={AlertTriangle} label="Overdue" value={overdue} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input label="From" type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
        </div>
        <div className="w-40">
          <Input label="To" type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
        </div>
        <div className="w-48">
          <Select
            label="Property"
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            options={[
              { value: "", label: "All Properties" },
              ...properties.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
        <div className="w-40">
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
        <div className="w-40">
          <Select
            label="Assigned To"
            value={filterCleaner}
            onChange={(e) => setFilterCleaner(e.target.value)}
            options={[
              { value: "", label: "All Cleaners" },
              ...team.map((m) => ({ value: m.id, label: `${m.firstName} ${m.lastName}` })),
              { value: "unassigned", label: "Unassigned" },
            ]}
          />
        </div>
        {(filterProperty || filterStatus || filterCleaner || filterDateFrom || filterDateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterProperty("");
              setFilterStatus("");
              setFilterCleaner("");
              setFilterDateFrom("");
              setFilterDateTo("");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* List View */}
          {view === "list" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Checkout</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Turnaround</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="py-8 text-center text-sm text-gray-400">
                        No turnovers match the selected filters.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((turnover) => {
                    const statusCfg = STATUS_CONFIG[turnover.status as TurnoverStatus] ?? STATUS_CONFIG.upcoming;
                    const assignedName = turnover.job?.assignedTo
                      ? `${turnover.job.assignedTo.firstName} ${turnover.job.assignedTo.lastName}`
                      : null;
                    return (
                      <TableRow key={turnover.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{turnover.property.name}</span>
                            {turnover.autoCreated && (
                              <Badge color="purple">
                                <Zap className="mr-0.5 h-3 w-3" />
                                Auto
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{turnover.guestName || "—"}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(turnover.guestCheckout)}</div>
                            <div className="text-gray-400">{formatTime12h(turnover.guestCheckout)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {turnover.guestCheckin ? (
                            <div className="text-sm">
                              <div>{formatDate(turnover.guestCheckin)}</div>
                              <div className="text-gray-400">{formatTime12h(turnover.guestCheckin)}</div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {turnaroundTime(turnover.guestCheckout, turnover.guestCheckin)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {assignedName ? (
                            <span className="text-sm text-gray-700">{assignedName}</span>
                          ) : (
                            <span className="text-sm italic text-gray-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge color={statusCfg.color} dot>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {!turnover.job?.assignedTo &&
                              turnover.status !== "completed" &&
                              turnover.status !== "missed" && (
                                <Button variant="ghost" size="sm" title="Assign">
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              )}
                            {turnover.status === "upcoming" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Start"
                                onClick={() => handleStatusChange(turnover.id, "in_progress")}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {turnover.status === "in_progress" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Complete"
                                onClick={() => handleStatusChange(turnover.id, "completed")}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Link href={`/properties/${turnover.propertyId}`}>
                              <Button variant="ghost" size="sm" title="View Property">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          {/* Timeline View */}
          {view === "timeline" && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-[200px_1fr]">
                  <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Property
                  </div>
                  <div className="relative py-3 pr-4">
                    <div className="flex">
                      {Array.from({ length: TIMELINE_HOURS + 1 }, (_, i) => {
                        const hour = TIMELINE_START + i;
                        return (
                          <div
                            key={hour}
                            className="text-xs text-gray-400 font-medium"
                            style={{
                              position: "absolute",
                              left: `${(i / TIMELINE_HOURS) * 100}%`,
                              transform: "translateX(-50%)",
                            }}
                          >
                            {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {timelineProperties.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  No turnovers scheduled for today.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {timelineProperties.map((propName) => {
                    const propTurnovers = todayFiltered.filter(
                      (t) => t.property.name === propName
                    );
                    return (
                      <div key={propName} className="grid grid-cols-[200px_1fr] items-center">
                        <div className="px-4 py-4">
                          <span className="text-sm font-medium text-gray-900 truncate block">
                            {propName}
                          </span>
                        </div>
                        <div className="relative h-16 pr-4">
                          {Array.from({ length: TIMELINE_HOURS + 1 }, (_, i) => (
                            <div
                              key={i}
                              className="absolute top-0 bottom-0 border-l border-gray-100"
                              style={{ left: `${(i / TIMELINE_HOURS) * 100}%` }}
                            />
                          ))}
                          {propTurnovers.map((t) => {
                            const checkoutPct = Math.max(0, timeToPercent(t.guestCheckout));
                            const checkinPct = t.guestCheckin
                              ? Math.min(100, timeToPercent(t.guestCheckin))
                              : Math.min(100, checkoutPct + 20);
                            const widthPct = checkinPct - checkoutPct;

                            const statusColors: Record<string, string> = {
                              upcoming: "bg-blue-100 border-blue-300 text-blue-700",
                              in_progress: "bg-yellow-100 border-yellow-300 text-yellow-700",
                              completed: "bg-green-100 border-green-300 text-green-700",
                              missed: "bg-red-100 border-red-300 text-red-700",
                            };

                            const assignedName = t.job?.assignedTo
                              ? t.job.assignedTo.firstName
                              : "Unassigned";

                            return (
                              <div
                                key={t.id}
                                className={cn(
                                  "absolute top-2 bottom-2 rounded-md border px-2 flex items-center text-xs font-medium overflow-hidden",
                                  statusColors[t.status] ?? statusColors.upcoming
                                )}
                                style={{
                                  left: `${checkoutPct}%`,
                                  width: `${widthPct}%`,
                                }}
                                title={`${t.guestName ?? "Guest"} | ${formatTime12h(t.guestCheckout)} - ${t.guestCheckin ? formatTime12h(t.guestCheckin) : "TBD"} | ${assignedName}`}
                              >
                                <span className="truncate">
                                  {assignedName} &middot; {formatTime12h(t.guestCheckout)}
                                  {t.guestCheckin ? ` - ${formatTime12h(t.guestCheckin)}` : ""}
                                </span>
                                {t.autoCreated && <Zap className="ml-1 h-3 w-3 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
