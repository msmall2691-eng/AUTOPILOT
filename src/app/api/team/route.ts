export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, hashPassword } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { prisma, schemaReady } from "@/lib/db";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!session.companyId) {
      return NextResponse.json(
        { error: "No company associated with this account" },
        { status: 401 }
      );
    }

    const companyId = session.companyId;

    const { searchParams } = request.nextUrl;
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const where: Record<string, unknown> = {
      companyId,
    };

    if (role && (role === "employee" || role === "subcontractor")) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        color: true,
        isActive: true,
        createdAt: true,
        assignedJobs: {
          where: { status: "completed" },
          select: {
            id: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const team = users.map((user) => {
      const { assignedJobs, ...rest } = user;
      return {
        ...rest,
        jobStats: {
          completedCount: assignedJobs.length,
          totalAmount: assignedJobs.reduce((sum, job) => sum + job.totalAmount, 0),
        },
      };
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error("GET /api/team error:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!session.companyId) {
      return NextResponse.json(
        { error: "No company associated with this account" },
        { status: 401 }
      );
    }

    // Only admin/owner can add team members
    const denied = requireRole(session, "admin");
    if (denied) return denied;

    const companyId = session.companyId;
    const body = await request.json();

    const { firstName, lastName, email, role, phone } = body;

    // Prevent creating users with higher role than yourself
    const roleHierarchy: Record<string, number> = { subcontractor: 0, employee: 1, admin: 2, owner: 3 };
    if ((roleHierarchy[role] ?? 0) > (roleHierarchy[session.role] ?? 0)) {
      return NextResponse.json(
        { error: "Cannot create a user with a higher role than your own" },
        { status: 403 }
      );
    }

    if (!firstName || !firstName.trim()) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    if (!lastName || !lastName.trim()) {
      return NextResponse.json(
        { error: "Last name is required" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!role || !role.trim()) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Generate a random temporary password
    const tempPassword = crypto.randomBytes(12).toString("base64url");
    const passwordHash = await hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        role: role.trim(),
        passwordHash,
        companyId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        color: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/team error:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!session.companyId) {
      return NextResponse.json(
        { error: "No company associated with this account" },
        { status: 401 }
      );
    }

    // Only admin/owner can update team members
    const denied = requireRole(session, "admin");
    if (denied) return denied;

    const companyId = session.companyId;
    const body = await request.json();

    const { userId, firstName, lastName, email, phone, role, isActive, color } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser || existingUser.companyId !== companyId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent role escalation
    if (role !== undefined) {
      const roleHierarchy: Record<string, number> = { subcontractor: 0, employee: 1, admin: 2, owner: 3 };
      if ((roleHierarchy[role] ?? 0) > (roleHierarchy[session.role] ?? 0)) {
        return NextResponse.json(
          { error: "Cannot assign a role higher than your own" },
          { status: 403 }
        );
      }
      // Only owners can modify other owners
      if (existingUser.role === "owner" && session.role !== "owner") {
        return NextResponse.json(
          { error: "Only owners can modify owner accounts" },
          { status: 403 }
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (firstName !== undefined) data.firstName = firstName.trim();
    if (lastName !== undefined) data.lastName = lastName.trim();
    if (email !== undefined) data.email = email.trim();
    if (phone !== undefined) data.phone = phone?.trim() || null;
    if (role !== undefined) data.role = role.trim();
    if (isActive !== undefined) data.isActive = isActive;
    if (color !== undefined) data.color = color?.trim() || null;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        color: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("PATCH /api/team error:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!session.companyId) {
      return NextResponse.json(
        { error: "No company associated with this account" },
        { status: 401 }
      );
    }

    // Only admin/owner can deactivate team members
    const denied = requireRole(session, "admin");
    if (denied) return denied;

    const companyId = session.companyId;
    const body = await request.json();

    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Cannot deactivate yourself
    if (userId === session.id) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser || existingUser.companyId !== companyId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Only owners can deactivate other owners/admins
    if (existingUser.role === "owner" && session.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can deactivate owner accounts" },
        { status: 403 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/team error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate team member" },
      { status: 500 }
    );
  }
}
