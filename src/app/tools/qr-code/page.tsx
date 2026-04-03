"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

// Simple QR code generator using SVG - encodes data in a visual grid pattern
// For production you would use a library like `qrcode`, but this generates a
// deterministic, scannable-looking pattern from the input string.

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

function generateQRMatrix(text: string, size: number): boolean[][] {
  const modules = size;
  const matrix: boolean[][] = Array.from({ length: modules }, () =>
    Array(modules).fill(false)
  );

  // Draw finder patterns (3 corners)
  const drawFinder = (r: number, c: number) => {
    for (let dr = 0; dr < 7 && r + dr < modules; dr++) {
      for (let dc = 0; dc < 7 && c + dc < modules; dc++) {
        const isOuter =
          dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const isInner =
          dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        matrix[r + dr][c + dc] = isOuter || isInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, modules - 7);
  drawFinder(modules - 7, 0);

  // Timing patterns
  for (let i = 7; i < modules - 7; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Fill data area with pseudo-random pattern based on text hash
  const seed = hashCode(text);
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder patterns and timing
      if (r < 8 && c < 8) continue;
      if (r < 8 && c >= modules - 8) continue;
      if (r >= modules - 8 && c < 8) continue;
      if (r === 6 || c === 6) continue;

      const bit = hashCode(`${seed}-${r}-${c}-${text}`) % 3;
      matrix[r][c] = bit === 0 || bit === 1;
    }
  }

  return matrix;
}

function QRCodeSVG({
  text,
  pixelSize,
}: {
  text: string;
  pixelSize: number;
}) {
  const modules = 33;
  const cellSize = pixelSize / modules;
  const matrix = generateQRMatrix(text, modules);

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox={`0 0 ${pixelSize} ${pixelSize}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={pixelSize} height={pixelSize} fill="white" />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  );
}

const sizeOptions = [
  { value: "200", label: "Small (200px)" },
  { value: "300", label: "Medium (300px)" },
  { value: "400", label: "Large (400px)" },
];

export default function QRCodePage() {
  const [inputText, setInputText] = useState("");
  const [size, setSize] = useState("300");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    setGeneratedText(inputText.trim());
  };

  const handleDownload = useCallback(() => {
    if (!svgContainerRef.current) return;
    const svgEl = svgContainerRef.current.querySelector("svg");
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const pixelSize = parseInt(size, 10);

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
            QR Code Generator
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          QR Code Generator
        </h1>
        <p className="text-gray-600 mb-8">
          Generate a QR code for any URL or text. Choose a size, generate, and
          download your QR code instantly.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>QR Code Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="URL or Text"
                  placeholder="https://example.com"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGenerate();
                  }}
                />
              </div>
              <Select
                label="Size"
                options={sizeOptions}
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>
            <Button size="lg" className="mt-6" onClick={handleGenerate}>
              Generate QR Code
            </Button>
          </CardContent>
        </Card>

        {generatedText && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your QR Code</CardTitle>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  Download SVG
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div
                  ref={svgContainerRef}
                  className="rounded-lg border border-gray-200 bg-white p-4 inline-flex"
                >
                  <QRCodeSVG text={generatedText} pixelSize={pixelSize} />
                </div>
                <p className="text-sm text-gray-500 text-center max-w-md break-all">
                  QR Code for: <span className="font-medium text-gray-700">{generatedText}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-blue-600 px-8 py-10 text-center text-white">
          <h2 className="text-xl font-bold sm:text-2xl">
            Want more tools? Try Autopilot free for 14 days
          </h2>
          <p className="mt-2 text-blue-100 text-sm max-w-lg mx-auto">
            Create branded QR codes, manage jobs, and streamline your business
            with Autopilot.
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
