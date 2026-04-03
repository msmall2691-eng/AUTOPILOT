"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Zap,
  MessageSquare,
  Mail,
  Clock,
  ChevronRight,
  Power,
  PowerOff,
  Briefcase,
  FileText,
  UserPlus,
  CalendarCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TriggerType =
  | "job_completed"
  | "estimate_sent"
  | "new_lead"
  | "after_booking";

type StepType = "sms" | "email" | "delay";

interface SequenceStep {
  id: string;
  type: StepType;
  label: string;
  /** delay in hours, only relevant when type === "delay" */
  delayHours?: number;
}

interface Sequence {
  id: string;
  name: string;
  trigger: TriggerType;
  active: boolean;
  steps: SequenceStep[];
  enrolledCount: number;
  completedCount: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------
const MOCK_SEQUENCES: Sequence[] = [
  {
    id: "seq1",
    name: "Post-Job Follow-Up",
    trigger: "job_completed",
    active: true,
    enrolledCount: 342,
    completedCount: 298,
    steps: [
      { id: "s1a", type: "sms", label: "Thank you text" },
      { id: "s1b", type: "delay", label: "Wait 2 days", delayHours: 48 },
      { id: "s1c", type: "email", label: "Review request email" },
      { id: "s1d", type: "delay", label: "Wait 5 days", delayHours: 120 },
      { id: "s1e", type: "sms", label: "Referral ask text" },
    ],
  },
  {
    id: "seq2",
    name: "Estimate Follow-Up",
    trigger: "estimate_sent",
    active: true,
    enrolledCount: 187,
    completedCount: 140,
    steps: [
      { id: "s2a", type: "delay", label: "Wait 1 day", delayHours: 24 },
      { id: "s2b", type: "sms", label: "Checking in text" },
      { id: "s2c", type: "delay", label: "Wait 3 days", delayHours: 72 },
      { id: "s2d", type: "email", label: "Estimate reminder email" },
      { id: "s2e", type: "delay", label: "Wait 7 days", delayHours: 168 },
      { id: "s2f", type: "sms", label: "Last chance text" },
    ],
  },
  {
    id: "seq3",
    name: "New Lead Nurture",
    trigger: "new_lead",
    active: true,
    enrolledCount: 523,
    completedCount: 410,
    steps: [
      { id: "s3a", type: "sms", label: "Welcome text" },
      { id: "s3b", type: "delay", label: "Wait 1 hour", delayHours: 1 },
      { id: "s3c", type: "email", label: "Services overview email" },
      { id: "s3d", type: "delay", label: "Wait 3 days", delayHours: 72 },
      { id: "s3e", type: "sms", label: "Special offer text" },
    ],
  },
  {
    id: "seq4",
    name: "Booking Confirmation & Prep",
    trigger: "after_booking",
    active: false,
    enrolledCount: 89,
    completedCount: 76,
    steps: [
      { id: "s4a", type: "email", label: "Confirmation email" },
      { id: "s4b", type: "delay", label: "Wait until 1 day before", delayHours: -24 },
      { id: "s4c", type: "sms", label: "Appointment reminder" },
    ],
  },
  {
    id: "seq5",
    name: "Seasonal Re-Engagement",
    trigger: "job_completed",
    active: false,
    enrolledCount: 1_205,
    completedCount: 980,
    steps: [
      { id: "s5a", type: "delay", label: "Wait 90 days", delayHours: 2160 },
      { id: "s5b", type: "email", label: "Seasonal check-in email" },
      { id: "s5c", type: "delay", label: "Wait 7 days", delayHours: 168 },
      { id: "s5d", type: "sms", label: "Limited-time offer text" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: "job_completed", label: "Job Completed" },
  { value: "estimate_sent", label: "Estimate Sent" },
  { value: "new_lead", label: "New Lead" },
  { value: "after_booking", label: "After Booking" },
];

function triggerLabel(trigger: TriggerType): string {
  const match = TRIGGER_OPTIONS.find((t) => t.value === trigger);
  return match?.label ?? trigger;
}

function TriggerIcon({ trigger }: { trigger: TriggerType }) {
  switch (trigger) {
    case "job_completed":
      return <Briefcase className="h-4 w-4" />;
    case "estimate_sent":
      return <FileText className="h-4 w-4" />;
    case "new_lead":
      return <UserPlus className="h-4 w-4" />;
    case "after_booking":
      return <CalendarCheck className="h-4 w-4" />;
  }
}

function StepIcon({ type }: { type: StepType }) {
  switch (type) {
    case "sms":
      return <MessageSquare className="h-3.5 w-3.5 text-green-600" />;
    case "email":
      return <Mail className="h-3.5 w-3.5 text-blue-600" />;
    case "delay":
      return <Clock className="h-3.5 w-3.5 text-orange-500" />;
  }
}

function stepBg(type: StepType): string {
  switch (type) {
    case "sms":
      return "bg-green-50 border-green-200";
    case "email":
      return "bg-blue-50 border-blue-200";
    case "delay":
      return "bg-orange-50 border-orange-200";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>(MOCK_SEQUENCES);
  const [showModal, setShowModal] = useState(false);

  // New sequence form
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState<TriggerType>("job_completed");

  function handleToggle(id: string) {
    setSequences((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  }

  function handleCreate() {
    if (!newName.trim()) return;

    const seq: Sequence = {
      id: `seq${Date.now()}`,
      name: newName.trim(),
      trigger: newTrigger,
      active: false,
      enrolledCount: 0,
      completedCount: 0,
      steps: [
        { id: `step-${Date.now()}-1`, type: "sms", label: "Welcome message" },
        {
          id: `step-${Date.now()}-2`,
          type: "delay",
          label: "Wait 1 day",
          delayHours: 24,
        },
        {
          id: `step-${Date.now()}-3`,
          type: "email",
          label: "Follow-up email",
        },
      ],
    };

    setSequences((prev) => [seq, ...prev]);
    setNewName("");
    setNewTrigger("job_completed");
    setShowModal(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Automated Sequences
        </h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sequence
        </Button>
      </div>

      {/* Sequence cards */}
      <div className="space-y-4">
        {sequences.map((seq) => (
          <Card key={seq.id} className="overflow-hidden">
            <CardContent className="space-y-4">
              {/* Top row: name, trigger, toggle */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Zap
                      className={`h-5 w-5 shrink-0 ${
                        seq.active ? "text-purple-600" : "text-gray-400"
                      }`}
                    />
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {seq.name}
                    </h3>
                    <Badge color={seq.active ? "green" : "gray"} dot>
                      {seq.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <TriggerIcon trigger={seq.trigger} />
                      Trigger: {triggerLabel(seq.trigger)}
                    </span>
                    <span>
                      {seq.steps.length} step{seq.steps.length !== 1 && "s"}
                    </span>
                    <span>
                      {seq.enrolledCount.toLocaleString()} enrolled
                    </span>
                    <span>
                      {seq.completedCount.toLocaleString()} completed
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(seq.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    seq.active
                      ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                  title={seq.active ? "Deactivate sequence" : "Activate sequence"}
                >
                  {seq.active ? (
                    <>
                      <Power className="h-4 w-4" /> On
                    </>
                  ) : (
                    <>
                      <PowerOff className="h-4 w-4" /> Off
                    </>
                  )}
                </button>
              </div>

              {/* Visual sequence flow */}
              <div className="overflow-x-auto">
                <div className="flex items-center gap-1 py-2 min-w-max">
                  {seq.steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-1">
                      <div
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium ${stepBg(
                          step.type
                        )}`}
                      >
                        <StepIcon type={step.type} />
                        <span className="whitespace-nowrap">{step.label}</span>
                      </div>
                      {idx < seq.steps.length - 1 && (
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Sequence Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Sequence"
        description="Create an automated follow-up sequence triggered by customer events."
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Sequence Name"
            placeholder="e.g., Post-Job Follow-Up"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <Select
            label="Trigger"
            value={newTrigger}
            onChange={(e) => setNewTrigger(e.target.value as TriggerType)}
            options={TRIGGER_OPTIONS}
          />

          <div>
            <p className="mb-1.5 block text-sm font-medium text-gray-700">
              Default Steps
            </p>
            <p className="text-sm text-gray-500">
              A starter 3-step sequence will be created. You can customize steps
              after creation.
            </p>
            <div className="mt-3 flex items-center gap-1">
              <div className="flex items-center gap-1.5 rounded-lg border bg-green-50 border-green-200 px-3 py-2 text-xs font-medium">
                <MessageSquare className="h-3.5 w-3.5 text-green-600" />
                Welcome SMS
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center gap-1.5 rounded-lg border bg-orange-50 border-orange-200 px-3 py-2 text-xs font-medium">
                <Clock className="h-3.5 w-3.5 text-orange-500" />
                Wait 1 day
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center gap-1.5 rounded-lg border bg-blue-50 border-blue-200 px-3 py-2 text-xs font-medium">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                Follow-up email
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create Sequence
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
