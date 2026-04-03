"use client";

import { useState } from "react";
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
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Platform = "google" | "yelp" | "facebook";
type ReviewStatus =
  | "pending"
  | "sent"
  | "opened"
  | "completed"
  | "declined";

interface ReviewRequest {
  id: string;
  clientName: string;
  platform: Platform;
  status: ReviewStatus;
  rating: number | null;
  reviewText: string | null;
  aiResponse: string | null;
  date: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------
const MOCK_REVIEWS: ReviewRequest[] = [
  {
    id: "r1",
    clientName: "Sarah Johnson",
    platform: "google",
    status: "completed",
    rating: 5,
    reviewText:
      "Incredible service! The technician arrived on time and fixed our AC unit within an hour. Very professional and explained everything clearly. Highly recommend!",
    aiResponse:
      "Thank you so much, Sarah! We're thrilled to hear that our technician provided prompt and professional service. Keeping your home comfortable is our top priority, and we truly appreciate you taking the time to share your experience. We look forward to serving you again!",
    date: "2026-03-30T14:20:00",
  },
  {
    id: "r2",
    clientName: "Mike Thompson",
    platform: "google",
    status: "completed",
    rating: 4,
    reviewText:
      "Good job on the plumbing repair. The team was professional, though they showed up about 30 minutes late. Otherwise, quality work and fair pricing.",
    aiResponse:
      "Thank you for the feedback, Mike! We're glad the plumbing repair met your expectations. We apologize for the scheduling delay and are working to improve our arrival times. Your satisfaction matters greatly to us, and we appreciate your honest review.",
    date: "2026-03-28T09:15:00",
  },
  {
    id: "r3",
    clientName: "Jennifer Lee",
    platform: "yelp",
    status: "completed",
    rating: 5,
    reviewText:
      "Best home service company in the area! They've handled our electrical work twice now and both times it was flawless. The online booking system is super convenient too.",
    aiResponse:
      "Wow, thank you, Jennifer! It means a lot to know that you trust us with your electrical needs. We've worked hard to make our booking experience seamless, and we're so happy you're enjoying it. See you next time!",
    date: "2026-03-25T16:45:00",
  },
  {
    id: "r4",
    clientName: "Robert Garcia",
    platform: "google",
    status: "completed",
    rating: 3,
    reviewText:
      "Decent work overall. The initial quote was a bit higher than expected, but they did offer a small discount. Finished the job in a reasonable timeframe.",
    aiResponse:
      "Thank you for your review, Robert. We appreciate your candid feedback about our pricing. We always strive to offer competitive rates while maintaining high-quality service. We'd love the opportunity to exceed your expectations next time. Please don't hesitate to reach out directly if there's anything we can do.",
    date: "2026-03-22T11:30:00",
  },
  {
    id: "r5",
    clientName: "Amanda White",
    platform: "facebook",
    status: "opened",
    rating: null,
    reviewText: null,
    aiResponse: null,
    date: "2026-04-01T08:00:00",
  },
  {
    id: "r6",
    clientName: "David Kim",
    platform: "google",
    status: "sent",
    rating: null,
    reviewText: null,
    aiResponse: null,
    date: "2026-04-01T10:30:00",
  },
  {
    id: "r7",
    clientName: "Lisa Patel",
    platform: "yelp",
    status: "pending",
    rating: null,
    reviewText: null,
    aiResponse: null,
    date: "2026-04-02T09:00:00",
  },
  {
    id: "r8",
    clientName: "Chris Martinez",
    platform: "google",
    status: "declined",
    rating: null,
    reviewText: null,
    aiResponse: null,
    date: "2026-03-27T13:00:00",
  },
  {
    id: "r9",
    clientName: "Emily Rogers",
    platform: "google",
    status: "completed",
    rating: 5,
    reviewText:
      "Outstanding emergency service at 10 PM on a Saturday! They came quickly and fixed our burst pipe. Saved us from major water damage. Can't thank them enough.",
    aiResponse:
      "Thank you so much, Emily! We know emergencies don't wait for business hours, and we're glad our team could respond quickly to prevent further damage. Your kind words mean the world to us. Stay safe and don't hesitate to call anytime!",
    date: "2026-03-20T22:45:00",
  },
  {
    id: "r10",
    clientName: "Tom Bradley",
    platform: "yelp",
    status: "completed",
    rating: 4,
    reviewText:
      "Great experience with the HVAC installation. The crew was knowledgeable and cleaned up after themselves. Only reason for 4 stars is it took a bit longer than quoted.",
    aiResponse:
      "Thanks for the kind words, Tom! We're glad the installation went smoothly and that our team kept your space tidy. We understand that time is valuable and will work on providing more accurate timelines. We appreciate your business!",
    date: "2026-03-18T15:20:00",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function statusColor(status: ReviewStatus): BadgeColor {
  switch (status) {
    case "pending":
      return "gray";
    case "sent":
      return "blue";
    case "opened":
      return "yellow";
    case "completed":
      return "green";
    case "declined":
      return "red";
    default:
      return "gray";
  }
}

function platformLabel(platform: Platform): string {
  switch (platform) {
    case "google":
      return "Google";
    case "yelp":
      return "Yelp";
    case "facebook":
      return "Facebook";
  }
}

function platformColor(platform: Platform): BadgeColor {
  switch (platform) {
    case "google":
      return "blue";
    case "yelp":
      return "red";
    case "facebook":
      return "blue";
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
            i <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
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
// Computed stats
// ---------------------------------------------------------------------------
const completedReviews = MOCK_REVIEWS.filter((r) => r.status === "completed");
const totalReviews = completedReviews.length;
const avgRating =
  totalReviews > 0
    ? (
        completedReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
        totalReviews
      ).toFixed(1)
    : "0.0";
const responseRate = totalReviews > 0
  ? Math.round(
      (completedReviews.filter((r) => r.aiResponse).length / totalReviews) *
        100
    )
  : 0;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ReviewsPage() {
  const [reviews] = useState<ReviewRequest[]>(MOCK_REVIEWS);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewRequest | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Request form
  const [reqClient, setReqClient] = useState("");
  const [reqPlatform, setReqPlatform] = useState<Platform>("google");

  function handleSendRequest() {
    if (!reqClient.trim()) return;
    // In production, this would POST to an API
    setReqClient("");
    setReqPlatform("google");
    setShowRequestModal(false);
  }

  function handleCopyResponse(reviewId: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(reviewId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <Button onClick={() => setShowRequestModal(true)}>
          <Send className="mr-2 h-4 w-4" />
          Request Review
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          icon={MessageSquare}
          label="Total Reviews"
          value={totalReviews}
          change={15}
          changeLabel="vs last month"
        />
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
          <p className="mt-2 text-sm text-gray-400">
            Based on {totalReviews} reviews
          </p>
        </div>
        <StatsCard
          icon={TrendingUp}
          label="Review Response Rate"
          value={`${responseRate}%`}
          change={5}
          changeLabel="vs last month"
        />
      </div>

      {/* Reviews Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Review Requests
        </h2>
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
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium text-gray-900">
                  {review.clientName}
                </TableCell>
                <TableCell>
                  <Badge color={platformColor(review.platform)}>
                    {platformLabel(review.platform)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge color={statusColor(review.status)} dot>
                    {review.status.charAt(0).toUpperCase() +
                      review.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {review.rating ? (
                    <StarRating rating={review.rating} />
                  ) : (
                    <span className="text-sm text-gray-400">--</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(review.date)}</TableCell>
                <TableCell className="text-right">
                  {review.reviewText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReview(review)}
                    >
                      View
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
            {/* Original review */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  Customer Review
                </p>
                {selectedReview.rating && (
                  <StarRating rating={selectedReview.rating} />
                )}
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm leading-relaxed text-gray-700">
                  &ldquo;{selectedReview.reviewText}&rdquo;
                </p>
              </div>
            </div>

            {/* AI Response */}
            {selectedReview.aiResponse && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700">
                    AI-Generated Response
                  </p>
                  <Badge color="purple">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI
                  </Badge>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <p className="text-sm leading-relaxed text-gray-700">
                    {selectedReview.aiResponse}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      handleCopyResponse(
                        selectedReview.id,
                        selectedReview.aiResponse!
                      )
                    }
                  >
                    {copiedId === selectedReview.id ? (
                      <>
                        <Check className="mr-1.5 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-4 w-4" />
                        Copy Response
                      </>
                    )}
                  </Button>
                  <Button variant="primary" size="sm">
                    <ThumbsUp className="mr-1.5 h-4 w-4" />
                    Post Response
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReview(null)}
                  >
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
            <p className="text-sm font-medium text-gray-700 mb-1">
              Message Preview
            </p>
            <p className="text-sm text-gray-600">
              Hi {reqClient || "[Client Name]"}, thank you for choosing us! We&apos;d
              love to hear about your experience. Could you take a moment to
              leave us a review on {platformLabel(reqPlatform)}? It really helps
              our small business grow. Thank you!
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowRequestModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendRequest} disabled={!reqClient.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
