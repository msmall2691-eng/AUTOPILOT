export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
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

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    let settings = await prisma.companySettings.findUnique({
      where: { companyId },
    });

    if (!settings) {
      settings = await prisma.companySettings.create({
        data: { companyId },
      });
    }

    return NextResponse.json({ company, settings });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const body = await request.json();

    const { company: companyData, settings: settingsData } = body;

    const result = await prisma.$transaction(async (tx) => {
      let updatedCompany = null;
      let updatedSettings = null;

      if (companyData) {
        const allowedCompanyFields = [
          "name", "email", "phone", "address", "city",
          "state", "zip", "industry", "timezone",
        ];
        const companyUpdate: Record<string, unknown> = {};
        for (const field of allowedCompanyFields) {
          if (companyData[field] !== undefined) {
            companyUpdate[field] = companyData[field];
          }
        }

        updatedCompany = await tx.company.update({
          where: { id: companyId },
          data: companyUpdate,
        });
      }

      if (settingsData) {
        const allowedSettingsFields = [
          "autoConfirmBookings", "sendJobReminders", "reminderHoursBefore",
          "autoRequestReviews", "reviewDelayHours", "taxRate",
          "invoicePrefix", "estimatePrefix", "defaultPaymentTerms",
          "notificationEmail", "notificationSms", "brandColor",
          "businessHoursStart", "businessHoursEnd", "workDays",
          "defaultJobDuration", "bufferTimeBetweenJobs",
          "allowWeekendBooking", "maxAdvanceBookingDays",
        ];
        const settingsUpdate: Record<string, unknown> = {};
        for (const field of allowedSettingsFields) {
          if (settingsData[field] !== undefined) {
            settingsUpdate[field] = settingsData[field];
          }
        }

        updatedSettings = await tx.companySettings.upsert({
          where: { companyId },
          update: settingsUpdate,
          create: { companyId, ...settingsUpdate },
        });
      }

      // Fetch the latest state if either wasn't updated
      if (!updatedCompany) {
        updatedCompany = await tx.company.findUnique({
          where: { id: companyId },
        });
      }

      if (!updatedSettings) {
        updatedSettings = await tx.companySettings.findUnique({
          where: { companyId },
        });

        if (!updatedSettings) {
          updatedSettings = await tx.companySettings.create({
            data: { companyId },
          });
        }
      }

      return { company: updatedCompany, settings: updatedSettings };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
