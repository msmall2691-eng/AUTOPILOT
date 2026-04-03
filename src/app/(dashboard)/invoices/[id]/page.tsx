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

interface Payment {
  id: string;
  amount: number;
  method: string;
  notes: string | null;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  tipAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string | null;
  paidAt: string | null;
  sentAt: string | null;
  notes: string | null;
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
  job: {
    id: string;
    title: string;
    trackingNumber: string;
  } | null;
  lineItems: LineItem[];
  payments: Payment[];
}

const STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  draft: "gray",
  sent: "blue",
  paid: "green",
  overdue: "red",
  partial: "yellow",
  void: "gray",
};

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch invoice");
      const data = await res.json();
      setInvoice(data.invoice);
    } catch (err) {
      console.error("Error fetching invoice:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  async function handleStatusChange(newStatus: string) {
    setActionLoading(newStatus);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      setInvoice(data.invoice);
    } catch (err) {
      console.error("Error updating invoice status:", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setActionLoading("delete");
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete invoice");
      router.push("/invoices");
    } catch (err) {
      console.error("Error deleting invoice:", err);
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

  if (notFound || !invoice) {
    return (
      <div className="space-y-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Invoice not found
        </h2>
        <p className="text-sm text-gray-500">
          The invoice you are looking for does not exist or has been removed.
        </p>
        <Button variant="outline" onClick={() => router.push("/invoices")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>
    );
  }

  const statusLabel =
    invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/invoices")}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {invoice.invoiceNumber}
              </h1>
              <Badge color={STATUS_BADGE_COLOR[invoice.status] || "gray"} dot>
                {statusLabel}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDate(invoice.createdAt)} by{" "}
              {invoice.createdBy.firstName} {invoice.createdBy.lastName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {invoice.status === "draft" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("sent")}
              isLoading={actionLoading === "sent"}
            >
              <Send className="mr-1 h-4 w-4" />
              Send
            </Button>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("paid")}
              isLoading={actionLoading === "paid"}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Mark Paid
            </Button>
          )}
          {invoice.status !== "paid" && invoice.status !== "void" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("void")}
              isLoading={actionLoading === "void"}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Cancel
            </Button>
          )}
          {invoice.status === "draft" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/invoices/${id}/edit`)}
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
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Invoice Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {invoice.invoiceNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <Badge
                      color={STATUS_BADGE_COLOR[invoice.status] || "gray"}
                      dot
                    >
                      {statusLabel}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(invoice.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sent</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {invoice.sentAt ? formatDate(invoice.sentAt) : "\u2014"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {invoice.dueDate ? formatDate(invoice.dueDate) : "\u2014"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Paid</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {invoice.paidAt ? formatDate(invoice.paidAt) : "\u2014"}
                  </dd>
                </div>
              </dl>
              {invoice.notes && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                    {invoice.notes}
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
                  {invoice.lineItems.map((item) => (
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
                    {formatCurrency(invoice.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Tax ({invoice.taxRate}%)
                  </span>
                  <span className="text-gray-900">
                    {formatCurrency(invoice.taxAmount)}
                  </span>
                </div>
                {invoice.tipAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tip</span>
                    <span className="text-gray-900">
                      {formatCurrency(invoice.tipAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">
                    {formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payment.method.charAt(0).toUpperCase() +
                          payment.method.slice(1)}{" "}
                        &middot; {formatDate(payment.createdAt)}
                      </p>
                      {payment.notes && (
                        <p className="mt-1 text-xs text-gray-500">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
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
                  href={`/clients/${invoice.client.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {invoice.client.firstName} {invoice.client.lastName}
                </Link>
              </div>
              {invoice.client.email && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">Email</dt>
                  <dd className="mt-0.5 text-sm text-gray-900">
                    {invoice.client.email}
                  </dd>
                </div>
              )}
              {invoice.client.phone && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">Phone</dt>
                  <dd className="mt-0.5 text-sm text-gray-900">
                    {invoice.client.phone}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Job */}
          {invoice.job && (
            <Card>
              <CardHeader>
                <CardTitle>Related Job</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/jobs/${invoice.job.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {invoice.job.title}
                </Link>
                <p className="mt-1 text-xs text-gray-500">
                  {invoice.job.trackingNumber}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
