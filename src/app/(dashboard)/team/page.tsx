"use client";

import { useState, useEffect, useCallback } from "react";
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
// API response type
// ---------------------------------------------------------------------------

interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  color: string | null;
  createdAt: string;
  jobStats?: {
    completedCount?: number;
    totalAmount?: number;
  };
}

function mapApiUserToMember(user: ApiUser): TeamMember {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? "",
    role: (user.role === "subcontractor" ? "subcontractor" : "employee") as "employee" | "subcontractor",
    status: "offline",
    jobsCompleted: user.jobStats?.completedCount ?? 0,
    hoursThisWeek: 0,
    revenueGenerated: user.jobStats?.totalAmount ?? 0,
  };
}

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
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      if (!res.ok) throw new Error("Failed to fetch team members");
      const data = await res.json();
      setMembers((data.team ?? data.users ?? []).map(mapApiUserToMember));
    } catch (err) {
      console.error("Error fetching team members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers =
    roleFilter === "all"
      ? members
      : members.filter((m) => m.role === roleFilter);

  const handleAddMember = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      return;
    }

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
        }),
      });

      if (!res.ok) throw new Error("Failed to add team member");

      const data = await res.json();
      setMembers((prev) => [...prev, mapApiUserToMember(data.user ?? data)]);
      setForm({ firstName: "", lastName: "", email: "", phone: "", role: "employee" });
      setModalOpen(false);
    } catch (err) {
      console.error("Error adding team member:", err);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch("/api/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      if (!res.ok) throw new Error("Failed to remove team member");

      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error removing team member:", err);
    }
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

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      )}

      {/* Member cards grid */}
      {!loading && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>}

      {!loading && filteredMembers.length === 0 && (
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
