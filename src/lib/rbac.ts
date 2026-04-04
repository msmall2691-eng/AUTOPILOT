import { SessionUser } from "./auth";
import { NextResponse } from "next/server";

/**
 * Role hierarchy: owner > admin > employee > subcontractor
 * Higher roles inherit all permissions of lower roles.
 */
const ROLE_LEVELS: Record<string, number> = {
  subcontractor: 0,
  employee: 1,
  admin: 2,
  owner: 3,
};

/**
 * Check if a user's role meets the minimum required level.
 */
export function hasRole(session: SessionUser, minRole: string): boolean {
  const userLevel = ROLE_LEVELS[session.role] ?? 0;
  const requiredLevel = ROLE_LEVELS[minRole] ?? 999;
  return userLevel >= requiredLevel;
}

/**
 * Returns a 403 response if the user doesn't have the required role.
 * Use in API routes: const denied = requireRole(session, "admin"); if (denied) return denied;
 */
export function requireRole(
  session: SessionUser,
  minRole: string
): NextResponse | null {
  if (!hasRole(session, minRole)) {
    return NextResponse.json(
      { error: `This action requires ${minRole} or higher access` },
      { status: 403 }
    );
  }
  return null;
}
