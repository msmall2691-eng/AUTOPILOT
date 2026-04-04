"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Save,
  X,
  Briefcase,
  DollarSign,
  FileText,
  ClipboardList,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  status: string;
  scheduledDate: string | null;
  totalAmount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  source: string | null;
  tags: string[];
  notes: string | null;
  status: string;
  totalSpent: number;
  jobCount: number;
  jobs: Job[];
  invoices: Invoice[];
  _count: {
    jobs: number;
    invoices: number;
    estimates: number;
  };
}

interface EditForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  source: string;
  tags: string;
  notes: string;
  status: string;
}

const STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  lead: "yellow",
  active: "green",
  inactive: "gray",
};

const JOB_STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  pending: "yellow",
  scheduled: "blue",
  "in-progress": "purple",
  "in_progress": "purple",
  "on-hold": "yellow",
  "on_hold": "yellow",
  completed: "green",
  cancelled: "red",
};

const INVOICE_STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  draft: "gray",
  sent: "blue",
  paid: "green",
  overdue: "red",
  partial: "yellow",
  void: "gray",
};

const SOURCE_OPTIONS = [
  { value: "", label: "Select source" },
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "google", label: "Google" },
  { value: "social_media", label: "Social Media" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/[_-]/g, " ");
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState<EditForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    source: "",
    tags: "",
    notes: "",
    status: "",
  });

  const fetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch client");
      const data = await res.json();
      setClient(data.client);
    } catch (err) {
      console.error("Error fetching client:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  useEffect(() => {
    if (client) {
      setForm({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        city: client.city || "",
        state: client.state || "",
        zip: client.zip || "",
        source: client.source || "",
        tags: Array.isArray(client.tags) ? client.tags.join(", ") : "",
        notes: client.notes || "",
        status: client.status,
      });
    }
  }, [client]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (client) {
      setForm({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        city: client.city || "",
        state: client.state || "",
        zip: client.zip || "",
        source: client.source || "",
        tags: Array.isArray(client.tags) ? client.tags.join(", ") : "",
        notes: client.notes || "",
        status: client.status,
      });
    }
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        zip: form.zip || null,
        source: form.source || null,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        notes: form.notes || null,
        status: form.status,
      };

      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update client");

      const data = await res.json();
      setClient(data.client);
      setEditing(false);
    } catch (err) {
      console.error("Error updating client:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete client");
      router.push("/clients");
    } catch (err) {
      console.error("Error deleting client:", err);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const updateField = (field: keyof EditForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  // 404 state
  if (notFound || !client) {
    return (
      <div className="space-y-6">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-xl font-semibold text-gray-900">
            Client Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            The client you are looking for does not exist or has been removed.
          </p>
          <Link href="/clients" className="mt-4">
            <Button variant="outline">Return to Clients</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/clients"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {client.firstName} {client.lastName}
              </h1>
              <Badge
                color={STATUS_BADGE_COLOR[client.status] || "gray"}
                dot
              >
                {capitalize(client.status)}
              </Badge>
            </div>
            {client.email && (
              <p className="mt-0.5 text-sm text-gray-500">{client.email}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                <X className="mr-1.5 h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} isLoading={saving}>
                <Save className="mr-1.5 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="text-xl font-semibold text-gray-900">
                {client._count.jobs}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(client.totalSpent)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Invoices</p>
              <p className="text-xl font-semibold text-gray-900">
                {client._count.invoices}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <ClipboardList className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimates</p>
              <p className="text-xl font-semibold text-gray-900">
                {client._count.estimates}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Address"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
              <Input
                label="City"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="State"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
                <Input
                  label="Zip"
                  value={form.zip}
                  onChange={(e) => updateField("zip", e.target.value)}
                />
              </div>
              <Select
                label="Source"
                value={form.source}
                onChange={(e) => updateField("source", e.target.value)}
                options={SOURCE_OPTIONS}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                options={STATUS_OPTIONS}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Tags"
                  value={form.tags}
                  onChange={(e) => updateField("tags", e.target.value)}
                  hint="Comma-separated tags"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">
                      {client.email || "--"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">
                      {client.phone || "--"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">
                      {client.address || client.city || client.state
                        ? [
                            client.address,
                            [client.city, client.state, client.zip]
                              .filter(Boolean)
                              .join(", "),
                          ]
                            .filter(Boolean)
                            .join("\n")
                        : "--"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Source</p>
                  <p className="text-sm text-gray-900 capitalize">
                    {client.source || "--"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tags</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {client.tags && client.tags.length > 0 ? (
                      client.tags.map((tag) => (
                        <Badge key={tag} color="blue">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-900">--</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {client.notes || "--"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Jobs</CardTitle>
          <Link href={`/jobs?clientId=${client.id}`}>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {client.jobs && client.jobs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {job.title}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {job.scheduledDate
                        ? formatDate(job.scheduledDate)
                        : "--"}
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        color={
                          JOB_STATUS_BADGE_COLOR[
                            job.status.toLowerCase().replace(/\s+/g, "-")
                          ] || "gray"
                        }
                        dot
                      >
                        {capitalize(job.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(job.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No jobs yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Invoices</CardTitle>
          <Link href={`/invoices?clientId=${client.id}`}>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {client.invoices && client.invoices.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                  >
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        color={
                          INVOICE_STATUS_BADGE_COLOR[
                            invoice.status.toLowerCase()
                          ] || "gray"
                        }
                        dot
                      >
                        {capitalize(invoice.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-gray-900">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No invoices yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
        size="sm"
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={deleting}
          >
            Delete Client
          </Button>
        </div>
      </Modal>
    </div>
  );
}
