"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

// ---- Types ----

interface CalendarJob {
  id: string;
  title: string;
  scheduledDate: string;
  scheduledTime?: string | null;
  status: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  service?: {
    id: string;
    name: string;
  } | null;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
}

// ---- Constants ----

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_PILL_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  scheduled: "blue",
  in_progress: "yellow",
  completed: "green",
  cancelled: "red",
  pending: "gray",
};

// ---- Mock data for demo mode ----

function getMockJobs(): CalendarJob[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  return [
    {
      id: "cal-1",
      title: "Lawn Maintenance",
      scheduledDate: new Date(year, month, 3).toISOString(),
      scheduledTime: "09:00",
      status: "completed",
      client: { id: "c1", firstName: "Sarah", lastName: "Johnson" },
      service: { id: "s1", name: "Lawn Care" },
      assignedTo: { id: "t1", firstName: "Tom", lastName: "Baker" },
      address: "123 Oak Street",
      city: "Springfield",
      state: "IL",
    },
    {
      id: "cal-2",
      title: "HVAC Repair",
      scheduledDate: new Date(year, month, 5).toISOString(),
      scheduledTime: "10:30",
      status: "completed",
      client: { id: "c2", firstName: "Mike", lastName: "Davis" },
      service: { id: "s2", name: "HVAC Service" },
      assignedTo: { id: "t2", firstName: "Jake", lastName: "Wilson" },
      address: "456 Elm Avenue",
      city: "Springfield",
      state: "IL",
    },
    {
      id: "cal-3",
      title: "Kitchen Remodel - Phase 2",
      scheduledDate: new Date(year, month, today.getDate()).toISOString(),
      scheduledTime: "08:00",
      status: "in_progress",
      client: { id: "c3", firstName: "Emily", lastName: "Chen" },
      service: { id: "s3", name: "Remodeling" },
      assignedTo: { id: "t1", firstName: "Tom", lastName: "Baker" },
      address: "789 Pine Road",
      city: "Springfield",
      state: "IL",
    },
    {
      id: "cal-4",
      title: "Roof Inspection",
      scheduledDate: new Date(year, month, today.getDate() + 2).toISOString(),
      scheduledTime: "14:00",
      status: "scheduled",
      client: { id: "c4", firstName: "James", lastName: "Wilson" },
      service: { id: "s4", name: "Inspection" },
      address: "321 Maple Drive",
      city: "Springfield",
      state: "IL",
    },
    {
      id: "cal-5",
      title: "Plumbing Installation",
      scheduledDate: new Date(year, month, today.getDate() + 4).toISOString(),
      scheduledTime: "11:00",
      status: "scheduled",
      client: { id: "c5", firstName: "Lisa", lastName: "Anderson" },
      service: { id: "s5", name: "Plumbing" },
      assignedTo: { id: "t2", firstName: "Jake", lastName: "Wilson" },
      address: "654 Cedar Lane",
      city: "Springfield",
      state: "IL",
    },
    {
      id: "cal-6",
      title: "Deck Staining",
      scheduledDate: new Date(year, month, today.getDate() + 4).toISOString(),
      scheduledTime: "09:00",
      status: "scheduled",
      client: { id: "c6", firstName: "Robert", lastName: "Martinez" },
      service: { id: "s6", name: "Exterior" },
      address: "987 Birch Court",
      city: "Springfield",
      state: "IL",
    },
    {
      id: "cal-7",
      title: "Bathroom Renovation",
      scheduledDate: new Date(year, month, 15).toISOString(),
      scheduledTime: "08:30",
      status: "scheduled",
      client: { id: "c7", firstName: "Anna", lastName: "Lee" },
      service: { id: "s3", name: "Remodeling" },
      assignedTo: { id: "t1", firstName: "Tom", lastName: "Baker" },
      address: "111 Walnut Street",
      city: "Springfield",
      state: "IL",
    },
    {
      id: "cal-8",
      title: "Gutter Cleaning",
      scheduledDate: new Date(year, month, 20).toISOString(),
      scheduledTime: "13:00",
      status: "scheduled",
      client: { id: "c8", firstName: "David", lastName: "Kim" },
      service: { id: "s7", name: "Exterior Cleaning" },
      address: "222 Spruce Avenue",
      city: "Springfield",
      state: "IL",
    },
    {
      id: "cal-9",
      title: "Electrical Panel Upgrade",
      scheduledDate: new Date(year, month, 22).toISOString(),
      scheduledTime: "10:00",
      status: "scheduled",
      client: { id: "c2", firstName: "Mike", lastName: "Davis" },
      service: { id: "s8", name: "Electrical" },
      assignedTo: { id: "t2", firstName: "Jake", lastName: "Wilson" },
      address: "456 Elm Avenue",
      city: "Springfield",
      state: "IL",
    },
    {
      id: "cal-10",
      title: "Window Replacement",
      scheduledDate: new Date(year, month, 25).toISOString(),
      scheduledTime: "09:00",
      status: "scheduled",
      client: { id: "c1", firstName: "Sarah", lastName: "Johnson" },
      service: { id: "s9", name: "Windows & Doors" },
      address: "123 Oak Street",
      city: "Springfield",
      state: "IL",
    },
  ];
}

// ---- Skeleton ----

function CalendarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="bg-white p-3 min-h-[100px]">
            <div className="h-4 w-6 rounded bg-gray-200 mb-2" />
            {i % 5 === 0 && <div className="h-5 w-full rounded bg-gray-100" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Main page component ----

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [jobs, setJobs] = useState<CalendarJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch jobs for the current month view
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
        const dateFrom = format(gridStart, "yyyy-MM-dd");
        const dateTo = format(gridEnd, "yyyy-MM-dd");
        const res = await fetch(`/api/jobs?limit=100&dateFrom=${dateFrom}&dateTo=${dateTo}`);
        if (res.ok) {
          const json = await res.json();
          setJobs(json.jobs ?? []);
        } else if (res.status === 401) {
          setJobs(getMockJobs());
        }
      } catch {
        setJobs(getMockJobs());
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [currentMonth]);

  // Build calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  // Map jobs to dates for efficient lookup
  const jobsByDate = useMemo(() => {
    const map = new Map<string, CalendarJob[]>();
    for (const job of jobs) {
      const dateKey = format(new Date(job.scheduledDate), "yyyy-MM-dd");
      const existing = map.get(dateKey) || [];
      existing.push(job);
      map.set(dateKey, existing);
    }
    return map;
  }, [jobs]);

  // Jobs for selected date
  const selectedDateJobs = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return jobsByDate.get(key) || [];
  }, [selectedDate, jobsByDate]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  }, []);

  const handleDayClick = useCallback((day: Date) => {
    setSelectedDate((prev) => (prev && isSameDay(prev, day) ? null : day));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your scheduled jobs.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Calendar grid */}
        <div className="flex-1 min-w-0">
          <Card>
            {/* Month navigation header */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={goToPreviousMonth}
                  className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-6">
                  <CalendarSkeleton />
                </div>
              ) : (
                <div className="overflow-hidden rounded-b-xl">
                  {/* Days of week header */}
                  <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {DAYS_OF_WEEK.map((day) => (
                      <div
                        key={day}
                        className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 divide-x divide-gray-100">
                    {calendarDays.map((day, idx) => {
                      const dateKey = format(day, "yyyy-MM-dd");
                      const dayJobs = jobsByDate.get(dateKey) || [];
                      const inCurrentMonth = isSameMonth(day, currentMonth);
                      const today = isToday(day);
                      const isSelected =
                        selectedDate !== null && isSameDay(day, selectedDate);

                      return (
                        <button
                          key={dateKey}
                          onClick={() => handleDayClick(day)}
                          className={cn(
                            "relative min-h-[100px] p-2 text-left transition-colors hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
                            // Row border: add top border after first row
                            idx >= 7 && "border-t border-gray-100",
                            !inCurrentMonth && "bg-gray-50/50",
                            isSelected && "bg-blue-50 ring-2 ring-inset ring-blue-500"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                              !inCurrentMonth && "text-gray-400",
                              inCurrentMonth && "text-gray-900",
                              today &&
                                "bg-blue-600 text-white font-bold",
                              isSelected && !today && "bg-blue-100 text-blue-800"
                            )}
                          >
                            {format(day, "d")}
                          </span>

                          {/* Job pills */}
                          <div className="mt-1 space-y-0.5">
                            {dayJobs.slice(0, 3).map((job) => (
                              <div
                                key={job.id}
                                className={cn(
                                  "truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight border",
                                  STATUS_PILL_STYLES[job.status] ||
                                    "bg-gray-100 text-gray-700 border-gray-200"
                                )}
                                title={job.title}
                              >
                                {job.scheduledTime && (
                                  <span className="opacity-75">
                                    {job.scheduledTime}{" "}
                                  </span>
                                )}
                                {job.title}
                              </div>
                            ))}
                            {dayJobs.length > 3 && (
                              <div className="px-1.5 text-[11px] font-medium text-gray-500">
                                +{dayJobs.length - 3} more
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side panel: selected day details */}
        {selectedDate && (
          <div className="w-80 shrink-0">
            <Card className="sticky top-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  {format(selectedDate, "EEEE, MMM d")}
                </CardTitle>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                {selectedDateJobs.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No jobs scheduled for this day.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateJobs.map((job) => (
                      <div
                        key={job.id}
                        className="rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                            {job.title}
                          </h4>
                          <Badge
                            color={STATUS_BADGE_COLOR[job.status] ?? "gray"}
                            className="shrink-0"
                          >
                            {job.status.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        <div className="mt-2 space-y-1.5">
                          {job.scheduledTime && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5" />
                              {job.scheduledTime}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <User className="h-3.5 w-3.5" />
                            {job.client.firstName} {job.client.lastName}
                          </div>

                          {(job.address || job.city) && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <MapPin className="h-3.5 w-3.5" />
                              {[job.address, job.city, job.state]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}

                          {job.service && (
                            <div className="mt-1">
                              <Badge color="purple" className="text-[10px]">
                                {job.service.name}
                              </Badge>
                            </div>
                          )}

                          {job.assignedTo && (
                            <p className="text-[11px] text-gray-400">
                              Assigned to {job.assignedTo.firstName}{" "}
                              {job.assignedTo.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
