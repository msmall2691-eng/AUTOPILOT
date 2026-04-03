"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

const unitOptions = [
  { value: "feet", label: "Feet" },
  { value: "inches", label: "Inches" },
  { value: "yards", label: "Yards" },
];

function toFeet(value: number, unit: string): number {
  switch (unit) {
    case "inches":
      return value / 12;
    case "yards":
      return value * 3;
    default:
      return value;
  }
}

export default function CubicYardCalculatorPage() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lengthUnit, setLengthUnit] = useState("feet");
  const [widthUnit, setWidthUnit] = useState("feet");
  const [heightUnit, setHeightUnit] = useState("feet");
  const [result, setResult] = useState<{
    cubicFeet: number;
    cubicYards: number;
  } | null>(null);

  const handleCalculate = () => {
    const l = toFeet(parseFloat(length) || 0, lengthUnit);
    const w = toFeet(parseFloat(width) || 0, widthUnit);
    const h = toFeet(parseFloat(height) || 0, heightUnit);

    const cubicFeet = l * w * h;
    const cubicYards = cubicFeet / 27;

    setResult({
      cubicFeet: Math.round(cubicFeet * 100) / 100,
      cubicYards: Math.round(cubicYards * 100) / 100,
    });
  };

  const lFeet = toFeet(parseFloat(length) || 0, lengthUnit);
  const wFeet = toFeet(parseFloat(width) || 0, widthUnit);
  const hFeet = toFeet(parseFloat(height) || 0, heightUnit);

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
            Cubic Yard Calculator
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cubic Yard Calculator
        </h1>
        <p className="text-gray-600 mb-8">
          Calculate cubic yards from length, width, and height. Perfect for junk
          removal, landscaping, hauling, and concrete estimates.
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Dimensions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      label="Length"
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                  </div>
                  <div className="w-28">
                    <Select
                      label="Unit"
                      options={unitOptions}
                      value={lengthUnit}
                      onChange={(e) => setLengthUnit(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      label="Width"
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                    />
                  </div>
                  <div className="w-28">
                    <Select
                      label="Unit"
                      options={unitOptions}
                      value={widthUnit}
                      onChange={(e) => setWidthUnit(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      label="Height"
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                  <div className="w-28">
                    <Select
                      label="Unit"
                      options={unitOptions}
                      value={heightUnit}
                      onChange={(e) => setHeightUnit(e.target.value)}
                    />
                  </div>
                </div>
                <Button size="lg" className="w-full mt-2" onClick={handleCalculate}>
                  Calculate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result / Visual */}
          <div className="space-y-6">
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <p className="text-sm font-medium text-blue-600 mb-1">
                        Cubic Yards
                      </p>
                      <p className="text-3xl font-bold text-blue-700">
                        {result.cubicYards}
                      </p>
                      <p className="text-xs text-blue-500 mt-1">yd&sup3;</p>
                    </div>
                    <div className="rounded-lg bg-gray-100 p-4 text-center">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Cubic Feet
                      </p>
                      <p className="text-3xl font-bold text-gray-800">
                        {result.cubicFeet}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">ft&sup3;</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3D Box Visual */}
            <Card>
              <CardHeader>
                <CardTitle>Visual Representation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <svg
                    viewBox="0 0 200 180"
                    width="240"
                    height="216"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* 3D box using isometric projection */}
                    {/* Front face */}
                    <polygon
                      points="40,130 120,130 120,60 40,60"
                      fill="#dbeafe"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                    {/* Top face */}
                    <polygon
                      points="40,60 120,60 160,35 80,35"
                      fill="#bfdbfe"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                    {/* Right face */}
                    <polygon
                      points="120,60 160,35 160,105 120,130"
                      fill="#93c5fd"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />

                    {/* Dimension labels */}
                    {/* Length (bottom) */}
                    <line
                      x1="40"
                      y1="142"
                      x2="120"
                      y2="142"
                      stroke="#6b7280"
                      strokeWidth="1"
                      markerEnd="url(#arrow)"
                      markerStart="url(#arrowRev)"
                    />
                    <text
                      x="80"
                      y="156"
                      textAnchor="middle"
                      className="text-xs"
                      fill="#374151"
                      fontSize="11"
                    >
                      {lFeet ? `${lFeet.toFixed(1)} ft` : "Length"}
                    </text>

                    {/* Height (left) */}
                    <line
                      x1="30"
                      y1="60"
                      x2="30"
                      y2="130"
                      stroke="#6b7280"
                      strokeWidth="1"
                    />
                    <text
                      x="18"
                      y="100"
                      textAnchor="middle"
                      className="text-xs"
                      fill="#374151"
                      fontSize="11"
                      transform="rotate(-90, 18, 100)"
                    >
                      {hFeet ? `${hFeet.toFixed(1)} ft` : "Height"}
                    </text>

                    {/* Width (top-right) */}
                    <text
                      x="148"
                      y="28"
                      textAnchor="middle"
                      className="text-xs"
                      fill="#374151"
                      fontSize="11"
                    >
                      {wFeet ? `${wFeet.toFixed(1)} ft` : "Width"}
                    </text>

                    {/* Arrow markers */}
                    <defs>
                      <marker
                        id="arrow"
                        markerWidth="6"
                        markerHeight="6"
                        refX="5"
                        refY="3"
                        orient="auto"
                      >
                        <path d="M0,0 L6,3 L0,6" fill="#6b7280" />
                      </marker>
                      <marker
                        id="arrowRev"
                        markerWidth="6"
                        markerHeight="6"
                        refX="1"
                        refY="3"
                        orient="auto"
                      >
                        <path d="M6,0 L0,3 L6,6" fill="#6b7280" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conversions Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Common Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 pr-4 text-left font-semibold text-gray-600">
                      Cubic Yards
                    </th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-600">
                      Cubic Feet
                    </th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-600">
                      Cubic Meters
                    </th>
                    <th className="py-2 pl-4 text-left font-semibold text-gray-600">
                      Common Use
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 font-medium">1</td>
                    <td className="py-2.5 px-4">27</td>
                    <td className="py-2.5 px-4">0.76</td>
                    <td className="py-2.5 pl-4">Small pickup truck load</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 font-medium">3</td>
                    <td className="py-2.5 px-4">81</td>
                    <td className="py-2.5 px-4">2.29</td>
                    <td className="py-2.5 pl-4">Standard pickup truck load</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 font-medium">5</td>
                    <td className="py-2.5 px-4">135</td>
                    <td className="py-2.5 px-4">3.82</td>
                    <td className="py-2.5 pl-4">Small dumpster / trailer</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 font-medium">10</td>
                    <td className="py-2.5 px-4">270</td>
                    <td className="py-2.5 px-4">7.65</td>
                    <td className="py-2.5 pl-4">10-yard dumpster</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 font-medium">15</td>
                    <td className="py-2.5 px-4">405</td>
                    <td className="py-2.5 px-4">11.47</td>
                    <td className="py-2.5 pl-4">15-yard dumpster</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">20</td>
                    <td className="py-2.5 px-4">540</td>
                    <td className="py-2.5 px-4">15.29</td>
                    <td className="py-2.5 pl-4">20-yard dumpster</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-blue-600 px-8 py-10 text-center text-white">
          <h2 className="text-xl font-bold sm:text-2xl">
            Want more tools? Try Autopilot free for 14 days
          </h2>
          <p className="mt-2 text-blue-100 text-sm max-w-lg mx-auto">
            Estimate jobs, schedule crews, and invoice customers — all from one
            platform built for junk removal and hauling businesses.
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
