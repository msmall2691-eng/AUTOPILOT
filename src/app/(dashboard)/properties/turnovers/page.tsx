"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatsCard } from "@/components/ui/stats-card";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  List,
  Home,
  User,
  ArrowRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockTurnovers = [
  {
    id: "1",
    propertyName: "Oceanview Studio",
    address: "123 Beach Blvd, Miami FL",
    guestName: "Sarah Johnson",
    guestCheckout: "2026-04-02T11:00:00",
    guestCheckin: "2026-04-02T15:00:00",
    turnaroundHrs: 4,
    assignedTo: "Maria Garcia",
    status: "in_progress",
    platform: "airbnb",
    autoCreated: true,
  },
  {
    id: "2",
    propertyName: "Downtown Loft",
    address: "456 Main St, Austin TX",
    guestName: "Mike Chen",
    guestCheckout: "2026-04-02T10:00:00",
    guestCheckin: "2026-04-02T16:00:00",
    turnaroundHrs: 6,
    assignedTo: null,
    status: "upcoming",
    platform: "vrbo",
    autoCreated: true,
  },
  {
    id: "3",
    propertyName: "Mountain Cabin",
    address: "789 Pine Rd, Aspen CO",
    guestName: "Lisa Park",
    guestCheckout: "2026-04-02T11:00:00",
    guestCheckin: "2026-04-03T15:00:00",
    turnaroundHrs: 28,
    assignedTo: "Carlos Ruiz",
    status: "completed",
    platform: "airbnb",
    autoCreated: true,
  },
  {
    id: "4",
    propertyName: "Lakeside Villa",
    address: "321 Lake Dr, Nashville TN",
    guestName: "Tom Wilson",
    guestCheckout: "2026-04-03T10:00:00",
    guestCheckin: "2026-04-03T15:00:00",
    turnaroundHrs: 5,
    assignedTo: "Maria Garcia",
    status: "upcoming",
    platform: "booking_com",
    autoCreated: false,
  },
  {
    id: "5",
    propertyName: "City Center Apt",
    address: "555 Urban Ave, Portland OR",
    guestName: "Emma Davis",
    guestCheckout: "2026-04-01T11:00:00",
    guestCheckin: "2026-04-01T16:00:00",
    turnaroundHrs: 5,
    assignedTo: "Ana Martinez",
    status: "missed",
    platform: "airbnb",
    autoCreated: true,
  },
  {
    id: "6",
    propertyName: "Beachfront Condo",
    address: "888 Shore Rd, Destin FL",
    guestName: "James Brown",
    guestCheckout: "2026-04-04T10:00:00",
    guestCheckin: "2026-04-04T15:00:00",
    turnaroundHrs: 5,
    assignedTo: null,
    status: "upcoming",
    platform: "vrbo",
    autoCreated: true,
  },
  {
    id: "7",
    propertyName: "Oceanview Studio",
    address: "123 Beach Blvd, Miami FL",
    guestName: "Kate Miller",
    guestCheckout: "2026-04-05T11:00:00",
    guestCheckin: "2026-04-05T16:00:00",
    turnaroundHrs: 5,
    assignedTo: null,
    status: "upcoming",
    platform: "airbnb",
    autoCreated: true,
  },
  {
    id: "8",
    propertyName: "Downtown Loft",
    address: "456 Main St, Austin TX",
    guestName: "Alex Turner",
    guestCheckout: "2026-04-06T10:00:00",
    guestCheckin: "2026-04-06T14:00:00",
    turnaroundHrs: 4,
    assignedTo: "Carlos Ruiz",
    status: "upcoming",
    platform: "vrbo",
    autoCreated: true,
  },
];

const statusConfig: Record<
  string,
  { label: string; color: "blue" | "yellow" | "green" | "red" }
> = {
  upcoming: { label: "Upcoming", color: "blue" },
  in_progress: { label: "In Progress", color: "yellow" },
  completed: { label: "Completed", color: "green" },
  missed: { label: "Missed", color: "red" },
};

const platformColors: Record<string, string> = {
  airbnb: "bg-pink-100 text-pink-700",
  vrbo: "bg-blue-100 text-blue-700",
  booking_com: "bg-indigo-100 text-indigo-700",
  direct: "bg-gray-100 text-gray-700",
};

export default function TurnoversPage() {
  const [view, setView] = useState<"list" | "timeline">("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filtered = mockTurnovers.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const todayCount = mockTurnovers.filter(
    (t) =>
      new Date(t.guestCheckout).toDateString() === new Date().toDateString()
  ).length;
  const weekCount = mockTurnovers.filter((t) => {
    const d = new Date(t.guestCheckout);
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 86400000);
    return d >= now && d <= weekEnd;
  }).length;
  const pendingAssignment = mockTurnovers.filter(
    (t) => !t.assignedTo && t.status !== "completed"
  ).length;
  const overdueCount = mockTurnovers.filter(
    (t) => t.status === "missed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turnovers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage cleaning turnovers for your rental properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                view === "list"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("timeline")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                view === "timeline"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Calendars
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Clock}
          label="Today's Turnovers"
          value={String(todayCount)}
        />
        <StatsCard
          icon={Calendar}
          label="This Week"
          value={String(weekCount)}
        />
        <StatsCard
          icon={AlertTriangle}
          label="Pending Assignment"
          value={String(pendingAssignment)}
          change={pendingAssignment > 0 ? -pendingAssignment : 0}
        />
        <StatsCard
          icon={CheckCircle2}
          label="Overdue"
          value={String(overdueCount)}
          change={overdueCount > 0 ? -overdueCount : 0}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="missed">Missed</option>
        </Select>
        <Select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </Select>
      </div>

      {/* List View */}
      {view === "list" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Checkout</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Turnaround</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((turnover) => {
                const sc = statusConfig[turnover.status];
                return (
                  <TableRow key={turnover.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {turnover.propertyName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {turnover.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{turnover.guestName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(turnover.guestCheckout).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(turnover.guestCheckout).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {turnover.guestCheckin ? (
                        <>
                          <div className="text-sm">
                            {new Date(
                              turnover.guestCheckin
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              turnover.guestCheckin
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {turnover.turnaroundHrs}h
                      </span>
                    </TableCell>
                    <TableCell>
                      {turnover.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-3 h-3 text-indigo-600" />
                          </div>
                          <span className="text-sm">{turnover.assignedTo}</span>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm">
                          Assign
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge color={sc.color}>{sc.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            platformColors[turnover.platform]
                          )}
                        >
                          {turnover.platform === "booking_com"
                            ? "Booking.com"
                            : turnover.platform.charAt(0).toUpperCase() +
                              turnover.platform.slice(1)}
                        </span>
                        {turnover.autoCreated && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Zap className="w-3 h-3" />
                            Auto
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Timeline View */}
      {view === "timeline" && (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 mb-4">
              {/* Time header */}
              <div className="flex items-center">
                <div className="w-40 shrink-0" />
                <div className="flex-1 flex">
                  {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 text-xs text-gray-400 text-center"
                    >
                      {hour > 12 ? `${hour - 12}pm` : hour === 12 ? "12pm" : `${hour}am`}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline rows */}
            <div className="space-y-3">
              {mockTurnovers
                .filter(
                  (t) =>
                    new Date(t.guestCheckout).toDateString() ===
                    new Date().toDateString()
                )
                .map((turnover) => {
                  const checkoutHour =
                    new Date(turnover.guestCheckout).getHours() - 8;
                  const checkinHour = turnover.guestCheckin
                    ? new Date(turnover.guestCheckin).getHours() - 8
                    : checkoutHour + 4;
                  const startPct = (checkoutHour / 12) * 100;
                  const widthPct = ((checkinHour - checkoutHour) / 12) * 100;

                  return (
                    <div key={turnover.id} className="flex items-center">
                      <div className="w-40 shrink-0 pr-3">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {turnover.propertyName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {turnover.assignedTo || "Unassigned"}
                        </div>
                      </div>
                      <div className="flex-1 relative h-10 bg-gray-50 rounded">
                        <div
                          className={cn(
                            "absolute top-1 bottom-1 rounded flex items-center px-2",
                            turnover.status === "completed"
                              ? "bg-green-200"
                              : turnover.status === "in_progress"
                              ? "bg-yellow-200"
                              : turnover.status === "missed"
                              ? "bg-red-200"
                              : "bg-blue-200"
                          )}
                          style={{
                            left: `${Math.max(0, startPct)}%`,
                            width: `${Math.min(widthPct, 100 - startPct)}%`,
                          }}
                        >
                          <div className="flex items-center gap-1 text-xs truncate">
                            <Home className="w-3 h-3 shrink-0" />
                            <ArrowRight className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {turnover.guestName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {mockTurnovers.filter(
              (t) =>
                new Date(t.guestCheckout).toDateString() ===
                new Date().toDateString()
            ).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                <p>No turnovers scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
