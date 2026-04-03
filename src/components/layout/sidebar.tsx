"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Map,
  Users,
  Home,
  RefreshCw,
  FileText,
  Calculator,
  Phone,
  MessageSquare,
  Megaphone,
  UserPlus,
  BarChart3,
  Target,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Zap,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Dispatch Map", href: "/dispatch-map", icon: Map },
  { label: "Clients", href: "/clients", icon: Users },
  {
    label: "Properties",
    href: "/properties",
    icon: Home,
    children: [
      { label: "Turnovers", href: "/properties/turnovers" },
    ],
  },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Estimates", href: "/estimates", icon: Calculator },
  { label: "Phone", href: "/phone", icon: Phone },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  {
    label: "Marketing",
    href: "/marketing",
    icon: Megaphone,
    children: [
      { label: "Campaigns", href: "/marketing/campaigns" },
      { label: "Sequences", href: "/marketing/sequences" },
      { label: "Reviews", href: "/marketing/reviews" },
    ],
  },
  { label: "Team", href: "/team", icon: UserPlus },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Ad Tracking", href: "/ad-tracking", icon: Target },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "/marketing": true,
  });

  function toggleExpand(href: string) {
    setExpandedItems((prev) => ({ ...prev, [href]: !prev[href] }));
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-indigo-950 text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Autopilot</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-indigo-300 hover:bg-indigo-900 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const expanded = expandedItems[item.href];
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.href}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-indigo-800/80 text-white"
                        : "text-indigo-200 hover:bg-indigo-900 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-indigo-800/80 text-white"
                        : "text-indigo-200 hover:bg-indigo-900 hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )}

                {/* Sub-items */}
                {hasChildren && expanded && (
                  <div className="mt-0.5 ml-5 space-y-0.5 border-l border-indigo-800 pl-4">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-sm transition-colors",
                          isActive(child.href)
                            ? "bg-indigo-800/60 font-medium text-white"
                            : "text-indigo-300 hover:bg-indigo-900 hover:text-white"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User section */}
        <div className="shrink-0 border-t border-indigo-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold uppercase">
              JD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                John Doe
              </p>
              <p className="truncate text-xs text-indigo-300">
                john@example.com
              </p>
            </div>
            <button
              className="rounded-md p-1.5 text-indigo-300 hover:bg-indigo-900 hover:text-white"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
