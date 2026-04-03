import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Business Tools | Autopilot",
  description:
    "Free tools for field service and home service businesses. Invoice generator, QR codes, calculators, and more.",
};

const tools = [
  {
    name: "Invoice Generator",
    description:
      "Create professional invoices in seconds. Add line items, tax, and generate a printable PDF layout.",
    href: "/tools/invoice-generator",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    name: "QR Code Generator",
    description:
      "Generate QR codes for any URL or text. Choose your size and download the result instantly.",
    href: "/tools/qr-code",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
      </svg>
    ),
  },
  {
    name: "Cubic Yard Calculator",
    description:
      "Calculate cubic yards from length, width, and height. Perfect for junk removal, landscaping, and hauling jobs.",
    href: "/tools/cubic-yard-calculator",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    name: "COGS Calculator",
    description:
      "Calculate your Cost of Goods Sold, gross profit, and profit margin. Know your numbers and price jobs right.",
    href: "/tools/cogs-calculator",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    name: "Google Review Link Generator",
    description:
      "Generate a direct Google Review link for your business. Make it easy for customers to leave reviews.",
    href: "/tools/review-link",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
  },
  {
    name: "Profit Margin Calculator",
    description:
      "Quickly determine your profit margin percentage from cost and selling price. Essential for pricing strategy.",
    href: "/tools/cogs-calculator",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
];

export default function ToolsHub() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Autopilot
          </Link>
          <Link
            href="/tools"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Free Tools
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Free Business Tools
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Handy calculators and generators built for field service businesses.
            No sign-up required — just pick a tool and get to work.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-blue-50 p-3 text-blue-600 group-hover:bg-blue-100 transition-colors">
                {tool.icon}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {tool.name}
              </h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {tool.description}
              </p>
              <span className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Use Tool
                <svg
                  className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 rounded-2xl bg-blue-600 px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Want more tools? Try Autopilot free for 14 days
          </h2>
          <p className="mt-3 text-blue-100 max-w-xl mx-auto">
            Autopilot is an all-in-one CRM and field service management platform
            that helps you run your business on autopilot.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </main>
    </div>
  );
}
