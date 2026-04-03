"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, MoreHorizontal, Eye, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string | null;
  sentAt: string | null;
  createdAt: string;
  client: Client;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
] as const;

const STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  draft: "gray",
  sent: "blue",
  viewed: "yellow",
  paid: "green",
  overdue: "red",
};

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchInvoices = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (activeTab !== "all") params.set("status", activeTab);

        const res = await fetch(`/api/invoices?${params}`);
        if (!res.ok) throw new Error("Failed to fetch invoices");

        const data = await res.json();
        setInvoices(data.invoices);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  function handleTabChange(value: string) {
    setActiveTab(value);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all customer invoices
          </p>
        </div>
        <Button onClick={() => router.push("/invoices/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices found"
          description={
            activeTab === "all"
              ? "Create your first invoice to start getting paid."
              : `No ${activeTab} invoices at the moment.`
          }
          action={
            activeTab === "all"
              ? {
                  label: "Create Invoice",
                  onClick: () => router.push("/invoices/new"),
                }
              : undefined
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    {invoice.client.firstName} {invoice.client.lastName}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={STATUS_BADGE_COLOR[invoice.status] || "gray"}
                      dot
                    >
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invoice.dueDate
                      ? formatDate(invoice.dueDate)
                      : "\u2014"}
                  </TableCell>
                  <TableCell>
                    {invoice.sentAt
                      ? formatDate(invoice.sentAt)
                      : "\u2014"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === invoice.id ? null : invoice.id
                          )
                        }
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenuId === invoice.id && (
                        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              router.push(`/invoices/${invoice.id}`);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          {invoice.status === "draft" && (
                            <button
                              onClick={() => setOpenMenuId(null)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Send className="h-4 w-4" />
                              Send
                            </button>
                          )}
                          {invoice.status === "draft" && (
                            <button
                              onClick={() => setOpenMenuId(null)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} invoices
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchInvoices(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchInvoices(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
