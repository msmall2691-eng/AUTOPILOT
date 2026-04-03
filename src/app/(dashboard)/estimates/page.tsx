"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ClipboardList, MoreHorizontal, Eye, Send, Trash2 } from "lucide-react";
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

interface Estimate {
  id: string;
  estimateNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  validUntil: string | null;
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
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
] as const;

const STATUS_BADGE_COLOR: Record<string, BadgeColor> = {
  draft: "gray",
  sent: "blue",
  viewed: "yellow",
  accepted: "green",
  declined: "red",
  expired: "gray",
};

export default function EstimatesPage() {
  const router = useRouter();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchEstimates = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (activeTab !== "all") params.set("status", activeTab);

        const res = await fetch(`/api/estimates?${params}`);
        if (!res.ok) throw new Error("Failed to fetch estimates");

        const data = await res.json();
        setEstimates(data.estimates);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error fetching estimates:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  function handleTabChange(value: string) {
    setActiveTab(value);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estimates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage project estimates for clients
          </p>
        </div>
        <Button onClick={() => router.push("/estimates/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Estimate
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
      ) : estimates.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No estimates found"
          description={
            activeTab === "all"
              ? "Create your first estimate to send to a client."
              : `No ${activeTab} estimates at the moment.`
          }
          action={
            activeTab === "all"
              ? {
                  label: "Create Estimate",
                  onClick: () => router.push("/estimates/new"),
                }
              : undefined
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-medium text-gray-900">
                    {estimate.estimateNumber}
                  </TableCell>
                  <TableCell>
                    {estimate.client.firstName} {estimate.client.lastName}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(estimate.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={STATUS_BADGE_COLOR[estimate.status] || "gray"}
                      dot
                    >
                      {estimate.status.charAt(0).toUpperCase() +
                        estimate.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {estimate.validUntil
                      ? formatDate(estimate.validUntil)
                      : "\u2014"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === estimate.id ? null : estimate.id
                          )
                        }
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenuId === estimate.id && (
                        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              router.push(`/estimates/${estimate.id}`);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          {estimate.status === "draft" && (
                            <button
                              onClick={() => setOpenMenuId(null)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Send className="h-4 w-4" />
                              Send
                            </button>
                          )}
                          {estimate.status === "draft" && (
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
                of {pagination.total} estimates
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchEstimates(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchEstimates(pagination.page + 1)}
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
