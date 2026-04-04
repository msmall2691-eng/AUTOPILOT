"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TriggerType = "job_completed" | "estimate_sent" | "new_lead" | "after_booking";

interface ApiStep {
  id: string;
  order: number;
  type: string;
  delayHours: number | null;
  content: string | null;
  subject: string | null;
}

interface ApiSequence {
  id: string;
  name: string;
  description: string | null;
  trigger: string;
  isActive: boolean;
  steps: ApiStep[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: "job_completed", label: "Job Completed" },
  { value: "estimate_sent", label: "Estimate Sent" },
  { value: "new_lead", label: "New Lead" },
  { value: "after_booking", label: "After Booking" },
];

function triggerLabel(trigger: string): string {
  const match = TRIGGER_OPTIONS.find((t) => t.value === trigger);
  return match?.label ?? trigger;
}

function TriggerIcon({ trigger }: { trigger: string }) {
  switch (trigger) {
    case "job_completed": return <Briefcase className="h-4 w-4" />;
    case "estimate_sent": return <FileText className="h-4 w-4" />;
    case "new_lead": return <UserPlus className="h-4 w-4" />;
    case "after_booking": return <CalendarCheck className="h-4 w-4" />;
    default: return <Zap className="h-4 w-4" />;
  }
}

function StepIcon({ type }: { type: string }) {
  switch (type) {
    case "sms": return <MessageSquare className="h-3.5 w-3.5 text-green-600" />;
    case "email": return <Mail className="h-3.5 w-3.5 text-blue-600" />;
    case "delay": return <Clock className="h-3.5 w-3.5 text-orange-500" />;
    default: return <Zap className="h-3.5 w-3.5 text-gray-400" />;
  }
}

function stepBg(type: string): string {
  switch (type) {
    case "sms": return "bg-green-50 border-green-200";
    case "email": return "bg-blue-50 border-blue-200";
    case "delay": return "bg-orange-50 border-orange-200";
    default: return "bg-gray-50 border-gray-200";
  }
}

function stepLabel(step: ApiStep): string {
  if (step.type === "delay" && step.delayHours != null) {
    if (step.delayHours >= 24) {
      const days = Math.floor(step.delayHours / 24);
      return `Wait ${days} day${days !== 1 ? "s" : ""}`;
    }
    return `Wait ${step.delayHours} hour${step.delayHours !== 1 ? "s" : ""}`;
  }
  return step.content || `${step.type} step`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SequencesPage() {
  const [sequences, setSequences] = useState<ApiSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState<TriggerType>("job_completed");

  const fetchSequences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketing/sequences");
      if (res.ok) {
        const data = await res.json();
        setSequences(data.sequences ?? []);
      }
    } catch (err) {
      console.error("Error fetching sequences:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSequences();
  }, [fetchSequences]);

  async function handleToggle(id: string, currentActive: boolean) {
    try {
      await fetch("/api/marketing/sequences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      setSequences((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !currentActive } : s))
      );
    } catch (err) {
      console.error("Error toggling sequence:", err);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketing/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), trigger: newTrigger }),
      });
      if (res.ok) {
        setNewName("");
        setNewTrigger("job_completed");
        setShowModal(false);
        fetchSequences();
      }
    } catch (err) {
      console.error("Error creating sequence:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Automated Sequences</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sequence
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : sequences.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
          <Zap className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-600">No sequences yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Create automated follow-up sequences to engage customers.
          </p>
          <Button className="mt-4" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Sequence
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sequences.map((seq) => (
            <Card key={seq.id} className="overflow-hidden">
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Zap className={`h-5 w-5 shrink-0 ${seq.isActive ? "text-purple-600" : "text-gray-400"}`} />
                      <h3 className="text-base font-semibold text-gray-900 truncate">{seq.name}</h3>
                      <Badge color={seq.isActive ? "green" : "gray"} dot>
                        {seq.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <TriggerIcon trigger={seq.trigger} />
                        Trigger: {triggerLabel(seq.trigger)}
                      </span>
                      <span>{seq.steps.length} step{seq.steps.length !== 1 && "s"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(seq.id, seq.isActive)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      seq.isActive
                        ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {seq.isActive ? (
                      <><Power className="h-4 w-4" /> On</>
                    ) : (
                      <><PowerOff className="h-4 w-4" /> Off</>
                    )}
                  </button>
                </div>

                {/* Visual sequence flow */}
                <div className="overflow-x-auto">
                  <div className="flex items-center gap-1 py-2 min-w-max">
                    {seq.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-1">
                        <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium ${stepBg(step.type)}`}>
                          <StepIcon type={step.type} />
                          <span className="whitespace-nowrap">{stepLabel(step)}</span>
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
      )}

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
            <p className="mb-1.5 block text-sm font-medium text-gray-700">Default Steps</p>
            <p className="text-sm text-gray-500">
              A starter 3-step sequence will be created. You can customize steps after creation.
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
            <Button onClick={handleCreate} disabled={!newName.trim() || submitting}>
              {submitting ? "Creating..." : "Create Sequence"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
