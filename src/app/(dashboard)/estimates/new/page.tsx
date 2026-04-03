"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

interface ClientOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

interface LineItem {
  key: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

function createLineItem(): LineItem {
  return {
    key: crypto.randomUUID(),
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
}

export default function NewEstimatePage() {
  const router = useRouter();

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([createLineItem()]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients?limit=100");
      if (!res.ok) return;
      const data = await res.json();
      setClients(data.clients ?? []);
    } catch {
      // silently fail; client dropdown will be empty
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Auto-calculations
  const subtotal = useMemo(
    () =>
      Math.round(
        lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) *
          100
      ) / 100,
    [lineItems]
  );

  const taxAmount = useMemo(
    () => Math.round(subtotal * (taxRate / 100) * 100) / 100,
    [subtotal, taxRate]
  );

  const total = useMemo(
    () => Math.round((subtotal + taxAmount) * 100) / 100,
    [subtotal, taxAmount]
  );

  function updateLineItem(key: string, field: keyof LineItem, value: string | number) {
    setLineItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, createLineItem()]);
  }

  function removeLineItem(key: string) {
    setLineItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.key !== key);
    });
  }

  async function handleSubmit(sendImmediately: boolean) {
    setError(null);

    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    const validItems = lineItems.filter((item) => item.name.trim() !== "");
    if (validItems.length === 0) {
      setError("Please add at least one line item with a name.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          validUntil: validUntil || null,
          taxRate,
          notes: notes || null,
          status: sendImmediately ? "sent" : "draft",
          lineItems: validItems.map(({ name, description, quantity, unitPrice }) => ({
            name,
            description: description || null,
            quantity,
            unitPrice,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create estimate");
      }

      router.push("/estimates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/estimates")}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Estimate</h1>
          <p className="mt-1 text-sm text-gray-500">
            Prepare a detailed estimate to send to your client
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Client & Details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Estimate Details
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Select
            label="Client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
                {c.email ? ` (${c.email})` : ""}
              </option>
            ))}
          </Select>

          <Input
            label="Estimate Number"
            value="Auto-generated"
            disabled
            hint="Generated automatically on save"
          />

          <Input
            label="Valid Until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />

          <Input
            label="Tax Rate (%)"
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Line Items</h2>
          <Button variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {/* Header row */}
          <div className="hidden grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1" />
          </div>

          {lineItems.map((item) => (
            <div
              key={item.key}
              className="grid grid-cols-1 gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 sm:grid-cols-12 sm:items-start sm:border-0 sm:bg-transparent sm:p-0"
            >
              <div className="sm:col-span-3">
                <Input
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) =>
                    updateLineItem(item.key, "name", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  placeholder="Description (optional)"
                  value={item.description}
                  onChange={(e) =>
                    updateLineItem(item.key, "description", e.target.value)
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    updateLineItem(
                      item.key,
                      "quantity",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateLineItem(
                      item.key,
                      "unitPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between sm:col-span-1">
                <span className="text-sm font-medium text-gray-700 sm:ml-auto">
                  {formatCurrency(
                    Math.round(item.quantity * item.unitPrice * 100) / 100
                  )}
                </span>
              </div>
              <div className="flex items-center sm:col-span-1">
                <button
                  type="button"
                  onClick={() => removeLineItem(item.key)}
                  disabled={lineItems.length <= 1}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax ({taxRate}%)</span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <Textarea
          label="Notes"
          placeholder="Add any notes, terms, or conditions for the client..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/estimates")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleSubmit(false)}
          isLoading={submitting}
          disabled={submitting}
        >
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit(true)}
          isLoading={submitting}
          disabled={submitting}
        >
          Send to Client
        </Button>
      </div>
    </div>
  );
}
