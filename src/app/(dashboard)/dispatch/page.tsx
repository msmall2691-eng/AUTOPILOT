"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface AssignedTo {
  id: string;
  firstName: string;
  lastName: string;
}

interface Job {
  id: string;
  trackingNumber: string | null;
  title: string;
  status: string;
  priority: string;
  scheduledDate: string;
  scheduledTime: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  totalAmount: number;
  client: Client;
  assignedTo: AssignedTo | null;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function statusBadgeColor(status: string): BadgeColor {
  switch (status) {
    case "scheduled":
      return "blue";
    case "in_progress":
      return "yellow";
    case "completed":
      return "green";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function statusDotColor(status: string): string {
  switch (status) {
    case "scheduled":
      return "bg-blue-500";
    case "in_progress":
      return "bg-yellow-500";
    case "completed":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-400";
    default:
      return "bg-gray-400";
  }
}

function priorityIndicator(priority: string): string {
  switch (priority) {
    case "urgent":
      return "border-l-red-500";
    case "high":
      return "border-l-orange-400";
    case "normal":
      return "border-l-blue-400";
    case "low":
      return "border-l-gray-300";
    default:
      return "border-l-gray-300";
  }
}

function formatJobAddress(job: Job): string {
  const parts = [job.address, job.city, job.state].filter(Boolean);
  return parts.join(", ") || "No address";
}

function todayISO(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
function GripVerticalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}

function MapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DispatchPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayISO);
  const [employeeFilter, setEmployeeFilter] = useState("all");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("dateFrom", date);
      params.set("dateTo", date);
      params.set("limit", "100");

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } catch (err) {
      console.error("Error fetching dispatch jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/team?limit=100");
        if (res.ok) {
          const data = await res.json();
          setEmployees(data.users ?? data.employees ?? data ?? []);
        }
      } catch {
        // silently fail
      }
    }
    fetchEmployees();
  }, []);

  // Group jobs by employee
  const filteredJobs =
    employeeFilter === "all"
      ? jobs
      : employeeFilter === "unassigned"
        ? jobs.filter((j) => !j.assignedTo)
        : jobs.filter((j) => j.assignedTo?.id === employeeFilter);

  const grouped = filteredJobs.reduce<
    Record<string, { label: string; jobs: Job[] }>
  >((acc, job) => {
    const key = job.assignedTo?.id ?? "unassigned";
    if (!acc[key]) {
      acc[key] = {
        label: job.assignedTo
          ? `${job.assignedTo.firstName} ${job.assignedTo.lastName}`
          : "Unassigned",
        jobs: [],
      };
    }
    acc[key].jobs.push(job);
    return acc;
  }, {});

  // Sort groups: unassigned last, then alphabetically
  const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "unassigned") return 1;
    if (b === "unassigned") return -1;
    return grouped[a].label.localeCompare(grouped[b].label);
  });

  // Sort jobs within each group by scheduled time
  for (const key of sortedGroupKeys) {
    grouped[key].jobs.sort((a, b) => {
      const timeA = a.scheduledTime ?? "";
      const timeB = b.scheduledTime ?? "";
      return timeA.localeCompare(timeB);
    });
  }

  const totalJobs = filteredJobs.length;
  const completedJobs = filteredJobs.filter((j) => j.status === "completed").length;
  const inProgressJobs = filteredJobs.filter((j) => j.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dispatch</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{totalJobs} job{totalJobs !== 1 ? "s" : ""}</span>
          <span className="text-gray-300">|</span>
          <span className="text-green-600">{completedJobs} completed</span>
          <span className="text-gray-300">|</span>
          <span className="text-yellow-600">{inProgressJobs} in progress</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-44">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="w-52">
          <Select
            label="Employee"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="all">All Employees</option>
            <option value="unassigned">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDate(todayISO())}
        >
          Today
        </Button>
      </div>

      {/* Split layout: sidebar + map */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        {/* Left panel: job list grouped by employee */}
        <div className="max-h-[calc(100vh-280px)] space-y-4 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : sortedGroupKeys.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
              <MapPinIcon className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-600">
                No jobs scheduled for this date
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Select a different date or create a new job.
              </p>
            </div>
          ) : (
            sortedGroupKeys.map((groupKey) => {
              const group = grouped[groupKey];
              return (
                <Card key={groupKey}>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {group.label}
                      </CardTitle>
                      <Badge color={groupKey === "unassigned" ? "gray" : "blue"}>
                        {group.jobs.length} job{group.jobs.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-gray-100">
                      {group.jobs.map((job) => (
                        <li
                          key={job.id}
                          className={`flex items-start gap-3 border-l-4 px-4 py-3 transition-colors hover:bg-gray-50 ${priorityIndicator(job.priority)}`}
                        >
                          {/* Drag handle (visual only) */}
                          <div className="mt-0.5 cursor-grab text-gray-300 hover:text-gray-400">
                            <GripVerticalIcon className="h-4 w-4" />
                          </div>

                          {/* Status dot */}
                          <div className="mt-1.5 flex-shrink-0">
                            <div className={`h-2.5 w-2.5 rounded-full ${statusDotColor(job.status)}`} />
                          </div>

                          {/* Job info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <a
                                href={`/jobs/${job.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                              >
                                {job.title}
                              </a>
                              <Badge color={statusBadgeColor(job.status)} className="flex-shrink-0">
                                {statusLabel(job.status)}
                              </Badge>
                            </div>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {job.client.firstName} {job.client.lastName}
                            </p>

                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                              {job.scheduledTime && (
                                <span className="font-medium text-gray-600">
                                  {job.scheduledTime}
                                </span>
                              )}
                              <span className="truncate">{formatJobAddress(job)}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Right panel: map placeholder */}
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <MapIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700">
                Map integration ready
              </h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Connect Google Maps API to display job locations, optimize routes, and track your team in real time.
              </p>
            </div>
            <div className="mt-2 rounded-lg bg-white px-4 py-3 shadow-sm border border-gray-200">
              <p className="text-xs font-mono text-gray-400">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
              </p>
            </div>
            {totalJobs > 0 && (
              <p className="text-sm text-gray-500">
                {totalJobs} job{totalJobs !== 1 ? "s" : ""} would appear on the map
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
