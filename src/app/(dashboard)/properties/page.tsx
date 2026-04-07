"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import {
  Home,
  Bed,
  Bath,
  Clock,
  MapPin,
  RefreshCw,
  Plus,
  Wifi,
  Key,
  CalendarCheck,
  Building2,
  AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Platform = "airbnb" | "vrbo" | "booking" | "direct";
type SyncStatus = "active" | "error" | "paused";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  platform: Platform;
  bedrooms: number;
  bathrooms: number;
  lastCleaned: string | null;
  nextTurnover: string | null;
  syncStatus: SyncStatus;
  imageUrl?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PLATFORM_CONFIG: Record<
  Platform,
  { label: string; color: string; badgeColor: BadgeColor }
> = {
  airbnb: {
    label: "Airbnb",
    color: "bg-pink-100 text-pink-700 ring-pink-600/20",
    badgeColor: "red",
  },
  vrbo: {
    label: "VRBO",
    color: "bg-blue-100 text-blue-700 ring-blue-700/20",
    badgeColor: "blue",
  },
  booking: {
    label: "Booking.com",
    color: "bg-indigo-100 text-indigo-700 ring-indigo-700/20",
    badgeColor: "purple",
  },
  direct: {
    label: "Direct",
    color: "bg-gray-100 text-gray-600 ring-gray-500/20",
    badgeColor: "gray",
  },
};

const SYNC_STATUS_CONFIG: Record<
  SyncStatus,
  { label: string; dotClass: string }
> = {
  active: { label: "Synced", dotClass: "bg-green-500" },
  error: { label: "Sync Error", dotClass: "bg-red-500" },
  paused: { label: "Paused", dotClass: "bg-gray-400" },
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "airbnb", label: "Airbnb" },
  { value: "vrbo", label: "VRBO" },
  { value: "booking", label: "Booking.com" },
  { value: "direct", label: "Direct" },
];

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function countdownLabel(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------
interface ApiProperty {
  id: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  propertyType: string | null;
  bedrooms: number;
  bathrooms: number;
  isActive: boolean;
  icalFeeds?: { id: string; platform: string; feedUrl: string }[];
  turnovers?: {
    id: string;
    scheduledDate: string;
    completedAt: string | null;
    status: string;
  }[];
  [key: string]: unknown;
}

const VALID_PLATFORMS: Platform[] = ["airbnb", "vrbo", "booking", "direct"];

function toPlatform(raw: string | null | undefined): Platform {
  if (raw && VALID_PLATFORMS.includes(raw as Platform)) return raw as Platform;
  return "direct";
}

function mapApiProperty(api: ApiProperty): Property {
  // Determine sync status from icalFeeds and isActive
  let syncStatus: SyncStatus = "paused";
  if (api.isActive) {
    syncStatus = api.icalFeeds && api.icalFeeds.length > 0 ? "active" : "active";
  }

  // Derive turnover-related display data
  const now = new Date();
  const sortedTurnovers = (api.turnovers ?? [])
    .filter((t) => t.status !== "cancelled")
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime()
    );

  const lastCompleted = [...sortedTurnovers]
    .filter((t) => t.completedAt)
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() -
        new Date(a.completedAt!).getTime()
    )[0];

  const nextUpcoming = sortedTurnovers.find(
    (t) => new Date(t.scheduledDate) >= now && !t.completedAt
  );

  return {
    id: api.id,
    name: api.name,
    address: api.address,
    city: api.city ?? "",
    state: api.state ?? "",
    platform: toPlatform(api.propertyType),
    bedrooms: api.bedrooms,
    bathrooms: api.bathrooms,
    lastCleaned: lastCompleted?.completedAt ?? null,
    nextTurnover: nextUpcoming?.scheduledDate ?? null,
    syncStatus,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProperties() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/properties?limit=100");
        if (!res.ok) {
          throw new Error("Failed to fetch properties");
        }
        const data = await res.json();
        if (!cancelled) {
          const mapped = (data.properties ?? []).map(mapApiProperty);
          setProperties(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProperties();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    activeTab === "all"
      ? properties
      : properties.filter((p) => p.platform === activeTab);

  const activeRentals = properties.filter(
    (p) => p.syncStatus === "active"
  ).length;
  const upcomingTurnovers = properties.filter(
    (p) => p.nextTurnover && daysUntil(p.nextTurnover) >= 0 && daysUntil(p.nextTurnover) <= 7
  ).length;
  const completedThisMonth = properties.filter(
    (p) => p.lastCleaned && new Date(p.lastCleaned).getMonth() === new Date().getMonth() && new Date(p.lastCleaned).getFullYear() === new Date().getFullYear()
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading properties...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <Link href="/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={Building2}
          label="Total Properties"
          value={properties.length}
        />
        <StatsCard
          icon={Key}
          label="Active Rentals"
          value={activeRentals}
        />
        <StatsCard
          icon={CalendarCheck}
          label="Upcoming Turnovers"
          value={upcomingTurnovers}
          changeLabel="next 7 days"
        />
        <StatsCard
          icon={RefreshCw}
          label="Completed This Month"
          value={completedThisMonth}
          change={8}
          changeLabel="vs last month"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Property Grid / Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No properties found"
          description="Add your first rental property to start managing turnovers and cleaning schedules."
          action={{
            label: "Add Property",
            onClick: () => (window.location.href = "/properties/new"),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((property) => {
            const platform = PLATFORM_CONFIG[property.platform];
            const sync = SYNC_STATUS_CONFIG[property.syncStatus];

            return (
              <Card key={property.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col gap-4 p-5">
                  {/* Top: name + platform badge + sync */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-gray-900">
                        {property.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {property.address}, {property.city}, {property.state}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${platform.color}`}
                      >
                        {platform.label}
                      </span>
                    </div>
                  </div>

                  {/* Bed/Bath */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4 text-gray-400" />
                      {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4 text-gray-400" />
                      {property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}
                    </span>
                  </div>

                  {/* Last cleaned / Next turnover */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Last Cleaned</span>
                      <span className="font-medium text-gray-700">
                        {property.lastCleaned
                          ? formatDate(property.lastCleaned)
                          : "Never"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Next Turnover</span>
                      {property.nextTurnover ? (
                        <span className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            {formatDate(property.nextTurnover)}
                          </span>
                          <Badge
                            color={
                              daysUntil(property.nextTurnover) <= 1
                                ? "red"
                                : daysUntil(property.nextTurnover) <= 3
                                  ? "yellow"
                                  : "blue"
                            }
                          >
                            <Clock className="mr-0.5 h-3 w-3" />
                            {countdownLabel(property.nextTurnover)}
                          </Badge>
                        </span>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                    </div>
                  </div>

                  {/* Sync status */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span
                      className={`h-2 w-2 rounded-full ${sync.dotClass}`}
                    />
                    {sync.label}
                    {property.syncStatus === "error" && (
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2 border-t border-gray-100 pt-4">
                    <Link href={`/properties/${property.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link
                      href={`/properties/turnovers?property=${property.id}`}
                      className="flex-1"
                    >
                      <Button variant="ghost" size="sm" className="w-full">
                        <CalendarCheck className="mr-1.5 h-3.5 w-3.5" />
                        Schedule Cleaning
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
