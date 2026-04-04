"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  RefreshCw,
  Calendar,
  Repeat,
  Pause,
  Play,
  Clock,
  Users,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecurringSchedule {
  id: string;
  title: string;
  frequency: string;
  interval: number;
  dayOfWeek: string | null;
  dayOfMonth: number | null;
  preferredTime: string | null;
  estimatedDuration: number | null;
  totalAmount: number;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  client?: { id: string; firstName: string; lastName: string } | null;
  service?: { id: string; name: string } | null;
  _count?: { jobs: number };
}

interface ClientOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface ServiceOption {
  id: string;
  name: string;
  price: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FREQUENCY_LABELS: Record<string, string> = {
  once: "One-time",
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  custom: "Custom",
};

const FREQUENCY_COLORS: Record<string, BadgeColor> = {
  once: "gray",
  weekly: "blue",
  biweekly: "purple",
  monthly: "green",
  custom: "yellow",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatFrequency(schedule: RecurringSchedule): string {
  const base = FREQUENCY_LABELS[schedule.frequency] || schedule.frequency;
  if (schedule.frequency === "weekly" && schedule.dayOfWeek) {
    const days = schedule.dayOfWeek.split(",").map((d) => DAY_NAMES[parseInt(d)] || d);
    return `${base} (${days.join(", ")})`;
  }
  if (schedule.frequency === "monthly" && schedule.dayOfMonth) {
    return `${base} (day ${schedule.dayOfMonth})`;
  }
  return base;
}

const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly (every 2 weeks)" },
  { value: "monthly", label: "Monthly" },
];

const DAY_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RecurringSchedulesPage() {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);

  // Form state
  const [formClientId, setFormClientId] = useState("");
  const [formServiceId, setFormServiceId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formFrequency, setFormFrequency] = useState("weekly");
  const [formDayOfWeek, setFormDayOfWeek] = useState("1");
  const [formDayOfMonth, setFormDayOfMonth] = useState("1");
  const [formTime, setFormTime] = useState("09:00");
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStartDate, setFormStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recurring");
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules ?? []);
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    async function fetchLookups() {
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          fetch("/api/clients?limit=100"),
          fetch("/api/services?limit=100"),
        ]);
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients ?? []);
        }
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(data.services ?? []);
        }
      } catch (err) {
        console.error("Error fetching lookups:", err);
      }
    }
    fetchLookups();
  }, []);

  const handleCreate = async () => {
    if (!formClientId || !formTitle.trim() || !formStartDate) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        clientId: formClientId,
        title: formTitle.trim(),
        frequency: formFrequency,
        startDate: formStartDate,
        preferredTime: formTime,
        totalAmount: parseFloat(formAmount) || 0,
        notes: formNotes.trim() || undefined,
      };

      if (formServiceId) body.serviceId = formServiceId;
      if (formFrequency === "monthly") {
        body.dayOfMonth = parseInt(formDayOfMonth);
      } else {
        body.dayOfWeek = formDayOfWeek;
      }

      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowModal(false);
        setFormTitle("");
        setFormClientId("");
        setFormServiceId("");
        setFormAmount("");
        setFormNotes("");
        fetchSchedules();
      }
    } catch (err) {
      console.error("Error creating schedule:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/recurring", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !isActive } : s))
      );
    } catch (err) {
      console.error("Error toggling schedule:", err);
    }
  };

  // Stats
  const activeCount = schedules.filter((s) => s.isActive).length;
  const totalMonthlyValue = schedules
    .filter((s) => s.isActive)
    .reduce((sum, s) => {
      if (s.frequency === "weekly") return sum + s.totalAmount * 4;
      if (s.frequency === "biweekly") return sum + s.totalAmount * 2;
      return sum + s.totalAmount;
    }, 0);
  const totalJobsGenerated = schedules.reduce(
    (sum, s) => sum + (s._count?.jobs ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Recurring Schedules
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage recurring jobs for your clients - weekly, bi-weekly, and
            monthly.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Schedule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard icon={Repeat} label="Active Schedules" value={activeCount} />
        <StatsCard
          icon={Calendar}
          label="Est. Monthly Revenue"
          value={formatCurrency(totalMonthlyValue)}
        />
        <StatsCard
          icon={Clock}
          label="Total Jobs Generated"
          value={totalJobsGenerated}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
          <Repeat className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-600">
            No recurring schedules yet
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Create your first recurring schedule to automate job creation.
          </p>
          <Button
            className="mt-4"
            size="sm"
            onClick={() => setShowModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Schedule</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">
                      {schedule.title}
                    </p>
                    {schedule.service && (
                      <p className="text-xs text-gray-500">
                        {schedule.service.name}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {schedule.client
                    ? `${schedule.client.firstName} ${schedule.client.lastName}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    color={FREQUENCY_COLORS[schedule.frequency] ?? "gray"}
                  >
                    {formatFrequency(schedule)}
                  </Badge>
                </TableCell>
                <TableCell>{schedule.preferredTime || "—"}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(schedule.totalAmount)}
                </TableCell>
                <TableCell>{formatDate(schedule.startDate)}</TableCell>
                <TableCell>
                  <Badge
                    color={schedule.isActive ? "green" : "gray"}
                    dot
                  >
                    {schedule.isActive ? "Active" : "Paused"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleToggle(schedule.id, schedule.isActive)
                    }
                    title={schedule.isActive ? "Pause" : "Resume"}
                  >
                    {schedule.isActive ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Recurring Schedule"
        description="Set up an automated recurring job for a client."
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Schedule Title"
            placeholder="e.g., Weekly Lawn Care - Smith"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Client"
              value={formClientId}
              onChange={(e) => setFormClientId(e.target.value)}
              options={[
                { value: "", label: "Select client..." },
                ...clients.map((c) => ({
                  value: c.id,
                  label: `${c.firstName} ${c.lastName}`,
                })),
              ]}
            />
            <Select
              label="Service"
              value={formServiceId}
              onChange={(e) => setFormServiceId(e.target.value)}
              options={[
                { value: "", label: "Select service..." },
                ...services.map((s) => ({
                  value: s.id,
                  label: s.name,
                })),
              ]}
            />
          </div>

          <Select
            label="Frequency"
            value={formFrequency}
            onChange={(e) => setFormFrequency(e.target.value)}
            options={FREQUENCY_OPTIONS}
          />

          <div className="grid grid-cols-2 gap-4">
            {formFrequency === "monthly" ? (
              <Select
                label="Day of Month"
                value={formDayOfMonth}
                onChange={(e) => setFormDayOfMonth(e.target.value)}
                options={Array.from({ length: 28 }, (_, i) => ({
                  value: String(i + 1),
                  label: `Day ${i + 1}`,
                }))}
              />
            ) : (
              <Select
                label="Day of Week"
                value={formDayOfWeek}
                onChange={(e) => setFormDayOfWeek(e.target.value)}
                options={DAY_OPTIONS}
              />
            )}
            <Input
              label="Preferred Time"
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />
            <Input
              label="Amount per Visit"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
            />
          </div>

          <Textarea
            label="Notes"
            placeholder="Any special instructions..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formTitle.trim() || !formClientId || submitting}
            >
              {submitting ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
