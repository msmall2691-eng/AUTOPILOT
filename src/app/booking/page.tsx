"use client";

import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServiceOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface BookingFormData {
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface BookingConfirmation {
  bookingId: string;
  customerName: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SERVICES: ServiceOption[] = [
  {
    id: "junk-removal",
    name: "Junk Removal",
    icon: "🚛",
    description: "Furniture, appliances, yard waste & more",
  },
  {
    id: "gutter-cleaning",
    name: "Gutter Cleaning",
    icon: "🏠",
    description: "Full gutter cleaning & downspout flush",
  },
  {
    id: "power-washing",
    name: "Power Washing",
    icon: "💦",
    description: "Driveways, decks, siding & walkways",
  },
  {
    id: "landscaping",
    name: "Landscaping",
    icon: "🌿",
    description: "Mowing, trimming, mulching & design",
  },
  {
    id: "moving",
    name: "Moving",
    icon: "📦",
    description: "Local moves, loading & unloading",
  },
  {
    id: "general-cleaning",
    name: "General Cleaning",
    icon: "✨",
    description: "Interior deep cleaning & organizing",
  },
];

const STEPS = ["Service", "Date & Time", "Your Info", "Confirm"];

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 8; hour < 17; hour++) {
    const h = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? "PM" : "AM";
    slots.push(`${h}:00 ${ampm}`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function generateAvailableDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  // Start from tomorrow, provide 14 days
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Skip Sundays
    if (d.getDay() === 0) continue;
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, idx) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                idx < current
                  ? "bg-blue-600 text-white"
                  : idx === current
                    ? "bg-blue-600 text-white ring-4 ring-blue-200"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {idx < current ? "✓" : idx + 1}
            </div>
            <span
              className={`text-xs mt-1 hidden sm:block ${
                idx <= current ? "text-blue-700 font-medium" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-8 sm:w-16 h-0.5 mb-4 sm:mb-0 ${
                idx < current ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function StepService({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Select a Service
      </h2>
      <p className="text-gray-500 mb-6">
        Choose the service you need. We&apos;ll take care of the rest.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((svc) => (
          <button
            key={svc.id}
            type="button"
            onClick={() => onSelect(svc.id)}
            className={`p-5 rounded-xl border-2 text-left transition-all hover:shadow-md ${
              selected === svc.id
                ? "border-blue-600 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <span className="text-3xl">{svc.icon}</span>
            <h3 className="font-semibold text-gray-900 mt-3">{svc.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{svc.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepDateTime({
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  date: string;
  time: string;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
}) {
  const dates = useMemo(generateAvailableDates, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Choose Date &amp; Time
      </h2>
      <p className="text-gray-500 mb-6">
        Pick a day and time that works best for you.
      </p>

      {/* Date picker */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Available Dates
        </label>
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDateChange(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                date === d
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {formatDate(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Available Time Slots
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => onTimeChange(slot)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                time === slot
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepInfo({
  form,
  onChange,
}: {
  form: BookingFormData;
  onChange: (field: keyof BookingFormData, value: string) => void;
}) {
  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400";

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Your Information
      </h2>
      <p className="text-gray-500 mb-6">
        Tell us how to reach you and where the job is.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Jane Smith"
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="jane@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="123 Main St, Springfield, IL 62701"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes / Special Requests
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Anything we should know before arriving?"
            rows={3}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

function StepConfirm({ form }: { form: BookingFormData }) {
  const service = SERVICES.find((s) => s.id === form.service);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Review &amp; Confirm
      </h2>
      <p className="text-gray-500 mb-6">
        Please double-check everything before submitting.
      </p>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <Row label="Service" value={service?.name ?? form.service} />
        <Row label="Date" value={formatDate(form.date)} />
        <Row label="Time" value={form.time} />
        <hr className="border-gray-200" />
        <Row label="Name" value={form.name} />
        {form.email && <Row label="Email" value={form.email} />}
        <Row label="Phone" value={form.phone} />
        {form.address && <Row label="Address" value={form.address} />}
        {form.notes && <Row label="Notes" value={form.notes} />}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

function SuccessScreen({ confirmation }: { confirmation: BookingConfirmation }) {
  const service = SERVICES.find((s) => s.id === confirmation.serviceType);

  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Booking Confirmed!
      </h2>
      <p className="text-gray-500 mb-6">
        Your booking reference is{" "}
        <span className="font-mono font-semibold text-blue-600">
          {confirmation.bookingId.slice(0, 8).toUpperCase()}
        </span>
      </p>

      <div className="bg-gray-50 rounded-xl p-6 text-left space-y-3 max-w-sm mx-auto">
        <Row
          label="Service"
          value={service?.name ?? confirmation.serviceType}
        />
        <Row label="Date" value={formatDate(confirmation.preferredDate)} />
        <Row label="Time" value={confirmation.preferredTime} />
        <Row label="Name" value={confirmation.customerName} />
      </div>

      <p className="text-sm text-gray-400 mt-6">
        We&apos;ll send you a confirmation shortly. Thank you for choosing
        Steezy Hauling!
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingFormData>({
    service: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] =
    useState<BookingConfirmation | null>(null);

  const updateField = (field: keyof BookingFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return !!form.service;
      case 1:
        return !!form.date && !!form.time;
      case 2:
        return !!form.name.trim() && !!form.phone.trim();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canAdvance()) {
      const messages = [
        "Please select a service to continue.",
        "Please choose both a date and time.",
        "Name and phone number are required.",
      ];
      setError(messages[step] ?? "");
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: form.service,
          preferredDate: form.date,
          preferredTime: form.time,
          customerName: form.name.trim(),
          customerEmail: form.email.trim() || undefined,
          customerPhone: form.phone.trim(),
          customerAddress: form.address.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      const data = await res.json();
      setConfirmation(data.booking);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Branding Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Steezy Hauling
        </h1>
        <p className="text-blue-100 mt-1 text-sm sm:text-base">
          Fast, professional service you can count on
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
        {confirmation ? (
          <SuccessScreen confirmation={confirmation} />
        ) : (
          <>
            <ProgressIndicator current={step} />

            {/* Step content */}
            {step === 0 && (
              <StepService
                selected={form.service}
                onSelect={(id) => {
                  updateField("service", id);
                  // Auto-advance on select for snappy UX
                  setStep(1);
                }}
              />
            )}
            {step === 1 && (
              <StepDateTime
                date={form.date}
                time={form.time}
                onDateChange={(v) => updateField("date", v)}
                onTimeChange={(v) => updateField("time", v)}
              />
            )}
            {step === 2 && (
              <StepInfo form={form} onChange={updateField} />
            )}
            {step === 3 && <StepConfirm form={form} />}

            {/* Error */}
            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                >
                  &larr; Back
                </button>
              ) : (
                <span />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canAdvance()}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {submitting && (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {submitting ? "Submitting..." : "Confirm Booking"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-blue-200 text-xs mt-6">
        &copy; {new Date().getFullYear()} Steezy Hauling &mdash; Powered by
        Autopilot
      </p>
    </div>
  );
}
