import { Zap } from "lucide-react";

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-12">
      {/* Brand logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-md">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          Autopilot
        </span>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Autopilot. All rights reserved.
      </p>
    </div>
  );
}
