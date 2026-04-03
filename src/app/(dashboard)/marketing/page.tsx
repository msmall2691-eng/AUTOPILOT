"use client";

import { useState } from "react";
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
  BarChart3,
  MessageSquare,
  Mail,
  ArrowRight,
  Send,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------
const STATS = [
  { icon: Megaphone, label: "Total Campaigns", value: 48, change: 12 },
  { icon: Zap, label: "Active Sequences", value: 7, change: 2 },
  { icon: Send, label: "Review Requests Sent", value: 1_243, change: 18 },
  { icon: Star, label: "Avg Rating", value: "4.8", change: 3 },
];

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

interface Campaign {
  id: string;
  name: string;
  type: "sms" | "email" | "voicemail" | "postcard";
  status: "draft" | "scheduled" | "sending" | "sent";
  recipients: number;
  sent: number;
  scheduledDate: string;
}

const RECENT_CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    name: "Spring HVAC Tune-Up Special",
    type: "sms",
    status: "sent",
    recipients: 1_450,
    sent: 1_423,
    scheduledDate: "2026-03-28T10:00:00",
  },
  {
    id: "c2",
    name: "April Newsletter - New Services",
    type: "email",
    status: "scheduled",
    recipients: 3_200,
    sent: 0,
    scheduledDate: "2026-04-05T09:00:00",
  },
  {
    id: "c3",
    name: "Referral Program Announcement",
    type: "voicemail",
    status: "sending",
    recipients: 800,
    sent: 412,
    scheduledDate: "2026-04-01T14:00:00",
  },
  {
    id: "c4",
    name: "Thank You Postcard - Q1 Clients",
    type: "postcard",
    status: "draft",
    recipients: 650,
    sent: 0,
    scheduledDate: "2026-04-10T08:00:00",
  },
  {
    id: "c5",
    name: "Emergency Plumbing Reminder",
    type: "sms",
    status: "sent",
    recipients: 2_100,
    sent: 2_087,
    scheduledDate: "2026-03-22T11:30:00",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function campaignStatusColor(status: Campaign["status"]): BadgeColor {
  switch (status) {
    case "draft":
      return "gray";
    case "scheduled":
      return "blue";
    case "sending":
      return "yellow";
    case "sent":
      return "green";
    default:
      return "gray";
  }
}

function campaignTypeLabel(type: Campaign["type"]): string {
  switch (type) {
    case "sms":
      return "SMS Blast";
    case "email":
      return "Email Blast";
    case "voicemail":
      return "Voicemail Blast";
    case "postcard":
      return "Postcard Blast";
    default:
      return type;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MarketingPage() {
  const [campaigns] = useState<Campaign[]>(RECENT_CAMPAIGNS);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <Link href="/marketing/campaigns">
          <Button>View All Campaigns</Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatsCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            changeLabel="vs last month"
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="group cursor-pointer transition-shadow hover:shadow-md h-full">
                <CardContent className="flex flex-col gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {action.description}
                    </p>
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
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Campaigns
          </h2>
          <Link
            href="/marketing/campaigns"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>
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
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium text-gray-900">
                  {campaign.name}
                </TableCell>
                <TableCell>{campaignTypeLabel(campaign.type)}</TableCell>
                <TableCell>
                  <Badge color={campaignStatusColor(campaign.status)} dot>
                    {campaign.status.charAt(0).toUpperCase() +
                      campaign.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {campaign.recipients.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {campaign.sent.toLocaleString()}
                </TableCell>
                <TableCell>{formatDate(campaign.scheduledDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                  <p className="text-sm text-gray-500">
                    SMS, Email, Voicemail, Postcard
                  </p>
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
                  <p className="text-sm text-gray-500">
                    Automated follow-ups
                  </p>
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
                  <p className="text-sm text-gray-500">
                    Manage reputation
                  </p>
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
