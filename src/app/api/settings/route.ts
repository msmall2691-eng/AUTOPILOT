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
        const settingsUpdate: Record<string, unknown> = {};

        // Boolean fields (handle both boolean and object values)
        const boolFields = [
          "autoConfirmBookings", "sendJobReminders", "autoRequestReviews",
          "allowWeekendBooking",
        ];
        for (const field of boolFields) {
          if (settingsData[field] !== undefined) {
            settingsUpdate[field] = typeof settingsData[field] === "boolean"
              ? settingsData[field]
              : !!settingsData[field];
          }
        }

        // notificationEmail/notificationSms: frontend may send objects or booleans
        if (settingsData.notificationEmail !== undefined) {
          settingsUpdate.notificationEmail = typeof settingsData.notificationEmail === "boolean"
            ? settingsData.notificationEmail
            : true; // if object was sent, it means notifications are configured = enabled
        }
        if (settingsData.notificationSms !== undefined) {
          settingsUpdate.notificationSms = typeof settingsData.notificationSms === "boolean"
            ? settingsData.notificationSms
            : true;
        }

        // Integer fields
        const intFields = [
          "reminderHoursBefore", "reviewDelayHours",
          "defaultJobDuration", "bufferTimeBetweenJobs", "maxAdvanceBookingDays",
        ];
        for (const field of intFields) {
          if (settingsData[field] !== undefined) {
            const val = parseInt(String(settingsData[field]), 10);
            if (!isNaN(val)) settingsUpdate[field] = val;
          }
        }

        // defaultPaymentTerms: frontend sends "net_30", "net_15", "due_on_receipt", etc.
        if (settingsData.defaultPaymentTerms !== undefined) {
          const termStr = String(settingsData.defaultPaymentTerms);
          const match = termStr.match(/(\d+)/);
          if (match) {
            settingsUpdate.defaultPaymentTerms = parseInt(match[1], 10);
          } else if (termStr === "due_on_receipt") {
            settingsUpdate.defaultPaymentTerms = 0;
          } else {
            const val = parseInt(termStr, 10);
            if (!isNaN(val)) settingsUpdate.defaultPaymentTerms = val;
          }
        }

        // Float fields
        if (settingsData.taxRate !== undefined) {
          const val = parseFloat(String(settingsData.taxRate));
          if (!isNaN(val)) settingsUpdate.taxRate = val;
        }

        // String fields
        const strFields = [
          "invoicePrefix", "estimatePrefix", "brandColor",
          "businessHoursStart", "businessHoursEnd", "workDays",
        ];
        for (const field of strFields) {
          if (settingsData[field] !== undefined) {
            settingsUpdate[field] = String(settingsData[field]);
          }
        }

        // Map frontend field names to schema field names
        if (settingsData.jobReminders !== undefined) {
          settingsUpdate.sendJobReminders = !!settingsData.jobReminders;
        }
        if (settingsData.jobReminderHours !== undefined) {
          const val = parseInt(String(settingsData.jobReminderHours), 10);
          if (!isNaN(val)) settingsUpdate.reminderHoursBefore = val;
        }
        if (settingsData.reviewRequests !== undefined) {
          settingsUpdate.autoRequestReviews = !!settingsData.reviewRequests;
        }
        if (settingsData.reviewRequestDelay !== undefined) {
          const val = parseInt(String(settingsData.reviewRequestDelay), 10);
          if (!isNaN(val)) settingsUpdate.reviewDelayHours = val;
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
