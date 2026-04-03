"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function formatPercent(n: number) {
  return `${n.toFixed(1)}%`;
}

function getMarginColor(margin: number): {
  bg: string;
  text: string;
  label: string;
} {
  if (margin < 30) {
    return {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      label: "Low Margin",
    };
  }
  if (margin < 50) {
    return {
      bg: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-700",
      label: "Moderate Margin",
    };
  }
  return {
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
    label: "Healthy Margin",
  };
}

export default function COGSCalculatorPage() {
  const [labor, setLabor] = useState("");
  const [materials, setMaterials] = useState("");
  const [dumpFees, setDumpFees] = useState("");
  const [fuel, setFuel] = useState("");
  const [equipment, setEquipment] = useState("");
  const [other, setOther] = useState("");
  const [revenue, setRevenue] = useState("");
  const [result, setResult] = useState<{
    totalCOGS: number;
    grossProfit: number;
    profitMargin: number;
  } | null>(null);

  const handleCalculate = () => {
    const totalCOGS =
      (parseFloat(labor) || 0) +
      (parseFloat(materials) || 0) +
      (parseFloat(dumpFees) || 0) +
      (parseFloat(fuel) || 0) +
      (parseFloat(equipment) || 0) +
      (parseFloat(other) || 0);

    const rev = parseFloat(revenue) || 0;
    const grossProfit = rev - totalCOGS;
    const profitMargin = rev > 0 ? (grossProfit / rev) * 100 : 0;

    setResult({
      totalCOGS: Math.round(totalCOGS * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 10) / 10,
    });
  };

  const marginStyle = result ? getMarginColor(result.profitMargin) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-4 sm:px-6 lg:px-8">
          <Link
            href="/tools"
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            All Tools
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-medium text-gray-900">
            COGS Calculator
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cost of Goods Sold Calculator
        </h1>
        <p className="text-gray-600 mb-8">
          Calculate your COGS, gross profit, and profit margin. Know your
          numbers so you can price jobs right and grow your business.
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Costs Input */}
          <Card>
            <CardHeader>
              <CardTitle>Job Costs (COGS)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Labor Cost ($)"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={labor}
                  onChange={(e) => setLabor(e.target.value)}
                />
                <Input
                  label="Material Cost ($)"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                />
                <Input
                  label="Dump Fees ($)"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={dumpFees}
                  onChange={(e) => setDumpFees(e.target.value)}
                />
                <Input
                  label="Fuel Cost ($)"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                />
                <Input
                  label="Equipment Cost ($)"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                />
                <Input
                  label="Other Costs ($)"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Revenue + Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  label="Total Revenue / Job Price ($)"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                />
                <Button
                  size="lg"
                  className="w-full mt-4"
                  onClick={handleCalculate}
                >
                  Calculate
                </Button>
              </CardContent>
            </Card>

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Total COGS */}
                    <div className="rounded-lg bg-gray-100 p-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Total COGS
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(result.totalCOGS)}
                      </p>
                    </div>

                    {/* Gross Profit */}
                    <div className="rounded-lg bg-gray-100 p-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Gross Profit
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          result.grossProfit >= 0
                            ? "text-gray-900"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(result.grossProfit)}
                      </p>
                    </div>

                    {/* Profit Margin */}
                    {marginStyle && (
                      <div
                        className={`rounded-lg border p-4 ${marginStyle.bg}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p
                            className={`text-sm font-medium ${marginStyle.text}`}
                          >
                            Profit Margin
                          </p>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${marginStyle.text} ${marginStyle.bg}`}
                          >
                            {marginStyle.label}
                          </span>
                        </div>
                        <p className={`text-3xl font-bold ${marginStyle.text}`}>
                          {formatPercent(result.profitMargin)}
                        </p>

                        {/* Margin bar */}
                        <div className="mt-3 h-3 w-full rounded-full bg-white/60 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              result.profitMargin < 30
                                ? "bg-red-500"
                                : result.profitMargin < 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(Math.max(result.profitMargin, 0), 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>0%</span>
                          <span>30%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-blue-600 px-8 py-10 text-center text-white">
          <h2 className="text-xl font-bold sm:text-2xl">
            Want more tools? Try Autopilot free for 14 days
          </h2>
          <p className="mt-2 text-blue-100 text-sm max-w-lg mx-auto">
            Track job costs, send invoices, and see your profitability in
            real-time with Autopilot.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </main>
    </div>
  );
}
