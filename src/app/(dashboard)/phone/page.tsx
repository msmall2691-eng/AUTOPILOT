"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { cn, formatPhone } from "@/lib/utils";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Mic,
  Clock,
  Play,
  Pause,
  Delete,
  Voicemail,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CallDirection = "inbound" | "outbound" | "missed";

interface ApiCallLog {
  id: string;
  direction: string;
  fromNumber: string;
  toNumber: string;
  duration: number | null;
  status: string;
  recordingUrl: string | null;
  transcript: string | null;
  notes: string | null;
  createdAt: string;
  client: { id: string; firstName: string; lastName: string } | null;
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------
const FILTER_TABS = [
  { label: "All Calls", value: "all" },
  { label: "Inbound", value: "inbound" },
  { label: "Outbound", value: "outbound" },
  { label: "Missed", value: "missed" },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDuration(seconds: number): string {
  if (seconds === 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (isToday) return time;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${time}`;
}

function directionIcon(dir: string, className?: string) {
  switch (dir) {
    case "inbound":
      return <PhoneIncoming className={cn("h-4 w-4 text-green-600", className)} />;
    case "outbound":
      return <PhoneOutgoing className={cn("h-4 w-4 text-blue-600", className)} />;
    default:
      return <PhoneMissed className={cn("h-4 w-4 text-red-500", className)} />;
  }
}

function directionBadge(dir: string) {
  const map: Record<string, { label: string; color: "green" | "blue" | "red" }> = {
    inbound: { label: "Inbound", color: "green" },
    outbound: { label: "Outbound", color: "blue" },
    missed: { label: "Missed", color: "red" },
  };
  const cfg = map[dir] ?? map.missed;
  return (
    <Badge color={cfg.color} dot>
      {cfg.label}
    </Badge>
  );
}

function getEffectiveDirection(call: ApiCallLog): string {
  if (call.status === "missed") return "missed";
  return call.direction;
}

function getContactName(call: ApiCallLog): string | null {
  if (call.client) return `${call.client.firstName} ${call.client.lastName}`;
  return null;
}

function getPhoneNumber(call: ApiCallLog): string {
  return call.direction === "inbound" ? call.fromNumber : call.toNumber;
}

// ---------------------------------------------------------------------------
// Dialpad button
// ---------------------------------------------------------------------------
function DialButton({ label, sub, onClick }: { label: string; sub?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      <span className="text-lg font-semibold leading-none">{label}</span>
      {sub && <span className="mt-0.5 text-[10px] uppercase leading-none text-gray-400">{sub}</span>}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function PhonePage() {
  const [calls, setCalls] = useState<ApiCallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [dialInput, setDialInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/phone?direction=${filter}`);
      if (res.ok) {
        const data = await res.json();
        const callList = data.calls ?? [];
        setCalls(callList);
        if (!selectedCallId && callList.length > 0) {
          setSelectedCallId(callList[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching calls:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const selectedCall = calls.find((c) => c.id === selectedCallId) ?? null;

  const totalCalls = calls.length;
  const missedCalls = calls.filter((c) => c.status === "missed").length;
  const answeredCalls = calls.filter((c) => (c.duration ?? 0) > 0);
  const avgDuration =
    answeredCalls.length > 0
      ? Math.round(answeredCalls.reduce((sum, c) => sum + (c.duration ?? 0), 0) / answeredCalls.length)
      : 0;

  const dialpadKeys: { label: string; sub?: string }[] = [
    { label: "1", sub: "" },
    { label: "2", sub: "abc" },
    { label: "3", sub: "def" },
    { label: "4", sub: "ghi" },
    { label: "5", sub: "jkl" },
    { label: "6", sub: "mno" },
    { label: "7", sub: "pqrs" },
    { label: "8", sub: "tuv" },
    { label: "9", sub: "wxyz" },
    { label: "*", sub: "" },
    { label: "0", sub: "+" },
    { label: "#", sub: "" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Phone System</h1>
        <Badge color="green" dot>
          System Online
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard icon={Phone} label="Total Calls" value={totalCalls} />
        <StatsCard icon={Clock} label="Avg Duration" value={formatDuration(avgDuration)} />
        <StatsCard icon={PhoneMissed} label="Missed Calls" value={missedCalls} />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              filter === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Recent calls */}
          <div className="lg:col-span-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[540px] divide-y divide-gray-100 overflow-y-auto">
                  {calls.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm text-gray-500">
                      No calls match this filter.
                    </p>
                  ) : (
                    calls.map((call) => {
                      const dir = getEffectiveDirection(call);
                      const contactName = getContactName(call);
                      const phoneNumber = getPhoneNumber(call);
                      return (
                        <button
                          key={call.id}
                          type="button"
                          onClick={() => setSelectedCallId(call.id)}
                          className={cn(
                            "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                            selectedCallId === call.id && "bg-blue-50 hover:bg-blue-50"
                          )}
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                            {directionIcon(dir)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn("truncate text-sm font-medium", dir === "missed" ? "text-red-600" : "text-gray-900")}>
                                {contactName || formatPhone(phoneNumber)}
                              </p>
                              <span className="shrink-0 text-xs text-gray-400">
                                {formatTimestamp(call.createdAt)}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                              <span>{formatPhone(phoneNumber)}</span>
                              {(call.duration ?? 0) > 0 && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span>{formatDuration(call.duration!)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center: Dialpad */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Dialpad</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4">
                  <span className="truncate text-lg font-mono font-medium text-gray-900">
                    {dialInput ? (dialInput.length === 10 ? formatPhone(dialInput) : dialInput) : "\u00A0"}
                  </span>
                  {dialInput && (
                    <button
                      type="button"
                      onClick={() => setDialInput((prev) => prev.slice(0, -1))}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <Delete className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {dialpadKeys.map((key) => (
                    <DialButton
                      key={key.label}
                      label={key.label}
                      sub={key.sub || undefined}
                      onClick={() => setDialInput((prev) => prev + key.label)}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="primary" size="lg" className="h-14 w-14 rounded-full bg-green-600 p-0 hover:bg-green-700">
                    <Phone className="h-6 w-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Call details */}
          <div className="lg:col-span-5">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Call Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCall ? (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {getContactName(selectedCall) || "Unknown Caller"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPhone(getPhoneNumber(selectedCall))}
                        </p>
                      </div>
                      {directionBadge(getEffectiveDirection(selectedCall))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Duration</p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-900">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {(selectedCall.duration ?? 0) > 0 ? formatDuration(selectedCall.duration!) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Time</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                          {formatTimestamp(selectedCall.createdAt)}
                        </p>
                      </div>
                    </div>

                    {selectedCall.recordingUrl && (
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase text-gray-400">Recording</p>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <button
                            type="button"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                          </button>
                          <div className="flex-1">
                            <div className="h-1.5 w-full rounded-full bg-gray-200">
                              <div className="h-1.5 rounded-full bg-blue-600 transition-all" style={{ width: isPlaying ? "45%" : "0%" }} />
                            </div>
                            <div className="mt-1 flex justify-between text-xs text-gray-400">
                              <span>{isPlaying ? "2:33" : "0:00"}</span>
                              <span>{formatDuration(selectedCall.duration ?? 0)}</span>
                            </div>
                          </div>
                          <Mic className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}

                    {selectedCall.transcript && (
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase text-gray-400">Transcript</p>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <p className="text-sm leading-relaxed text-gray-700">{selectedCall.transcript}</p>
                        </div>
                      </div>
                    )}

                    {selectedCall.notes && (
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase text-gray-400">Notes</p>
                        <div className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-sm text-gray-700">{selectedCall.notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="primary" size="sm">
                        <Phone className="mr-1.5 h-3.5 w-3.5" />
                        Call Back
                      </Button>
                      <Button variant="outline" size="sm">
                        <Voicemail className="mr-1.5 h-3.5 w-3.5" />
                        Send to Voicemail
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Phone className="mb-3 h-10 w-10" />
                    <p className="text-sm">Select a call to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
