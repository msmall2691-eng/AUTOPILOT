"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  Bed,
  Key,
  Wifi,
  Clock,
  Plus,
  Trash2,
  GripVertical,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChecklistTask {
  id: number;
  category: string;
  text: string;
  completed: boolean;
}

type ConnectionStatus = "idle" | "testing" | "success" | "error";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PROPERTY_TYPE_OPTIONS = [
  { value: "", label: "Select platform..." },
  { value: "airbnb", label: "Airbnb" },
  { value: "vrbo", label: "VRBO" },
  { value: "booking", label: "Booking.com" },
  { value: "direct", label: "Direct" },
];

const CHECKLIST_CATEGORIES = [
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "living_area", label: "Living Area" },
  { value: "exterior", label: "Exterior" },
  { value: "supplies", label: "Supplies" },
];

const ICAL_PLATFORM_OPTIONS = [
  { value: "", label: "Select platform..." },
  { value: "airbnb", label: "Airbnb" },
  { value: "vrbo", label: "VRBO" },
  { value: "booking", label: "Booking.com" },
  { value: "guesty", label: "Guesty" },
  { value: "hospitable", label: "Hospitable" },
];

const DEFAULT_CHECKLIST_TASKS: ChecklistTask[] = [
  { id: 1, category: "bedroom", text: "Strip and remake all beds with fresh linens", completed: false },
  { id: 2, category: "bedroom", text: "Vacuum/mop floors and under beds", completed: false },
  { id: 3, category: "bedroom", text: "Dust nightstands, dressers, and lamps", completed: false },
  { id: 4, category: "bathroom", text: "Scrub and disinfect toilet, sink, and shower/tub", completed: false },
  { id: 5, category: "bathroom", text: "Replace towels and bath mat", completed: false },
  { id: 6, category: "bathroom", text: "Restock toiletries (soap, shampoo, toilet paper)", completed: false },
  { id: 7, category: "kitchen", text: "Run and empty dishwasher", completed: false },
  { id: 8, category: "kitchen", text: "Wipe down all countertops and appliances", completed: false },
  { id: 9, category: "kitchen", text: "Clean inside microwave and oven", completed: false },
  { id: 10, category: "kitchen", text: "Check and restock coffee, tea, and basic supplies", completed: false },
  { id: 11, category: "living_area", text: "Vacuum carpets and mop hard floors", completed: false },
  { id: 12, category: "living_area", text: "Wipe down all surfaces and remote controls", completed: false },
  { id: 13, category: "living_area", text: "Arrange pillows and fold throws", completed: false },
  { id: 14, category: "exterior", text: "Sweep porch/patio and wipe outdoor furniture", completed: false },
  { id: 15, category: "exterior", text: "Take out all trash and replace liners", completed: false },
  { id: 16, category: "supplies", text: "Check HVAC filter and thermostat setting", completed: false },
  { id: 17, category: "supplies", text: "Verify Wi-Fi is working and password visible", completed: false },
  { id: 18, category: "supplies", text: "Leave welcome note and check guest guide", completed: false },
];

let taskIdCounter = 100;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function NewPropertyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Property Info
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [propertyType, setPropertyType] = useState("");

  // Details
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [cleaningFee, setCleaningFee] = useState("");

  // Access Information
  const [doorCode, setDoorCode] = useState("");
  const [lockboxCode, setLockboxCode] = useState("");
  const [wifiName, setWifiName] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [parkingInfo, setParkingInfo] = useState("");

  // Host Contact
  const [hostName, setHostName] = useState("");
  const [hostPhone, setHostPhone] = useState("");
  const [hostEmail, setHostEmail] = useState("");

  // Schedule
  const [defaultCheckIn, setDefaultCheckIn] = useState("15:00");
  const [defaultCheckOut, setDefaultCheckOut] = useState("11:00");

  // Calendar Sync
  const [icalPlatform, setIcalPlatform] = useState("");
  const [icalUrl, setIcalUrl] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");

  // Checklist
  const [checklistTasks, setChecklistTasks] = useState<ChecklistTask[]>(DEFAULT_CHECKLIST_TASKS);
  const [newTaskCategory, setNewTaskCategory] = useState("bedroom");
  const [newTaskText, setNewTaskText] = useState("");

  // Special Instructions & Supply Location
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [supplyLocation, setSupplyLocation] = useState("");

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleTestConnection = async () => {
    if (!icalUrl.trim()) return;
    setConnectionStatus("testing");
    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const isValid =
      icalUrl.includes("airbnb.com") ||
      icalUrl.includes("vrbo.com") ||
      icalUrl.includes("booking.com") ||
      icalUrl.startsWith("https://");
    setConnectionStatus(isValid ? "success" : "error");
  };

  const addChecklistTask = () => {
    if (!newTaskText.trim()) return;
    setChecklistTasks((prev) => [
      ...prev,
      {
        id: taskIdCounter++,
        category: newTaskCategory,
        text: newTaskText.trim(),
        completed: false,
      },
    ]);
    setNewTaskText("");
  };

  const removeChecklistTask = (id: number) => {
    setChecklistTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleChecklistTask = (id: number) => {
    setChecklistTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setGeneralError(null);

    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        propertyType,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        squareFeet: parseInt(squareFeet) || undefined,
        cleaningFee: parseFloat(cleaningFee) || undefined,
        doorCode: doorCode.trim() || undefined,
        lockboxCode: lockboxCode.trim() || undefined,
        wifiName: wifiName.trim() || undefined,
        wifiPassword: wifiPassword.trim() || undefined,
        parkingInfo: parkingInfo.trim() || undefined,
        hostName: hostName.trim() || undefined,
        hostPhone: hostPhone.trim() || undefined,
        hostEmail: hostEmail.trim() || undefined,
        defaultCheckIn,
        defaultCheckOut,
        icalPlatform: icalPlatform || undefined,
        icalUrl: icalUrl.trim() || undefined,
        checklistTasks: checklistTasks.map((t) => ({
          category: t.category,
          text: t.text,
        })),
        specialInstructions: specialInstructions.trim() || undefined,
        supplyLocation: supplyLocation.trim() || undefined,
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setGeneralError(data.error || "Failed to create property");
        return;
      }

      router.push("/properties");
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const categoryLabel = (value: string) =>
    CHECKLIST_CATEGORIES.find((c) => c.value === value)?.label ?? value;

  // Group checklist tasks by category for display
  const groupedTasks = checklistTasks.reduce<Record<string, ChecklistTask[]>>(
    (acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add Rental Property</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {generalError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {generalError}
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* Property Info */}
          {/* ----------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-gray-500" />
                Property Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Property Name"
                    name="name"
                    placeholder="e.g. Oceanview Beach House"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Select
                    label="Property Type"
                    name="propertyType"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    options={PROPERTY_TYPE_OPTIONS}
                  />
                </div>
                <Input
                  label="Address"
                  name="address"
                  placeholder="742 Shoreline Dr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="col-span-2 md:col-span-2">
                    <Input
                      label="City"
                      name="city"
                      placeholder="Santa Monica"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="State"
                    name="state"
                    placeholder="CA"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                  <Input
                    label="ZIP"
                    name="zip"
                    placeholder="90401"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* Details */}
          {/* ----------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-gray-500" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Input
                  label="Bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  placeholder="3"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                />
                <Input
                  label="Bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="2"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                />
                <Input
                  label="Square Feet"
                  name="squareFeet"
                  type="number"
                  min="0"
                  placeholder="1200"
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(e.target.value)}
                />
                <Input
                  label="Cleaning Fee"
                  name="cleaningFee"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="150.00"
                  value={cleaningFee}
                  onChange={(e) => setCleaningFee(e.target.value)}
                  hint="Amount charged to guests"
                />
              </div>
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* Access Information */}
          {/* ----------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-gray-500" />
                Access Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Door Code"
                    name="doorCode"
                    placeholder="1234#"
                    value={doorCode}
                    onChange={(e) => setDoorCode(e.target.value)}
                  />
                  <Input
                    label="Lockbox Code"
                    name="lockboxCode"
                    placeholder="5678"
                    value={lockboxCode}
                    onChange={(e) => setLockboxCode(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="WiFi Name"
                    name="wifiName"
                    placeholder="BeachHouse-Guest"
                    value={wifiName}
                    onChange={(e) => setWifiName(e.target.value)}
                  />
                  <Input
                    label="WiFi Password"
                    name="wifiPassword"
                    placeholder="welcome2024"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                  />
                </div>
                <Textarea
                  label="Parking Info"
                  name="parkingInfo"
                  placeholder="Garage code 4455. Two spots available in driveway..."
                  value={parkingInfo}
                  onChange={(e) => setParkingInfo(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* Host Contact */}
          {/* ----------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-gray-500" />
                Host Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  label="Host Name"
                  name="hostName"
                  placeholder="Jane Doe"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                />
                <Input
                  label="Phone"
                  name="hostPhone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={hostPhone}
                  onChange={(e) => setHostPhone(e.target.value)}
                />
                <Input
                  label="Email"
                  name="hostEmail"
                  type="email"
                  placeholder="host@example.com"
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* Schedule */}
          {/* ----------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Default Check-in Time"
                  name="defaultCheckIn"
                  type="time"
                  value={defaultCheckIn}
                  onChange={(e) => setDefaultCheckIn(e.target.value)}
                />
                <Input
                  label="Default Check-out Time"
                  name="defaultCheckOut"
                  type="time"
                  value={defaultCheckOut}
                  onChange={(e) => setDefaultCheckOut(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* Calendar Sync (iCal) */}
          {/* ----------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-gray-500" />
                Calendar Sync (iCal)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Paste the iCal calendar link from your rental platform. Maidily
                  will automatically detect guest checkouts and create cleaning
                  jobs.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Select
                    label="Platform"
                    name="icalPlatform"
                    value={icalPlatform}
                    onChange={(e) => setIcalPlatform(e.target.value)}
                    options={ICAL_PLATFORM_OPTIONS}
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="iCal Feed URL"
                      name="icalUrl"
                      type="url"
                      placeholder="https://www.airbnb.com/calendar/ical/12345.ics"
                      value={icalUrl}
                      onChange={(e) => {
                        setIcalUrl(e.target.value);
                        if (connectionStatus !== "idle") setConnectionStatus("idle");
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={!icalUrl.trim() || connectionStatus === "testing"}
                    isLoading={connectionStatus === "testing"}
                  >
                    {connectionStatus === "testing"
                      ? "Testing..."
                      : "Test Connection"}
                  </Button>

                  {connectionStatus === "success" && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Connection successful
                    </span>
                  )}
                  {connectionStatus === "error" && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      Could not connect. Check the URL and try again.
                    </span>
                  )}
                </div>

                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Supported Platforms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Airbnb", "VRBO", "Booking.com", "Guesty", "Hospitable"].map(
                      (p) => (
                        <span
                          key={p}
                          className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200"
                        >
                          {p}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* Checklist */}
          {/* ----------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gray-500" />
                Default Turnover Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add new task */}
                <div className="flex items-end gap-3">
                  <div className="w-40 shrink-0">
                    <Select
                      label="Category"
                      name="newTaskCategory"
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      options={CHECKLIST_CATEGORIES}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Task"
                      name="newTaskText"
                      placeholder="e.g. Check smoke detectors"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addChecklistTask();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={addChecklistTask}
                    disabled={!newTaskText.trim()}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>

                {/* Task list grouped by category */}
                <div className="space-y-4">
                  {Object.entries(groupedTasks).map(([cat, tasks]) => (
                    <div key={cat}>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {categoryLabel(cat)}
                      </h4>
                      <div className="space-y-1">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <GripVertical className="h-4 w-4 shrink-0 text-gray-300 cursor-grab" />
                            <button
                              type="button"
                              onClick={() => toggleChecklistTask(task.id)}
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                                task.completed
                                  ? "border-green-500 bg-green-500 text-white"
                                  : "border-gray-300 bg-white hover:border-gray-400"
                              }`}
                            >
                              {task.completed && (
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                            <span
                              className={`flex-1 text-sm ${
                                task.completed
                                  ? "text-gray-400 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              {task.text}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeChecklistTask(task.id)}
                              className="rounded p-1 text-gray-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                              title="Remove task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {checklistTasks.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No checklist tasks yet. Add tasks above to build your
                    turnover checklist.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* Special Instructions & Supply Location */}
          {/* ----------------------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  label="Special Instructions"
                  name="specialInstructions"
                  placeholder="Any special cleaning instructions, areas to pay extra attention to, pet-friendly notes, etc."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={4}
                />
                <Textarea
                  label="Supply Location"
                  name="supplyLocation"
                  placeholder="Cleaning supplies are in the laundry closet next to the garage. Extra linens are in the hallway closet on the second floor."
                  value={supplyLocation}
                  onChange={(e) => setSupplyLocation(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* ----------------------------------------------------------------- */}
          {/* Form Actions */}
          {/* ----------------------------------------------------------------- */}
          <Card>
            <CardFooter>
              <div className="flex w-full items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/properties")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {submitting ? "Saving..." : "Save Property"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
