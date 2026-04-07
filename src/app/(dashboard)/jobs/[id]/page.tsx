"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  User,
  MapPin,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface AssignedTo {
  id: string;
  firstName: string;
  lastName: string;
}

interface Service {
  id: string;
  name: string;
}

interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
}

interface TimeEntry {
  id: string;
  clockIn: string;
  clockOut: string | null;
  duration: number | null;
}

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  scheduledDate: string;
  scheduledTime: string | null;
  scheduledEndTime: string | null;
  estimatedDuration: number | null;
  totalAmount: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string | null;
  internalNotes: string | null;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  client: Client;
  assignedTo: AssignedTo | null;
  service: Service | null;
  lineItems: LineItem[];
  invoice: Invoice | null;
  timeEntries: TimeEntry[];
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

function priorityBadgeColor(priority: string): BadgeColor {
  switch (priority) {
    case "high":
      return "red";
    case "medium":
      return "yellow";
    case "low":
      return "green";
    default:
      return "gray";
  }
}

const STATUS_STEPS = ["scheduled", "in_progress", "completed"] as const;

function statusStepIndex(status: string): number {
  const idx = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
  return idx === -1 ? -1 : idx;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editScheduledDate, setEditScheduledDate] = useState("");
  const [editScheduledTime, setEditScheduledTime] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editZip, setEditZip] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editInternalNotes, setEditInternalNotes] = useState("");

  // -------------------------------------------
  // Fetch job
  // -------------------------------------------
  const fetchJob = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch job");
      const data = await res.json();
      setJob(data.job);
    } catch (err) {
      console.error("Error fetching job:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // Populate edit fields when entering edit mode
  const startEditing = () => {
    if (!job) return;
    setEditTitle(job.title);
    setEditDescription(job.description || "");
    setEditScheduledDate(job.scheduledDate ? job.scheduledDate.slice(0, 10) : "");
    setEditScheduledTime(job.scheduledTime || "");
    setEditPriority(job.priority || "medium");
    setEditAddress(job.address || "");
    setEditCity(job.city || "");
    setEditState(job.state || "");
    setEditZip(job.zip || "");
    setEditNotes(job.notes || "");
    setEditInternalNotes(job.internalNotes || "");
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  // -------------------------------------------
  // Save edits
  // -------------------------------------------
  const saveEdits = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          scheduledDate: editScheduledDate,
          scheduledTime: editScheduledTime,
          priority: editPriority,
          address: editAddress,
          city: editCity,
          state: editState,
          zip: editZip,
          notes: editNotes,
          internalNotes: editInternalNotes,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setJob(data.job);
      setEditing(false);
    } catch (err) {
      console.error("Error saving job:", err);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------
  // Status change
  // -------------------------------------------
  const updateStatus = async (newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      setJob(data.job);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------
  // Delete
  // -------------------------------------------
  const deleteJob = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/jobs");
    } catch (err) {
      console.error("Error deleting job:", err);
      setDeleting(false);
    }
  };

  // -------------------------------------------
  // Loading / 404 states
  // -------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="space-y-6">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <div className="flex flex-col items-center justify-center py-24">
          <h2 className="text-xl font-semibold text-gray-900">Job Not Found</h2>
          <p className="mt-2 text-sm text-gray-500">
            The job you are looking for does not exist or has been removed.
          </p>
          <Link href="/jobs" className="mt-4">
            <Button variant="outline">Return to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = statusStepIndex(job.status);
  const isCancelled = job.status === "cancelled";

  // -------------------------------------------
  // Render
  // -------------------------------------------
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          {job.trackingNumber && (
            <Badge color="gray">{job.trackingNumber}</Badge>
          )}
          <Badge color={statusBadgeColor(job.status)} dot>
            {statusLabel(job.status)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status progression buttons */}
          {job.status === "scheduled" && (
            <Button
              size="sm"
              variant="primary"
              disabled={saving}
              onClick={() => updateStatus("in_progress")}
            >
              <Play className="mr-1.5 h-4 w-4" />
              Start Job
            </Button>
          )}
          {job.status === "in_progress" && (
            <Button
              size="sm"
              variant="primary"
              disabled={saving}
              onClick={() => updateStatus("completed")}
            >
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Complete Job
            </Button>
          )}
          {(job.status === "scheduled" || job.status === "in_progress") && (
            <Button
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={() => updateStatus("cancelled")}
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
          )}

          {/* Edit / Delete */}
          {!editing ? (
            <Button size="sm" variant="outline" onClick={startEditing}>
              <Edit className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button size="sm" variant="primary" disabled={saving} isLoading={saving} onClick={saveEdits}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEditing}>
                Cancel
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* ---- Job Details Card ---- */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={editScheduledDate}
                        onChange={(e) => setEditScheduledDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Scheduled Time
                      </label>
                      <input
                        type="time"
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={editScheduledTime}
                        onChange={(e) => setEditScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Service
                      </label>
                      <p className="px-3 py-2 text-sm text-gray-500">
                        {job.service?.name ?? "None"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Zip
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={editZip}
                        onChange={(e) => setEditZip(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Internal Notes
                    </label>
                    <textarea
                      rows={2}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editInternalNotes}
                      onChange={(e) => setEditInternalNotes(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                    <dd className="mt-1 text-sm text-gray-900">{job.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Priority</dt>
                    <dd className="mt-1">
                      <Badge color={priorityBadgeColor(job.priority)}>
                        {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                      </Badge>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {job.description || <span className="text-gray-400">No description</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Scheduled Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(job.scheduledDate)}
                      {job.scheduledTime && (
                        <span className="ml-1 text-gray-500">{job.scheduledTime}</span>
                      )}
                      {job.scheduledEndTime && (
                        <span className="text-gray-500"> - {job.scheduledEndTime}</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estimated Duration</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.estimatedDuration
                        ? `${job.estimatedDuration} min`
                        : <span className="text-gray-400">Not set</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Service</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.service?.name ?? <span className="text-gray-400">None</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.assignedTo ? (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          {job.assignedTo.firstName} {job.assignedTo.lastName}
                        </span>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {job.address ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          {job.address}
                          {job.city && `, ${job.city}`}
                          {job.state && `, ${job.state}`}
                          {job.zip && ` ${job.zip}`}
                        </span>
                      ) : (
                        <span className="text-gray-400">No address</span>
                      )}
                    </dd>
                  </div>
                  {job.notes && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {job.notes}
                      </dd>
                    </div>
                  )}
                  {job.internalNotes && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Internal Notes</dt>
                      <dd className="mt-1 text-sm text-gray-700 whitespace-pre-wrap rounded-md bg-yellow-50 p-2 text-xs">
                        {job.internalNotes}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </CardContent>
          </Card>

          {/* ---- Line Items Card ---- */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              {job.lineItems.length === 0 ? (
                <p className="text-sm text-gray-400">No line items</p>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                        <th className="pb-2 pr-4">Item</th>
                        <th className="pb-2 pr-4">Description</th>
                        <th className="pb-2 pr-4 text-right">Qty</th>
                        <th className="pb-2 pr-4 text-right">Unit Price</th>
                        <th className="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.lineItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="py-2 pr-4 text-gray-500">
                            {item.description || "-"}
                          </td>
                          <td className="py-2 pr-4 text-right text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="py-2 pr-4 text-right text-gray-900">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-2 text-right font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-end border-t border-gray-200 pt-4">
                    <div className="w-48 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(
                            job.lineItems.reduce((sum, i) => sum + i.total, 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-1">
                        <span className="font-medium text-gray-900">Total</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(job.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-6">
          {/* ---- Client Info Card ---- */}
          <Card>
            <CardHeader>
              <CardTitle>Client Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-900">
                  <Link
                    href={`/clients/${job.client.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {job.client.firstName} {job.client.lastName}
                  </Link>
                </span>
              </div>
              {job.client.email && (
                <div className="text-gray-600">{job.client.email}</div>
              )}
              {job.client.phone && (
                <div className="text-gray-600">{job.client.phone}</div>
              )}
              {job.client.address && (
                <div className="flex items-start gap-1 text-gray-600">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {job.client.address}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ---- Status & Timeline Card ---- */}
          <Card>
            <CardHeader>
              <CardTitle>Status &amp; Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Visual status progression bar */}
              <div className="flex items-center gap-1">
                {STATUS_STEPS.map((step, idx) => {
                  const active = !isCancelled && idx <= currentStep;
                  return (
                    <div key={step} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className={`h-2 w-full rounded-full ${
                          active ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          active ? "font-medium text-blue-700" : "text-gray-400"
                        }`}
                      >
                        {statusLabel(step)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {isCancelled && (
                <div className="rounded-md bg-red-50 p-2 text-center text-xs font-medium text-red-700">
                  This job has been cancelled
                </div>
              )}

              {/* Timeline details */}
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Created</dt>
                  <dd className="text-gray-900">{formatDate(job.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Last Updated</dt>
                  <dd className="text-gray-900">{formatDate(job.updatedAt)}</dd>
                </div>
                {job.timeEntries.length > 0 && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <dt className="mb-2 flex items-center gap-1 text-xs font-medium uppercase text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      Time Entries
                    </dt>
                    {job.timeEntries.map((entry) => (
                      <dd
                        key={entry.id}
                        className="mb-1 flex justify-between text-xs text-gray-600"
                      >
                        <span>
                          {formatDate(entry.clockIn)}
                          {entry.clockOut && ` - ${formatDate(entry.clockOut)}`}
                        </span>
                        {entry.duration != null && (
                          <span className="font-medium">
                            {Math.round(entry.duration)} min
                          </span>
                        )}
                      </dd>
                    ))}
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* ---- Invoice Link Card ---- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-gray-400" />
                Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.invoice ? (
                <div className="flex items-center justify-between">
                  <Link
                    href={`/invoices/${job.invoice.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {job.invoice.invoiceNumber}
                  </Link>
                  <Badge
                    color={
                      job.invoice.status === "paid"
                        ? "green"
                        : job.invoice.status === "overdue"
                          ? "red"
                          : "blue"
                    }
                    dot
                  >
                    {job.invoice.status.charAt(0).toUpperCase() +
                      job.invoice.status.slice(1)}
                  </Badge>
                </div>
              ) : job.status === "completed" ? (
                <Link href={`/invoices/new?jobId=${job.id}`}>
                  <Button size="sm" variant="primary" className="w-full">
                    <FileText className="mr-1.5 h-4 w-4" />
                    Create Invoice
                  </Button>
                </Link>
              ) : (
                <p className="text-sm text-gray-400">
                  No invoice yet. Complete the job to create one.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Job"
        description="Are you sure you want to delete this job? This action cannot be undone."
        size="sm"
      >
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleting}
            onClick={deleteJob}
          >
            Delete Job
          </Button>
        </div>
      </Modal>
    </div>
  );
}
