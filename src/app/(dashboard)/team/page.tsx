"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { cn, formatCurrency } from "@/lib/utils";
import {
  UserPlus,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Briefcase,
  Clock,
  DollarSign,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "employee" | "subcontractor";
  status: "online" | "offline";
  jobsCompleted: number;
  hoursThisWeek: number;
  revenueGenerated: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "1",
    firstName: "Marcus",
    lastName: "Rivera",
    email: "marcus@autopilot.io",
    phone: "5551234567",
    role: "employee",
    status: "online",
    jobsCompleted: 87,
    hoursThisWeek: 38,
    revenueGenerated: 24_350,
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah@autopilot.io",
    phone: "5559876543",
    role: "employee",
    status: "online",
    jobsCompleted: 64,
    hoursThisWeek: 32,
    revenueGenerated: 18_720,
  },
  {
    id: "3",
    firstName: "James",
    lastName: "Okafor",
    email: "james.okafor@email.com",
    phone: "5554567890",
    role: "subcontractor",
    status: "offline",
    jobsCompleted: 42,
    hoursThisWeek: 0,
    revenueGenerated: 12_800,
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Nguyen",
    email: "emily.nguyen@email.com",
    phone: "5553216549",
    role: "subcontractor",
    status: "online",
    jobsCompleted: 29,
    hoursThisWeek: 18,
    revenueGenerated: 9_450,
  },
  {
    id: "5",
    firstName: "David",
    lastName: "Kowalski",
    email: "david.k@autopilot.io",
    phone: "5558527413",
    role: "employee",
    status: "offline",
    jobsCompleted: 53,
    hoursThisWeek: 0,
    revenueGenerated: 15_200,
  },
];

const ROLE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Employees", value: "employee" },
  { label: "Subcontractors", value: "subcontractor" },
] as const;

const ROLE_BADGE_COLOR: Record<string, BadgeColor> = {
  employee: "blue",
  subcontractor: "purple",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  const n = d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
  if (n.length !== 10) return phone;
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  // Add member form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "employee" as "employee" | "subcontractor",
  });

  const filteredMembers =
    roleFilter === "all"
      ? members
      : members.filter((m) => m.role === roleFilter);

  const handleAddMember = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      return;
    }

    const newMember: TeamMember = {
      id: String(Date.now()),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: "offline",
      jobsCompleted: 0,
      hoursThisWeek: 0,
      revenueGenerated: 0,
    };

    setMembers((prev) => [...prev, newMember]);
    setForm({ firstName: "", lastName: "", email: "", phone: "", role: "employee" });
    setModalOpen(false);
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Role filter */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {ROLE_FILTERS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setRoleFilter(tab.value)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
              roleFilter === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Member cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            {/* Card header */}
            <div className="flex items-start gap-4 px-5 pt-5 pb-4">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {getInitials(member.firstName, member.lastName)}
                </div>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                    member.status === "online" ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {member.firstName} {member.lastName}
                  </h3>
                  <Badge color={ROLE_BADGE_COLOR[member.role]} className="shrink-0">
                    {member.role === "employee" ? "Employee" : "Subcontractor"}
                  </Badge>
                </div>
                <div className="mt-1 space-y-0.5">
                  <p className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {member.email}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {formatPhone(member.phone)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px border-t border-gray-100 bg-gray-100">
              <div className="flex flex-col items-center bg-white py-3">
                <Briefcase className="mb-1 h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {member.jobsCompleted}
                </span>
                <span className="text-[10px] text-gray-500">Jobs</span>
              </div>
              <div className="flex flex-col items-center bg-white py-3">
                <Clock className="mb-1 h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {member.hoursThisWeek}h
                </span>
                <span className="text-[10px] text-gray-500">This Week</span>
              </div>
              <div className="flex flex-col items-center bg-white py-3">
                <DollarSign className="mb-1 h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(member.revenueGenerated)}
                </span>
                <span className="text-[10px] text-gray-500">Revenue</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3 bg-gray-50/50">
              <Button variant="ghost" size="sm">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleRemove(member.id)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <p className="text-sm font-medium text-gray-900">No team members found</p>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filter or add a new member.
          </p>
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Team Member"
        description="Fill in the details below to add a new member to your team."
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddMember();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Jane"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              required
            />
            <Input
              label="Last Name"
              placeholder="Smith"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="jane@company.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                role: e.target.value as "employee" | "subcontractor",
              }))
            }
            options={[
              { value: "employee", label: "Employee" },
              { value: "subcontractor", label: "Subcontractor" },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
