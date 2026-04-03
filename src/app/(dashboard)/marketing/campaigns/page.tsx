"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Plus,
  MessageSquare,
  Mail,
  Phone,
  FileImage,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CampaignType = "sms" | "email" | "voicemail" | "postcard";
type CampaignStatus = "draft" | "scheduled" | "sending" | "sent";

interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  recipients: number;
  sent: number;
  scheduledDate: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------
const MOCK_CAMPAIGNS: Campaign[] = [
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
  {
    id: "c6",
    name: "Winter Prep - Insulation Offer",
    type: "email",
    status: "sent",
    recipients: 4_500,
    sent: 4_321,
    scheduledDate: "2026-02-15T08:00:00",
  },
  {
    id: "c7",
    name: "Holiday Greetings 2025",
    type: "postcard",
    status: "sent",
    recipients: 1_800,
    sent: 1_800,
    scheduledDate: "2025-12-18T09:00:00",
  },
  {
    id: "c8",
    name: "Appointment Follow-Up Voicemail",
    type: "voicemail",
    status: "scheduled",
    recipients: 350,
    sent: 0,
    scheduledDate: "2026-04-07T13:00:00",
  },
  {
    id: "c9",
    name: "Flash Sale - 20% Off Drain Cleaning",
    type: "sms",
    status: "draft",
    recipients: 0,
    sent: 0,
    scheduledDate: "2026-04-12T10:00:00",
  },
  {
    id: "c10",
    name: "New Employee Introduction",
    type: "email",
    status: "draft",
    recipients: 0,
    sent: 0,
    scheduledDate: "2026-04-15T08:00:00",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TABS: { value: CampaignType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sms", label: "SMS Blast" },
  { value: "email", label: "Email Blast" },
  { value: "voicemail", label: "Voicemail Blast" },
  { value: "postcard", label: "Postcard Blast" },
];

const CAMPAIGN_TYPE_OPTIONS = [
  { value: "sms", label: "SMS Blast" },
  { value: "email", label: "Email Blast" },
  { value: "voicemail", label: "Voicemail Blast" },
  { value: "postcard", label: "Postcard Blast" },
];

function statusBadgeColor(status: CampaignStatus): BadgeColor {
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

function campaignTypeLabel(type: CampaignType): string {
  switch (type) {
    case "sms":
      return "SMS Blast";
    case "email":
      return "Email Blast";
    case "voicemail":
      return "Voicemail Blast";
    case "postcard":
      return "Postcard Blast";
  }
}

function TypeIcon({ type }: { type: CampaignType }) {
  switch (type) {
    case "sms":
      return <MessageSquare className="h-4 w-4 text-green-600" />;
    case "email":
      return <Mail className="h-4 w-4 text-blue-600" />;
    case "voicemail":
      return <Phone className="h-4 w-4 text-orange-600" />;
    case "postcard":
      return <FileImage className="h-4 w-4 text-purple-600" />;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [activeTab, setActiveTab] = useState<CampaignType | "all">("all");
  const [showModal, setShowModal] = useState(false);

  // New campaign form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<CampaignType>("sms");
  const [newContent, setNewContent] = useState("");
  const [newRecipients, setNewRecipients] = useState("");

  const filtered =
    activeTab === "all"
      ? campaigns
      : campaigns.filter((c) => c.type === activeTab);

  function handleCreate() {
    if (!newName.trim()) return;

    const campaign: Campaign = {
      id: `c${Date.now()}`,
      name: newName.trim(),
      type: newType,
      status: "draft",
      recipients: parseInt(newRecipients, 10) || 0,
      sent: 0,
      scheduledDate: new Date().toISOString(),
    };

    setCampaigns((prev) => [campaign, ...prev]);
    setNewName("");
    setNewType("sms");
    setNewContent("");
    setNewRecipients("");
    setShowModal(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
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
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                No campaigns found for this filter.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TypeIcon type={campaign.type} />
                    <span className="font-medium text-gray-900">
                      {campaign.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{campaignTypeLabel(campaign.type)}</TableCell>
                <TableCell>
                  <Badge color={statusBadgeColor(campaign.status)} dot>
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
            ))
          )}
        </TableBody>
      </Table>

      {/* New Campaign Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Campaign"
        description="Create a new marketing campaign to reach your customers."
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            placeholder="e.g., Summer AC Tune-Up Special"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <Select
            label="Campaign Type"
            value={newType}
            onChange={(e) => setNewType(e.target.value as CampaignType)}
            options={CAMPAIGN_TYPE_OPTIONS}
          />

          <Textarea
            label="Content"
            placeholder={
              newType === "sms"
                ? "Type your SMS message (160 chars recommended)..."
                : newType === "email"
                  ? "Write your email body content..."
                  : newType === "voicemail"
                    ? "Write your voicemail script..."
                    : "Describe your postcard message..."
            }
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
          />

          <Input
            label="Number of Recipients"
            type="number"
            placeholder="e.g., 500"
            value={newRecipients}
            onChange={(e) => setNewRecipients(e.target.value)}
            hint="How many customers will receive this campaign"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create Campaign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
