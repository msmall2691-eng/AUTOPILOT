"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  Bell,
  CreditCard,
  Puzzle,
  Upload,
  Check,
  Calendar,
  DollarSign,
  BookOpen,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type SettingsTab = "company" | "notifications" | "billing" | "integrations";

const TABS: { label: string; value: SettingsTab; icon: React.ElementType }[] = [
  { label: "Company", value: "company", icon: Building2 },
  { label: "Notifications", value: "notifications", icon: Bell },
  { label: "Billing", value: "billing", icon: CreditCard },
  { label: "Integrations", value: "integrations", icon: Puzzle },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
];

const INDUSTRIES = [
  { value: "hvac", label: "HVAC" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "landscaping", label: "Landscaping" },
  { value: "cleaning", label: "Cleaning" },
  { value: "roofing", label: "Roofing" },
  { value: "painting", label: "Painting" },
  { value: "general_contractor", label: "General Contractor" },
  { value: "pest_control", label: "Pest Control" },
  { value: "other", label: "Other" },
];

const PAYMENT_TERMS = [
  { value: "due_on_receipt", label: "Due on Receipt" },
  { value: "net_15", label: "Net 15" },
  { value: "net_30", label: "Net 30" },
  { value: "net_45", label: "Net 45" },
  { value: "net_60", label: "Net 60" },
];

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_COMPANY = {
  name: "Autopilot Services LLC",
  email: "hello@autopilotservices.com",
  phone: "5551234567",
  address: "742 Evergreen Terrace, Springfield, IL 62704",
  industry: "hvac",
  timezone: "America/Chicago",
  brandColor: "#2563EB",
  taxRate: "8.25",
  invoicePrefix: "INV",
  estimatePrefix: "EST",
  paymentTerms: "net_30",
};

const INITIAL_NOTIFICATIONS = {
  emailNewJob: true,
  emailJobComplete: true,
  emailInvoicePaid: true,
  emailWeeklySummary: true,
  smsNewJob: false,
  smsJobReminder: true,
  smsClientMessage: true,
  jobReminders: true,
  jobReminderHours: "24",
  reviewRequests: true,
  reviewRequestDelay: "48",
};

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  connected: boolean;
  accountLabel?: string;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Sync jobs and appointments with your Google Calendar.",
    icon: Calendar,
    connected: true,
    accountLabel: "hello@autopilotservices.com",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept online payments and manage invoices through Stripe.",
    icon: DollarSign,
    connected: true,
    accountLabel: "acct_1N2x3Y4z5A",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Automatically sync invoices, payments, and expenses with QuickBooks.",
    icon: BookOpen,
    connected: false,
  },
];

// ---------------------------------------------------------------------------
// Toggle switch component
// ---------------------------------------------------------------------------

function Toggle({
  enabled,
  onToggle,
  label,
  description,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          enabled ? "bg-blue-600" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out",
            enabled ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab content components
// ---------------------------------------------------------------------------

function CompanyTab({
  company,
  setCompany,
}: {
  company: typeof INITIAL_COMPANY;
  setCompany: React.Dispatch<React.SetStateAction<typeof INITIAL_COMPANY>>;
}) {
  const update = (field: keyof typeof INITIAL_COMPANY, value: string) =>
    setCompany((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-8">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Company Name"
            value={company.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={company.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <Input
              label="Phone"
              type="tel"
              value={company.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <Input
            label="Address"
            value={company.address}
            onChange={(e) => update("address", e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Industry"
              value={company.industry}
              onChange={(e) => update("industry", e.target.value)}
              options={INDUSTRIES}
            />
            <Select
              label="Timezone"
              value={company.timezone}
              onChange={(e) => update("timezone", e.target.value)}
              options={TIMEZONES}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo upload */}
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => alert("File upload coming soon.")}>
                Upload Logo
              </Button>
              <p className="mt-1.5 text-xs text-gray-500">
                PNG, JPG, or SVG. Max 2 MB. Recommended 256x256px.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding & billing */}
      <Card>
        <CardHeader>
          <CardTitle>Branding &amp; Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-lg border border-gray-200 shrink-0"
                  style={{ backgroundColor: company.brandColor }}
                />
                <Input
                  value={company.brandColor}
                  onChange={(e) => update("brandColor", e.target.value)}
                  placeholder="#2563EB"
                />
              </div>
            </div>
            <Input
              label="Tax Rate (%)"
              type="number"
              step="0.01"
              value={company.taxRate}
              onChange={(e) => update("taxRate", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Invoice Prefix"
              value={company.invoicePrefix}
              onChange={(e) => update("invoicePrefix", e.target.value)}
            />
            <Input
              label="Estimate Prefix"
              value={company.estimatePrefix}
              onChange={(e) => update("estimatePrefix", e.target.value)}
            />
            <Select
              label="Payment Terms"
              value={company.paymentTerms}
              onChange={(e) => update("paymentTerms", e.target.value)}
              options={PAYMENT_TERMS}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => alert("Settings saved!")}>
          <Check className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function NotificationsTab({
  notifications,
  setNotifications,
}: {
  notifications: typeof INITIAL_NOTIFICATIONS;
  setNotifications: React.Dispatch<
    React.SetStateAction<typeof INITIAL_NOTIFICATIONS>
  >;
}) {
  const toggle = (field: keyof typeof INITIAL_NOTIFICATIONS) =>
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <Toggle
            label="New Job Assigned"
            description="Receive an email when a new job is created or assigned to you."
            enabled={notifications.emailNewJob as boolean}
            onToggle={() => toggle("emailNewJob")}
          />
          <Toggle
            label="Job Completed"
            description="Get notified when a team member marks a job as complete."
            enabled={notifications.emailJobComplete as boolean}
            onToggle={() => toggle("emailJobComplete")}
          />
          <Toggle
            label="Invoice Paid"
            description="Receive a confirmation when a client pays an invoice."
            enabled={notifications.emailInvoicePaid as boolean}
            onToggle={() => toggle("emailInvoicePaid")}
          />
          <Toggle
            label="Weekly Summary"
            description="A digest of your business performance delivered every Monday."
            enabled={notifications.emailWeeklySummary as boolean}
            onToggle={() => toggle("emailWeeklySummary")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS Notifications</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <Toggle
            label="New Job Alert"
            description="Receive an SMS when a new job is assigned."
            enabled={notifications.smsNewJob as boolean}
            onToggle={() => toggle("smsNewJob")}
          />
          <Toggle
            label="Job Reminders"
            description="Get a text reminder before upcoming jobs."
            enabled={notifications.smsJobReminder as boolean}
            onToggle={() => toggle("smsJobReminder")}
          />
          <Toggle
            label="Client Messages"
            description="Receive SMS alerts when clients send you a message."
            enabled={notifications.smsClientMessage as boolean}
            onToggle={() => toggle("smsClientMessage")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Toggle
              label="Job Reminders"
              description="Automatically send reminders to clients before scheduled jobs."
              enabled={notifications.jobReminders as boolean}
              onToggle={() => toggle("jobReminders")}
            />
          </div>
          {notifications.jobReminders && (
            <div className="pl-0 max-w-xs">
              <Select
                label="Reminder Timing"
                value={notifications.jobReminderHours as string}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    jobReminderHours: e.target.value,
                  }))
                }
                options={[
                  { value: "1", label: "1 hour before" },
                  { value: "2", label: "2 hours before" },
                  { value: "24", label: "24 hours before" },
                  { value: "48", label: "48 hours before" },
                ]}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Toggle
              label="Review Requests"
              description="Automatically request reviews from clients after completed jobs."
              enabled={notifications.reviewRequests as boolean}
              onToggle={() => toggle("reviewRequests")}
            />
          </div>
          {notifications.reviewRequests && (
            <div className="pl-0 max-w-xs">
              <Select
                label="Send After"
                value={notifications.reviewRequestDelay as string}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    reviewRequestDelay: e.target.value,
                  }))
                }
                options={[
                  { value: "1", label: "1 hour after completion" },
                  { value: "24", label: "24 hours after completion" },
                  { value: "48", label: "48 hours after completion" },
                  { value: "72", label: "72 hours after completion" },
                ]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => alert("Notification preferences saved!")}>
          <Check className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Professional
                </h3>
                <Badge color="green" dot>
                  Active
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                $79/month &middot; Billed monthly &middot; Renews Apr 15, 2026
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                Up to 10 team members, unlimited jobs, all integrations
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade options */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Your Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Starter */}
            <div className="rounded-lg border border-gray-200 p-5">
              <h4 className="text-sm font-semibold text-gray-900">Starter</h4>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                $29<span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> 3 team members
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> 100 jobs/month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Basic reporting
                </li>
              </ul>
              <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
                Downgrade
              </Button>
            </div>

            {/* Professional (current) */}
            <div className="rounded-lg border-2 border-blue-500 bg-blue-50/30 p-5">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900">Professional</h4>
                <Badge color="blue">Current</Badge>
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                $79<span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> 10 team members
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Unlimited jobs
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> All integrations
                </li>
              </ul>
              <Button variant="primary" size="sm" className="mt-4 w-full" disabled>
                Current Plan
              </Button>
            </div>

            {/* Enterprise */}
            <div className="rounded-lg border border-gray-200 p-5">
              <h4 className="text-sm font-semibold text-gray-900">Enterprise</h4>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                $199<span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Unlimited members
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Priority support
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Custom branding
                </li>
              </ul>
              <Button variant="primary" size="sm" className="mt-4 w-full">
                Upgrade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe connect */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Stripe Connect</p>
                <p className="text-xs text-gray-500">
                  Accept credit card payments from your clients.
                </p>
              </div>
            </div>
            <Badge color="green" dot>
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationsTab({
  integrations,
  setIntegrations,
}: {
  integrations: Integration[];
  setIntegrations: React.Dispatch<React.SetStateAction<Integration[]>>;
}) {
  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              connected: !i.connected,
              accountLabel: !i.connected ? "Connected just now" : undefined,
            }
          : i
      )
    );
  };

  return (
    <div className="space-y-4">
      {integrations.map((integration) => {
        const Icon = integration.icon;
        return (
          <Card key={integration.id}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                    <Icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {integration.name}
                      </p>
                      {integration.connected && (
                        <Badge color="green" dot>
                          Connected
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {integration.description}
                    </p>
                    {integration.connected && integration.accountLabel && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {integration.accountLabel}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant={integration.connected ? "outline" : "primary"}
                  size="sm"
                  onClick={() => toggleConnection(integration.id)}
                >
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [company, setCompany] = useState(INITIAL_COMPANY);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your company profile, notifications, billing, and integrations.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                activeTab === tab.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "company" && (
        <CompanyTab company={company} setCompany={setCompany} />
      )}
      {activeTab === "notifications" && (
        <NotificationsTab
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
      {activeTab === "billing" && <BillingTab />}
      {activeTab === "integrations" && (
        <IntegrationsTab
          integrations={integrations}
          setIntegrations={setIntegrations}
        />
      )}
    </div>
  );
}
