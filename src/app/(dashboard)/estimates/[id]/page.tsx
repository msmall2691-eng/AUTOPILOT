"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface LineItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Estimate {
  id: string;
  estimateNumber: string;
  status: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  validUntil: string | null;
  notes: string | null;
  sentAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  lineItems: LineItem[];
}

const STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  draft: "gray",
  sent: "blue",
  accepted: "green",
  declined: "red",
  expired: "gray",
};

export default function EstimateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const fetchEstimate = useCallback(async () => {
    try {
      const res = await fetch(`/api/estimates/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch estimate");
      const data = await res.json();
      setEstimate(data.estimate);
    } catch (err) {
      console.error("Error fetching estimate:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  async function handleStatusChange(newStatus: string) {
    setActionLoading(newStatus);
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      setEstimate(data.estimate);
    } catch (err) {
      console.error("Error updating estimate status:", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleConvertToInvoice() {
    setConverting(true);
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "convert_to_invoice" }),
      });
      if (!res.ok) throw new Error("Failed to convert estimate to invoice");
      const data = await res.json();
      router.push(`/invoices/${data.invoice.id}`);
    } catch (err) {
      console.error("Error converting estimate to invoice:", err);
      setConverting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this estimate?")) return;
    setActionLoading("delete");
    try {
      const res = await fetch(`/api/estimates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete estimate");
      router.push("/estimates");
    } catch (err) {
      console.error("Error deleting estimate:", err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (notFound || !estimate) {
    return (
      <div className="space-y-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Estimate not found
        </h2>
        <p className="text-sm text-gray-500">
          The estimate you are looking for does not exist or has been removed.
        </p>
        <Button variant="outline" onClick={() => router.push("/estimates")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Estimates
        </Button>
      </div>
    );
  }

  const statusLabel =
    estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/estimates")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {estimate.estimateNumber}
              </h1>
              <Badge color={STATUS_BADGE_COLOR[estimate.status] || "gray"} dot>
                {statusLabel}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDate(estimate.createdAt)} by{" "}
              {estimate.createdBy.firstName} {estimate.createdBy.lastName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {estimate.status === "accepted" && (
            <Button
              size="sm"
              onClick={handleConvertToInvoice}
              isLoading={converting}
            >
              <FileText className="mr-1 h-4 w-4" />
              Convert to Invoice
            </Button>
          )}
          {estimate.status === "draft" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("sent")}
              isLoading={actionLoading === "sent"}
            >
              <Send className="mr-1 h-4 w-4" />
              Send
            </Button>
          )}
          {estimate.status === "sent" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusChange("accepted")}
                isLoading={actionLoading === "accepted"}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Mark Accepted
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("declined")}
                isLoading={actionLoading === "declined"}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Mark Declined
              </Button>
            </>
          )}
          {estimate.status === "draft" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/estimates/${id}/edit`)}
              >
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={actionLoading === "delete"}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Estimate Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Estimate Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Estimate Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {estimate.estimateNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <Badge
                      color={STATUS_BADGE_COLOR[estimate.status] || "gray"}
                      dot
                    >
                      {statusLabel}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(estimate.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sent</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {estimate.sentAt ? formatDate(estimate.sentAt) : "\u2014"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Valid Until
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {estimate.validUntil
                      ? formatDate(estimate.validUntil)
                      : "\u2014"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Responded
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {estimate.respondedAt
                      ? formatDate(estimate.respondedAt)
                      : "\u2014"}
                  </dd>
                </div>
              </dl>
              {estimate.notes && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                    {estimate.notes}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="px-6 py-3 font-medium">Item</th>
                    <th className="px-6 py-3 font-medium">Qty</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.lineItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-gray-500">{item.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-gray-100 px-6 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    {formatCurrency(estimate.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Tax ({estimate.taxRate}%)
                  </span>
                  <span className="text-gray-900">
                    {formatCurrency(estimate.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">
                    {formatCurrency(estimate.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Link
                  href={`/clients/${estimate.client.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {estimate.client.firstName} {estimate.client.lastName}
                </Link>
              </div>
              {estimate.client.email && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">Email</dt>
                  <dd className="mt-0.5 text-sm text-gray-900">
                    {estimate.client.email}
                  </dd>
                </div>
              )}
              {estimate.client.phone && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">Phone</dt>
                  <dd className="mt-0.5 text-sm text-gray-900">
                    {estimate.client.phone}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
