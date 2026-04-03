"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const SOURCE_OPTIONS = [
  { value: "", label: "Select a source..." },
  { value: "google", label: "Google" },
  { value: "referral", label: "Referral" },
  { value: "facebook", label: "Facebook" },
  { value: "website", label: "Website" },
  { value: "yard_sign", label: "Yard Sign" },
  { value: "door_hanger", label: "Door Hanger" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "active", label: "Active" },
];

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  general?: string;
}

export default function NewClientPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    source: "",
    status: "lead",
    tags: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ general: data.error || "Failed to create client" });
        return;
      }

      router.push("/clients");
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {errors.general && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            {/* Two-column layout: Contact & Address */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left column */}
              <div className="space-y-4">
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <Input
                  label="Address"
                  name="address"
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={handleChange}
                />
                <Input
                  label="City"
                  name="city"
                  placeholder="Springfield"
                  value={formData.city}
                  onChange={handleChange}
                />
                <Input
                  label="State"
                  name="state"
                  placeholder="IL"
                  value={formData.state}
                  onChange={handleChange}
                />
                <Input
                  label="ZIP"
                  name="zip"
                  placeholder="62701"
                  value={formData.zip}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Source & Status row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Select
                label="Source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                options={SOURCE_OPTIONS}
              />
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={STATUS_OPTIONS}
              />
            </div>

            {/* Tags */}
            <Input
              label="Tags"
              name="tags"
              placeholder="vip, residential, commercial (comma-separated)"
              value={formData.tags}
              onChange={handleChange}
              hint="Separate multiple tags with commas"
            />

            {/* Notes */}
            <Textarea
              label="Notes"
              name="notes"
              placeholder="Any additional notes about this client..."
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/clients")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting}>
                {submitting ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
