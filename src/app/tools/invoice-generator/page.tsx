"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function InvoiceGeneratorPage() {
  const [companyName, setCompanyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [items, setItems] = useState<LineItem[]>([
    { id: generateId(), description: "", quantity: 1, rate: 0 },
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: generateId(), description: "", quantity: 1, rate: 0 },
    ]);

  const removeItem = (id: string) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((i) => i.id !== id)));

  const updateItem = (id: string, field: keyof LineItem, value: string | number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = subtotal + tax;

  const handleGenerate = () => {
    setShowPreview(true);
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handlePrint = () => {
    const content = previewRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice ${invoiceNumber}</title>
      <style>
        body{font-family:system-ui,sans-serif;margin:0;padding:40px;color:#111}
        table{width:100%;border-collapse:collapse}
        th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #e5e7eb}
        th{background:#f9fafb;font-weight:600;font-size:13px;text-transform:uppercase;color:#6b7280}
        .right{text-align:right}
        h1{margin:0;font-size:28px}
        .header{display:flex;justify-content:space-between;margin-bottom:40px}
        .meta{font-size:14px;color:#374151;line-height:1.8}
        .totals{margin-top:24px;display:flex;justify-content:flex-end}
        .totals table{width:280px}
        .totals td{border:none;padding:6px 12px;font-size:14px}
        .totals tr:last-child td{font-weight:700;font-size:16px;border-top:2px solid #111;padding-top:12px}
      </style></head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-4 sm:px-6 lg:px-8">
          <Link href="/tools" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            All Tools
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-medium text-gray-900">Invoice Generator</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Generator</h1>
        <p className="text-gray-600 mb-8">Create a professional invoice and preview it instantly. No account needed.</p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Your Company Name" placeholder="Acme Services LLC" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Input label="Client Name" placeholder="John Smith" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              <Input label="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
              <Input label="Tax Rate (%)" type="number" min={0} step={0.01} value={taxRate || ""} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} placeholder="0" />
              <Input label="Invoice Date" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 pr-3 text-left font-medium text-gray-600 w-2/5">Description</th>
                    <th className="py-2 px-3 text-left font-medium text-gray-600 w-24">Qty</th>
                    <th className="py-2 px-3 text-left font-medium text-gray-600 w-28">Rate ($)</th>
                    <th className="py-2 px-3 text-right font-medium text-gray-600 w-28">Amount</th>
                    <th className="py-2 pl-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2 pr-3">
                        <input
                          className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          placeholder="Service description"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min={0}
                          className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          value={item.rate || ""}
                          onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-gray-900">
                        {formatCurrency(item.quantity * item.rate)}
                      </td>
                      <td className="py-2 pl-3">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                          disabled={items.length === 1}
                          aria-label="Remove line item"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button variant="ghost" size="sm" className="mt-3" onClick={addItem}>
              + Add Line Item
            </Button>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({taxRate}%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button size="lg" onClick={handleGenerate}>
            Generate PDF Preview
          </Button>
        </div>

        {/* Invoice Preview */}
        {showPreview && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                Print / Save PDF
              </Button>
            </div>
            <Card>
              <CardContent className="p-8 sm:p-12" ref={previewRef}>
                {/* Preview Header */}
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{companyName || "Your Company"}</h2>
                  </div>
                  <div className="text-right">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">INVOICE</h1>
                    <p className="text-sm text-gray-600">{invoiceNumber}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Bill To</p>
                    <p className="text-gray-900 font-medium">{clientName || "Client Name"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-900">Date:</span>{" "}
                      {invoiceDate ? new Date(invoiceDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "---"}
                    </p>
                    {dueDate && (
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-900">Due:</span>{" "}
                        {new Date(dueDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm mb-8">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="py-2 text-left font-semibold text-gray-600 text-xs uppercase">Description</th>
                      <th className="py-2 text-right font-semibold text-gray-600 text-xs uppercase w-20">Qty</th>
                      <th className="py-2 text-right font-semibold text-gray-600 text-xs uppercase w-28">Rate</th>
                      <th className="py-2 text-right font-semibold text-gray-600 text-xs uppercase w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 text-gray-900">{item.description || "---"}</td>
                        <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                        <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.quantity * item.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-72">
                    <div className="flex justify-between py-1.5 text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
                    {taxRate > 0 && (
                      <div className="flex justify-between py-1.5 text-sm">
                        <span className="text-gray-600">Tax ({taxRate}%)</span>
                        <span className="text-gray-900">{formatCurrency(tax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t-2 border-gray-900 mt-1 text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-blue-600 px-8 py-10 text-center text-white">
          <h2 className="text-xl font-bold sm:text-2xl">Want more tools? Try Autopilot free for 14 days</h2>
          <p className="mt-2 text-blue-100 text-sm max-w-lg mx-auto">
            Send invoices, schedule jobs, and manage customers all in one place.
          </p>
          <Link href="/" className="mt-5 inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
            Start Free Trial
          </Link>
        </div>
      </main>
    </div>
  );
}
