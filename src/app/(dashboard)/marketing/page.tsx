"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Megaphone,
  Zap,
  Star,
  Send,
  MessageSquare,
  Mail,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ApiCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  scheduledAt: string | null;
  createdAt: string;
}

interface ApiSequence {
  id: string;
  name: string;
  isActive: boolean;
}

interface ApiReview {
  id: string;
  rating: number | null;
  status: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function campaignStatusColor(status: string): BadgeColor {
  switch (status) {
    case "draft": return "gray";
    case "scheduled": return "blue";
    case "sending": return "yellow";
    case "sent": return "green";
    default: return "gray";
  }
}

function campaignTypeLabel(type: string): string {
  switch (type) {
    case "sms_blast": return "SMS Blast";
    case "email_blast": return "Email Blast";
    case "voicemail_blast": return "Voicemail Blast";
    case "postcard_blast": return "Postcard Blast";
    default: return type;
  }
}

const QUICK_ACTIONS = [
  {
    title: "New SMS Blast",
    description: "Send a text campaign to your customers",
    icon: MessageSquare,
    href: "/marketing/campaigns",
    color: "bg-green-50 text-green-600",
  },
  {
    title: "New Email Blast",
    description: "Design and send email campaigns",
    icon: Mail,
    href: "/marketing/campaigns",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "New Sequence",
    description: "Set up automated follow-up sequences",
    icon: Zap,
    href: "/marketing/sequences",
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Request Reviews",
    description: "Ask customers for reviews on Google and Yelp",
    icon: Star,
    href: "/marketing/reviews",
    color: "bg-yellow-50 text-yellow-600",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [sequences, setSequences] = useState<ApiSequence[]>([]);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [campRes, seqRes, revRes] = await Promise.all([
          fetch("/api/marketing/campaigns?limit=5"),
          fetch("/api/marketing/sequences"),
          fetch("/api/marketing/reviews"),
        ]);

        if (campRes.ok) {
          const data = await campRes.json();
          setCampaigns(data.campaigns ?? []);
        }
        if (seqRes.ok) {
          const data = await seqRes.json();
          setSequences(data.sequences ?? []);
        }
        if (revRes.ok) {
          const data = await revRes.json();
          setReviews(data.reviews ?? []);
        }
      } catch (err) {
        console.error("Error fetching marketing data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const totalCampaigns = campaigns.length;
  const activeSequences = sequences.filter((s) => s.isActive).length;
  const totalReviewsSent = reviews.length;
  const completedReviews = reviews.filter((r) => r.status === "reviewed" || r.rating != null);
  const avgRating =
    completedReviews.length > 0
      ? (completedReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / completedReviews.length).toFixed(1)
      : "—";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <Link href="/marketing/campaigns">
          <Button>View All Campaigns</Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Megaphone} label="Total Campaigns" value={totalCampaigns} />
        <StatsCard icon={Zap} label="Active Sequences" value={activeSequences} />
        <StatsCard icon={Send} label="Review Requests Sent" value={totalReviewsSent} />
        <StatsCard icon={Star} label="Avg Rating" value={avgRating} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="group cursor-pointer transition-shadow hover:shadow-md h-full">
                <CardContent className="flex flex-col gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{action.description}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Get started <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
          <Link href="/marketing/campaigns" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Recipients</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead>Scheduled Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                    No campaigns yet. Create your first campaign to get started.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium text-gray-900">{campaign.name}</TableCell>
                    <TableCell>{campaignTypeLabel(campaign.type)}</TableCell>
                    <TableCell>
                      <Badge color={campaignStatusColor(campaign.status)} dot>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{campaign.recipientCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{campaign.sentCount.toLocaleString()}</TableCell>
                    <TableCell>{campaign.scheduledAt ? formatDate(campaign.scheduledAt) : "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Sub-page Link Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/marketing/campaigns">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Megaphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Campaigns</h3>
                  <p className="text-sm text-gray-500">SMS, Email, Voicemail, Postcard</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/marketing/sequences">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sequences</h3>
                  <p className="text-sm text-gray-500">Automated follow-ups</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/marketing/reviews">
          <Card className="group cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Reviews</h3>
                  <p className="text-sm text-gray-500">Manage reputation</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
