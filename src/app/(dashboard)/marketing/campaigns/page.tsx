"use client";

import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CampaignType = "sms_blast" | "email_blast" | "voicemail_blast" | "postcard_blast";

interface ApiCampaign {
  id: string;
  name: string;
  type: string;
  status: string;
  content: string | null;
  subject: string | null;
  recipientCount: number;
  sentCount: number;
  scheduledAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TABS: { value: CampaignType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sms_blast", label: "SMS Blast" },
  { value: "email_blast", label: "Email Blast" },
  { value: "voicemail_blast", label: "Voicemail Blast" },
  { value: "postcard_blast", label: "Postcard Blast" },
];

const CAMPAIGN_TYPE_OPTIONS = [
  { value: "sms_blast", label: "SMS Blast" },
  { value: "email_blast", label: "Email Blast" },
  { value: "voicemail_blast", label: "Voicemail Blast" },
  { value: "postcard_blast", label: "Postcard Blast" },
];

function statusBadgeColor(status: string): BadgeColor {
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

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "sms_blast":
      return <MessageSquare className="h-4 w-4 text-green-600" />;
    case "email_blast":
      return <Mail className="h-4 w-4 text-blue-600" />;
    case "voicemail_blast":
      return <Phone className="h-4 w-4 text-orange-600" />;
    case "postcard_blast":
      return <FileImage className="h-4 w-4 text-purple-600" />;
    default:
      return <MessageSquare className="h-4 w-4 text-gray-400" />;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CampaignType | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New campaign form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<CampaignType>("sms_blast");
  const [newContent, setNewContent] = useState("");
  const [newRecipients, setNewRecipients] = useState("");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("type", activeTab);
      const res = await fetch(`/api/marketing/campaigns?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns ?? []);
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          type: newType,
          content: newContent.trim() || undefined,
          recipientCount: parseInt(newRecipients, 10) || 0,
        }),
      });
      if (res.ok) {
        setNewName("");
        setNewType("sms_blast");
        setNewContent("");
        setNewRecipients("");
        setShowModal(false);
        fetchCampaigns();
      }
    } catch (err) {
      console.error("Error creating campaign:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
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
                <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                  No campaigns found for this filter.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TypeIcon type={campaign.type} />
                      <span className="font-medium text-gray-900">{campaign.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{campaignTypeLabel(campaign.type)}</TableCell>
                  <TableCell>
                    <Badge color={statusBadgeColor(campaign.status)} dot>
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
            placeholder="Write your campaign message..."
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
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || submitting}>
              {submitting ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
