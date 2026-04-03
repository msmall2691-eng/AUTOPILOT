"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
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
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---- Types ----

interface CalendarJob {
  id: string;
  title: string;
  scheduledDate: string;
  scheduledTime?: string | null;
  status: string;
  totalAmount: number;
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
};

const STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  scheduled: "blue",
  in_progress: "yellow",
  completed: "green",
  cancelled: "red",
};

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
        } else {
          setJobs([]);
        }
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

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

  const selectedDateJobs = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return jobsByDate.get(key) || [];
  }, [selectedDate, jobsByDate]);

  const goToPreviousMonth = useCallback(() => setCurrentMonth((prev) => subMonths(prev, 1)), []);
  const goToNextMonth = useCallback(() => setCurrentMonth((prev) => addMonths(prev, 1)), []);
  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  }, []);
  const handleDayClick = useCallback((day: Date) => {
    setSelectedDate((prev) => (prev && isSameDay(prev, day) ? null : day));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your scheduled jobs.</p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Job
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Calendar grid */}
        <div className="flex-1 min-w-0">
          <Card>
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
                <button onClick={goToPreviousMonth} className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-500 hover:bg-gray-50 transition-colors" aria-label="Previous month">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={goToNextMonth} className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-500 hover:bg-gray-50 transition-colors" aria-label="Next month">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-6"><CalendarSkeleton /></div>
              ) : (
                <div className="overflow-hidden rounded-b-xl">
                  {/* Days of week header */}
                  <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                      const isSelected = selectedDate !== null && isSameDay(day, selectedDate);

                      return (
                        <button
                          key={dateKey}
                          onClick={() => handleDayClick(day)}
                          className={cn(
                            "relative min-h-[100px] p-2 text-left transition-colors hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
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
                              today && "bg-blue-600 text-white font-bold",
                              isSelected && !today && "bg-blue-100 text-blue-800"
                            )}
                          >
                            {format(day, "d")}
                          </span>

                          <div className="mt-1 space-y-0.5">
                            {dayJobs.slice(0, 3).map((job) => (
                              <div
                                key={job.id}
                                className={cn(
                                  "truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight border",
                                  STATUS_PILL_STYLES[job.status] || "bg-gray-100 text-gray-700 border-gray-200"
                                )}
                                title={job.title}
                              >
                                {job.scheduledTime && (
                                  <span className="opacity-75">{job.scheduledTime} </span>
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
                  <div className="py-6 text-center">
                    <p className="text-sm text-gray-400">No jobs scheduled for this day.</p>
                    <Link
                      href={`/jobs/new?date=${format(selectedDate, "yyyy-MM-dd")}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Schedule a job
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                            {job.title}
                          </h4>
                          <Badge color={STATUS_BADGE_COLOR[job.status] ?? "gray"} className="shrink-0">
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
                              {[job.address, job.city, job.state].filter(Boolean).join(", ")}
                            </div>
                          )}
                          {job.service && (
                            <div className="mt-1">
                              <Badge color="purple" className="text-[10px]">{job.service.name}</Badge>
                            </div>
                          )}
                          {job.assignedTo && (
                            <p className="text-[11px] text-gray-400">
                              Assigned to {job.assignedTo.firstName} {job.assignedTo.lastName}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/jobs/new?date=${format(selectedDate, "yyyy-MM-dd")}`}
                      className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add job
                    </Link>
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
