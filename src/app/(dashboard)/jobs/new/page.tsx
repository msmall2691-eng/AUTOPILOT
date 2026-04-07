"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ClientOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface ServiceOption {
  id: string;
  name: string;
  price: number;
}

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface LineItem {
  key: number;
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

interface FormErrors {
  clientId?: string;
  title?: string;
  scheduledDate?: string;
  general?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

let lineItemKeyCounter = 1;

function createEmptyLineItem(): LineItem {
  return {
    key: lineItemKeyCounter++,
    name: "",
    description: "",
    quantity: "1",
    unitPrice: "0",
  };
}

function computeLineTotal(item: LineItem): number {
  const qty = parseFloat(item.quantity) || 0;
  const price = parseFloat(item.unitPrice) || 0;
  return Math.round(qty * price * 100) / 100;
}

// ---------------------------------------------------------------------------
// Trash icon
// ---------------------------------------------------------------------------
function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NewJobPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" /></div>}>
      <NewJobForm />
    </Suspense>
  );
}

function NewJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Lookup data
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  // Form state
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState(searchParams.get("date") || "");
  const [scheduledTime, setScheduledTime] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [priority, setPriority] = useState("normal");
  const [internalNotes, setInternalNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([createEmptyLineItem()]);

  // Fetch lookup data on mount
  useEffect(() => {
    async function fetchLookups() {
      try {
        const [clientsRes, servicesRes, employeesRes] = await Promise.all([
          fetch("/api/clients?limit=100"),
          fetch("/api/services?limit=100"),
          fetch("/api/team?limit=100"),
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients ?? data ?? []);
        }
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(data.services ?? data ?? []);
        }
        if (employeesRes.ok) {
          const data = await employeesRes.json();
          setEmployees(data.team ?? data.users ?? data.employees ?? data ?? []);
        }
      } catch (err) {
        console.error("Error fetching lookup data:", err);
      }
    }
    fetchLookups();
  }, []);

  // Line item helpers
  const updateLineItem = (key: number, field: keyof LineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, createEmptyLineItem()]);
  };

  const removeLineItem = (key: number) => {
    setLineItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.key !== key);
    });
  };

  const total = lineItems.reduce((sum, item) => sum + computeLineTotal(item), 0);

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!clientId) newErrors.clientId = "Client is required";
    if (!title.trim()) newErrors.title = "Title is required";
    if (!scheduledDate) newErrors.scheduledDate = "Scheduled date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        clientId,
        serviceId: serviceId || undefined,
        assignedToId: assignedToId || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledDate,
        scheduledTime: scheduledTime || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        zip: zip.trim() || undefined,
        priority,
        internalNotes: internalNotes.trim() || undefined,
        lineItems: lineItems
          .filter((li) => li.name.trim() !== "")
          .map((li) => ({
            name: li.name.trim(),
            description: li.description.trim() || undefined,
            quantity: parseFloat(li.quantity) || 1,
            unitPrice: parseFloat(li.unitPrice) || 0,
          })),
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ general: data.error || "Failed to create job" });
        return;
      }

      router.push("/jobs");
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent>
            <div className="space-y-8 pt-2">
              {errors.general && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.general}
                </div>
              )}

              {/* Client, Service, Assigned Employee */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Select
                  label="Client"
                  name="clientId"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    if (errors.clientId) setErrors((prev) => ({ ...prev, clientId: undefined }));
                  }}
                  error={errors.clientId}
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Service"
                  name="serviceId"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                >
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Assigned Employee"
                  name="assignedToId"
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <Input
                  label="Title"
                  name="title"
                  placeholder="e.g. Lawn mowing - 123 Main St"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  error={errors.title}
                  required
                />
                <Textarea
                  label="Description"
                  name="description"
                  placeholder="Describe the work to be done..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Date, Time, Priority */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Input
                  label="Scheduled Date"
                  name="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => {
                    setScheduledDate(e.target.value);
                    if (errors.scheduledDate) setErrors((prev) => ({ ...prev, scheduledDate: undefined }));
                  }}
                  error={errors.scheduledDate}
                  required
                />
                <Input
                  label="Scheduled Time"
                  name="scheduledTime"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
                <Select
                  label="Priority"
                  name="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={PRIORITY_OPTIONS}
                />
              </div>

              {/* Address fields */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Job Location</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Input
                      label="Address"
                      name="address"
                      placeholder="123 Main St"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <Input
                    label="City"
                    name="city"
                    placeholder="Springfield"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="State"
                      name="state"
                      placeholder="IL"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                    <Input
                      label="ZIP"
                      name="zip"
                      placeholder="62701"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">Line Items</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addLineItem}
                  >
                    <PlusIcon className="mr-1 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Column headers */}
                  <div className="hidden md:grid md:grid-cols-[1fr_80px_100px_100px_40px] md:gap-3 md:px-1">
                    <span className="text-xs font-medium uppercase text-gray-500">Name</span>
                    <span className="text-xs font-medium uppercase text-gray-500">Qty</span>
                    <span className="text-xs font-medium uppercase text-gray-500">Unit Price</span>
                    <span className="text-xs font-medium uppercase text-gray-500 text-right">Total</span>
                    <span />
                  </div>

                  {lineItems.map((item) => (
                    <div
                      key={item.key}
                      className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-3 md:grid-cols-[1fr_80px_100px_100px_40px] md:items-center md:border-0 md:p-0"
                    >
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateLineItem(item.key, "name", e.target.value)}
                      />
                      <Input
                        placeholder="1"
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.key, "quantity", e.target.value)}
                      />
                      <Input
                        placeholder="0.00"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.key, "unitPrice", e.target.value)}
                      />
                      <div className="flex items-center justify-end text-sm font-medium text-gray-900">
                        {formatCurrency(computeLineTotal(item))}
                      </div>
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.key)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30"
                          disabled={lineItems.length <= 1}
                          title="Remove item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 flex items-center justify-end gap-4 border-t border-gray-200 pt-4">
                  <span className="text-sm font-semibold text-gray-700">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Internal notes */}
              <Textarea
                label="Internal Notes"
                name="internalNotes"
                placeholder="Notes visible only to your team..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter>
            <div className="flex w-full items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/jobs")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting}>
                {submitting ? "Creating..." : "Create Job"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
