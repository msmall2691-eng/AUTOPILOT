"use client";

import { useState } from "react";
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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TurnoverStatus = "upcoming" | "in_progress" | "completed" | "missed";

interface Turnover {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  checkoutDate: string;
  checkoutTime: string;
  checkinDate: string;
  checkinTime: string;
  assignedCleaner: string | null;
  status: TurnoverStatus;
  autoCreated: boolean;
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

function turnaroundTime(
  checkoutDate: string,
  checkoutTime: string,
  checkinDate: string,
  checkinTime: string
): string {
  const out = new Date(`${checkoutDate}T${checkoutTime}`);
  const inn = new Date(`${checkinDate}T${checkinTime}`);
  const diffMs = inn.getTime() - out.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours < 1) return `${minutes}m`;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------
const MOCK_TURNOVERS: Turnover[] = [
  {
    id: "turn-1",
    propertyId: "prop-1",
    propertyName: "Oceanview Beach House",
    guestName: "Sarah Johnson",
    checkoutDate: "2026-04-02",
    checkoutTime: "11:00",
    checkinDate: "2026-04-02",
    checkinTime: "15:00",
    assignedCleaner: "Maria Garcia",
    status: "in_progress",
    autoCreated: true,
  },
  {
    id: "turn-2",
    propertyId: "prop-2",
    propertyName: "Downtown Loft Suite",
    guestName: "David Chen",
    checkoutDate: "2026-04-02",
    checkoutTime: "10:00",
    checkinDate: "2026-04-02",
    checkinTime: "16:00",
    assignedCleaner: "Ana Martinez",
    status: "upcoming",
    autoCreated: true,
  },
  {
    id: "turn-3",
    propertyId: "prop-6",
    propertyName: "Lakeside Bungalow",
    guestName: "Emily Watson",
    checkoutDate: "2026-04-02",
    checkoutTime: "11:00",
    checkinDate: "2026-04-02",
    checkinTime: "14:00",
    assignedCleaner: null,
    status: "upcoming",
    autoCreated: true,
  },
  {
    id: "turn-4",
    propertyId: "prop-4",
    propertyName: "Palm Villa Resort",
    guestName: "Michael Torres",
    checkoutDate: "2026-04-03",
    checkoutTime: "11:00",
    checkinDate: "2026-04-03",
    checkinTime: "15:00",
    assignedCleaner: "Maria Garcia",
    status: "upcoming",
    autoCreated: true,
  },
  {
    id: "turn-5",
    propertyId: "prop-3",
    propertyName: "Mountain Retreat Cabin",
    guestName: "Lisa Park",
    checkoutDate: "2026-04-04",
    checkoutTime: "10:00",
    checkinDate: "2026-04-05",
    checkinTime: "15:00",
    assignedCleaner: "Carlos Rivera",
    status: "upcoming",
    autoCreated: false,
  },
  {
    id: "turn-6",
    propertyId: "prop-1",
    propertyName: "Oceanview Beach House",
    guestName: "James Miller",
    checkoutDate: "2026-04-01",
    checkoutTime: "11:00",
    checkinDate: "2026-04-01",
    checkinTime: "15:00",
    assignedCleaner: "Maria Garcia",
    status: "completed",
    autoCreated: true,
  },
  {
    id: "turn-7",
    propertyId: "prop-5",
    propertyName: "Harbor View Apartment",
    guestName: "Rachel Kim",
    checkoutDate: "2026-04-01",
    checkoutTime: "10:00",
    checkinDate: "2026-04-01",
    checkinTime: "14:00",
    assignedCleaner: null,
    status: "missed",
    autoCreated: false,
  },
  {
    id: "turn-8",
    propertyId: "prop-2",
    propertyName: "Downtown Loft Suite",
    guestName: "Tom Bradley",
    checkoutDate: "2026-04-05",
    checkoutTime: "11:00",
    checkinDate: "2026-04-05",
    checkinTime: "16:00",
    assignedCleaner: "Ana Martinez",
    status: "upcoming",
    autoCreated: true,
  },
];

const PROPERTY_FILTER_OPTIONS = [
  { value: "", label: "All Properties" },
  { value: "prop-1", label: "Oceanview Beach House" },
  { value: "prop-2", label: "Downtown Loft Suite" },
  { value: "prop-3", label: "Mountain Retreat Cabin" },
  { value: "prop-4", label: "Palm Villa Resort" },
  { value: "prop-5", label: "Harbor View Apartment" },
  { value: "prop-6", label: "Lakeside Bungalow" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "missed", label: "Missed" },
];

const CLEANER_FILTER_OPTIONS = [
  { value: "", label: "All Cleaners" },
  { value: "Maria Garcia", label: "Maria Garcia" },
  { value: "Ana Martinez", label: "Ana Martinez" },
  { value: "Carlos Rivera", label: "Carlos Rivera" },
  { value: "unassigned", label: "Unassigned" },
];

// ---------------------------------------------------------------------------
// Timeline bar helpers
// ---------------------------------------------------------------------------
const TIMELINE_START = 8; // 8 AM
const TIMELINE_END = 20; // 8 PM
const TIMELINE_HOURS = TIMELINE_END - TIMELINE_START;

function timeToHourFraction(time24: string): number {
  const [h, m] = time24.split(":").map(Number);
  return h + m / 60;
}

function timeToPercent(time24: string): number {
  const fraction = timeToHourFraction(time24);
  return ((fraction - TIMELINE_START) / TIMELINE_HOURS) * 100;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TurnoversPage() {
  const [view, setView] = useState<"list" | "timeline">("list");

  // Filters
  const [filterProperty, setFilterProperty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCleaner, setFilterCleaner] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const turnovers = MOCK_TURNOVERS;

  // Apply filters
  const filtered = turnovers.filter((t) => {
    if (filterProperty && t.propertyId !== filterProperty) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterCleaner) {
      if (filterCleaner === "unassigned" && t.assignedCleaner !== null)
        return false;
      if (
        filterCleaner !== "unassigned" &&
        t.assignedCleaner !== filterCleaner
      )
        return false;
    }
    if (filterDateFrom && t.checkoutDate < filterDateFrom) return false;
    if (filterDateTo && t.checkoutDate > filterDateTo) return false;
    return true;
  });

  // Stats
  const today = "2026-04-02";
  const todayTurnovers = turnovers.filter(
    (t) => t.checkoutDate === today
  ).length;
  const thisWeekEnd = "2026-04-08";
  const thisWeekTurnovers = turnovers.filter(
    (t) => t.checkoutDate >= today && t.checkoutDate <= thisWeekEnd
  ).length;
  const pendingAssignment = turnovers.filter(
    (t) => !t.assignedCleaner && t.status !== "completed" && t.status !== "missed"
  ).length;
  const overdue = turnovers.filter((t) => t.status === "missed").length;

  // For timeline view: group today's turnovers by property
  const todayTurnoversForTimeline = filtered.filter(
    (t) => t.checkoutDate === today
  );
  const timelineProperties = Array.from(
    new Set(todayTurnoversForTimeline.map((t) => t.propertyName))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Turnovers</h1>
        <div className="flex items-center gap-3">
          {/* View toggle */}
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
        <StatsCard
          icon={CalendarCheck}
          label="Today's Turnovers"
          value={todayTurnovers}
        />
        <StatsCard
          icon={Clock}
          label="This Week"
          value={thisWeekTurnovers}
        />
        <StatsCard
          icon={UserPlus}
          label="Pending Assignment"
          value={pendingAssignment}
        />
        <StatsCard
          icon={AlertTriangle}
          label="Overdue"
          value={overdue}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            label="From"
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Input
            label="To"
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            label="Property"
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            options={PROPERTY_FILTER_OPTIONS}
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
            options={CLEANER_FILTER_OPTIONS}
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
                const statusCfg = STATUS_CONFIG[turnover.status];
                return (
                  <TableRow key={turnover.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {turnover.propertyName}
                        </span>
                        {turnover.autoCreated && (
                          <Badge color="purple">
                            <Zap className="mr-0.5 h-3 w-3" />
                            Auto
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{turnover.guestName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(turnover.checkoutDate)}</div>
                        <div className="text-gray-400">
                          {formatTime12h(turnover.checkoutTime)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(turnover.checkinDate)}</div>
                        <div className="text-gray-400">
                          {formatTime12h(turnover.checkinTime)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {turnaroundTime(
                          turnover.checkoutDate,
                          turnover.checkoutTime,
                          turnover.checkinDate,
                          turnover.checkinTime
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {turnover.assignedCleaner ? (
                        <span className="text-sm text-gray-700">
                          {turnover.assignedCleaner}
                        </span>
                      ) : (
                        <span className="text-sm italic text-gray-400">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge color={statusCfg.color} dot>
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {!turnover.assignedCleaner &&
                          turnover.status !== "completed" &&
                          turnover.status !== "missed" && (
                            <Button variant="ghost" size="sm" title="Assign">
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                        {turnover.status === "upcoming" && (
                          <Button variant="ghost" size="sm" title="Start">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {turnover.status === "in_progress" && (
                          <Button variant="ghost" size="sm" title="Complete">
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
          {/* Timeline header with hour labels */}
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
                        {hour === 12
                          ? "12 PM"
                          : hour > 12
                            ? `${hour - 12} PM`
                            : `${hour} AM`}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline rows */}
          {timelineProperties.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No turnovers scheduled for today.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {timelineProperties.map((propName) => {
                const propTurnovers = todayTurnoversForTimeline.filter(
                  (t) => t.propertyName === propName
                );
                return (
                  <div
                    key={propName}
                    className="grid grid-cols-[200px_1fr] items-center"
                  >
                    <div className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900 truncate block">
                        {propName}
                      </span>
                    </div>
                    <div className="relative h-16 pr-4">
                      {/* Hour gridlines */}
                      {Array.from({ length: TIMELINE_HOURS + 1 }, (_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-l border-gray-100"
                          style={{
                            left: `${(i / TIMELINE_HOURS) * 100}%`,
                          }}
                        />
                      ))}

                      {propTurnovers.map((t) => {
                        const checkoutPct = Math.max(
                          0,
                          timeToPercent(t.checkoutTime)
                        );
                        const checkinPct = Math.min(
                          100,
                          timeToPercent(t.checkinTime)
                        );
                        const widthPct = checkinPct - checkoutPct;

                        const statusColors: Record<TurnoverStatus, string> = {
                          upcoming: "bg-blue-100 border-blue-300 text-blue-700",
                          in_progress:
                            "bg-yellow-100 border-yellow-300 text-yellow-700",
                          completed:
                            "bg-green-100 border-green-300 text-green-700",
                          missed: "bg-red-100 border-red-300 text-red-700",
                        };

                        return (
                          <div
                            key={t.id}
                            className={cn(
                              "absolute top-2 bottom-2 rounded-md border px-2 flex items-center text-xs font-medium overflow-hidden",
                              statusColors[t.status]
                            )}
                            style={{
                              left: `${checkoutPct}%`,
                              width: `${widthPct}%`,
                            }}
                            title={`${t.guestName} | ${formatTime12h(t.checkoutTime)} - ${formatTime12h(t.checkinTime)} | ${t.assignedCleaner ?? "Unassigned"}`}
                          >
                            <span className="truncate">
                              {t.assignedCleaner
                                ? t.assignedCleaner.split(" ")[0]
                                : "Unassigned"}
                              {" "}
                              &middot; {formatTime12h(t.checkoutTime)} -{" "}
                              {formatTime12h(t.checkinTime)}
                            </span>
                            {t.autoCreated && (
                              <Zap className="ml-1 h-3 w-3 shrink-0" />
                            )}
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
    </div>
  );
}
