"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReviewLinkPage() {
  const [businessName, setBusinessName] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [copied, setCopied] = useState(false);

  const reviewLink = placeId.trim()
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`
    : "";

  const handleCopy = async () => {
    if (!reviewLink) return;
    try {
      await navigator.clipboard.writeText(reviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = reviewLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            Google Review Link Generator
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Google Review Link Generator
        </h1>
        <p className="text-gray-600 mb-8">
          Create a direct link that takes customers straight to your Google
          review page. Share it via text, email, or on your website to get more
          5-star reviews.
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Business</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Business Name"
                    placeholder="Acme Lawn Care"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    hint="Your business name (for your reference)."
                  />
                  <Input
                    label="Google Place ID"
                    placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value)}
                    hint="Enter your Google Place ID to generate a review link."
                  />
                </div>
              </CardContent>
            </Card>

            {/* How to find Place ID */}
            <Card>
              <CardHeader>
                <CardTitle>How to Find Your Place ID</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <span>
                      Go to{" "}
                      <a
                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Google&apos;s Place ID Finder
                      </a>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <span>
                      Search for your business name in the map search bar
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <span>
                      Click on your business in the results. The Place ID
                      will appear below the map (starts with &quot;ChIJ...&quot;)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <span>Copy and paste the Place ID into the field above</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Generated Link */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Review Link</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewLink ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm text-gray-600 mb-2 font-medium">
                        Review URL
                      </p>
                      <p className="text-sm text-blue-600 break-all font-mono">
                        {reviewLink}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleCopy}
                    >
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">
                      Enter your Place ID to generate a review link
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Getting More Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    <span>
                      <strong>Text it after every job.</strong> Send the link via
                      SMS within 1 hour of completing a job while the experience
                      is fresh.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    <span>
                      <strong>Add it to your email signature.</strong> Every email
                      you send becomes a chance to earn a review.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    <span>
                      <strong>Print a QR code.</strong> Use our{" "}
                      <Link
                        href="/tools/qr-code"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        QR Code Generator
                      </Link>{" "}
                      to create a scannable code for your review link and put it
                      on business cards or invoices.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    <span>
                      <strong>Keep it simple.</strong> Don&apos;t ask for a
                      specific star rating -- just ask customers to share their
                      honest experience.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-blue-600 px-8 py-10 text-center text-white">
          <h2 className="text-xl font-bold sm:text-2xl">
            Want more tools? Try Autopilot free for 14 days
          </h2>
          <p className="mt-2 text-blue-100 text-sm max-w-lg mx-auto">
            Autopilot automatically sends review requests after every job,
            helping you build your reputation on autopilot.
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
