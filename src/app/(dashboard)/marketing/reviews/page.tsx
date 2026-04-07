"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Star,
  Send,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Platform = "google" | "yelp" | "facebook";

interface ApiReview {
  id: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  platform: string;
  status: string;
  rating: number | null;
  reviewText: string | null;
  aiResponse: string | null;
  sentAt: string;
  reviewedAt: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function statusColor(status: string): BadgeColor {
  switch (status) {
    case "pending": return "gray";
    case "sent": return "blue";
    case "clicked": return "yellow";
    case "reviewed": return "green";
    default: return "gray";
  }
}

function platformLabel(platform: string): string {
  switch (platform) {
    case "google": return "Google";
    case "yelp": return "Yelp";
    case "facebook": return "Facebook";
    default: return platform;
  }
}

function platformColor(platform: string): BadgeColor {
  switch (platform) {
    case "google": return "blue";
    case "yelp": return "red";
    case "facebook": return "blue";
    default: return "gray";
  }
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

const PLATFORM_OPTIONS = [
  { value: "google", label: "Google" },
  { value: "yelp", label: "Yelp" },
  { value: "facebook", label: "Facebook" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ApiReview | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [reqClient, setReqClient] = useState("");
  const [reqPlatform, setReqPlatform] = useState<Platform>("google");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews ?? []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleSendRequest() {
    if (!reqClient.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketing/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: reqClient.trim(),
          platform: reqPlatform,
        }),
      });
      if (res.ok) {
        setReqClient("");
        setReqPlatform("google");
        setShowRequestModal(false);
        fetchReviews();
      }
    } catch (err) {
      console.error("Error sending review request:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyResponse(reviewId: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(reviewId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  // Stats
  const completedReviews = reviews.filter((r) => r.status === "reviewed" || r.rating != null);
  const totalReviews = completedReviews.length;
  const avgRating =
    totalReviews > 0
      ? (completedReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalReviews).toFixed(1)
      : "0.0";
  const responseRate =
    totalReviews > 0
      ? Math.round((completedReviews.filter((r) => r.aiResponse).length / totalReviews) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <Button onClick={() => setShowRequestModal(true)}>
          <Send className="mr-2 h-4 w-4" />
          Request Review
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard icon={MessageSquare} label="Total Reviews" value={totalReviews} />
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-50">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Average Rating</p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
            <StarRating rating={Math.round(Number(avgRating))} size="md" />
          </div>
          <p className="mt-2 text-sm text-gray-400">Based on {totalReviews} reviews</p>
        </div>
        <StatsCard icon={TrendingUp} label="Review Response Rate" value={`${responseRate}%`} />
      </div>

      {/* Reviews Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Review Requests</h2>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                    No review requests yet. Send your first review request.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium text-gray-900">{review.clientName}</TableCell>
                    <TableCell>
                      <Badge color={platformColor(review.platform)}>
                        {platformLabel(review.platform)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge color={statusColor(review.status)} dot>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {review.rating ? <StarRating rating={review.rating} /> : <span className="text-sm text-gray-400">--</span>}
                    </TableCell>
                    <TableCell>{formatDate(review.sentAt)}</TableCell>
                    <TableCell className="text-right">
                      {review.reviewText && (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedReview(review)}>
                          View
                          <ExternalLink className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* AI Response Section */}
      {selectedReview && selectedReview.reviewText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI-Assisted Response
              <span className="ml-2 text-sm font-normal text-gray-500">
                for {selectedReview.clientName}&apos;s review
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Customer Review</p>
                {selectedReview.rating && <StarRating rating={selectedReview.rating} />}
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm leading-relaxed text-gray-700">
                  &ldquo;{selectedReview.reviewText}&rdquo;
                </p>
              </div>
            </div>

            {selectedReview.aiResponse && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700">AI-Generated Response</p>
                  <Badge color="purple">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI
                  </Badge>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <p className="text-sm leading-relaxed text-gray-700">{selectedReview.aiResponse}</p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCopyResponse(selectedReview.id, selectedReview.aiResponse!)}
                  >
                    {copiedId === selectedReview.id ? (
                      <><Check className="mr-1.5 h-4 w-4" />Copied!</>
                    ) : (
                      <><Copy className="mr-1.5 h-4 w-4" />Copy Response</>
                    )}
                  </Button>
                  <Button variant="primary" size="sm">
                    <ThumbsUp className="mr-1.5 h-4 w-4" />
                    Post Response
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedReview(null)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Request Review Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request a Review"
        description="Send a review request to a customer via SMS or email."
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Client Name"
            placeholder="e.g., John Smith"
            value={reqClient}
            onChange={(e) => setReqClient(e.target.value)}
          />
          <Select
            label="Review Platform"
            value={reqPlatform}
            onChange={(e) => setReqPlatform(e.target.value as Platform)}
            options={PLATFORM_OPTIONS}
          />
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Message Preview</p>
            <p className="text-sm text-gray-600">
              Hi {reqClient || "[Client Name]"}, thank you for choosing us! We&apos;d
              love to hear about your experience. Could you take a moment to
              leave us a review on {platformLabel(reqPlatform)}? It really helps
              our small business grow. Thank you!
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendRequest} disabled={!reqClient.trim() || submitting}>
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
