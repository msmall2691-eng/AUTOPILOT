/**
 * Ensures all required columns exist in the production database.
 * This runs raw ALTER TABLE statements that are idempotent (IF NOT EXISTS).
 * Used as a fallback when prisma db push fails to sync the schema.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const migrations = [
  // User table
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "color" TEXT`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true NOT NULL`,

  // CompanySettings table
  `ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "businessHoursStart" TEXT DEFAULT '08:00' NOT NULL`,
  `ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "businessHoursEnd" TEXT DEFAULT '17:00' NOT NULL`,
  `ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "workDays" TEXT DEFAULT '1,2,3,4,5' NOT NULL`,
  `ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "defaultJobDuration" INTEGER DEFAULT 60 NOT NULL`,
  `ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "bufferTimeBetweenJobs" INTEGER DEFAULT 15 NOT NULL`,
  `ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "allowWeekendBooking" BOOLEAN DEFAULT false NOT NULL`,
  `ALTER TABLE "CompanySettings" ADD COLUMN IF NOT EXISTS "maxAdvanceBookingDays" INTEGER DEFAULT 60 NOT NULL`,

  // RecurringSchedule table (must exist before Job FK)
  `CREATE TABLE IF NOT EXISTS "RecurringSchedule" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "dayOfWeek" TEXT,
    "dayOfMonth" INTEGER,
    "preferredTime" TEXT,
    "estimatedDuration" INTEGER,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assignedToId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastGeneratedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RecurringSchedule_pkey" PRIMARY KEY ("id")
  )`,

  // Job table
  `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "recurringScheduleId" TEXT`,
  `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "scheduledEndTime" TEXT`,
  `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "estimatedDuration" INTEGER`,
  `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "actualDuration" INTEGER`,
  `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION`,
  `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION`,
  `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT`,
  `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "beforePhotos" TEXT`,
  `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "afterPhotos" TEXT`,
  `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "isRecurring" BOOLEAN DEFAULT false NOT NULL`,

  // TimeEntry table
  `CREATE TABLE IF NOT EXISTS "TimeEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockOut" TIMESTAMP(3),
    "duration" INTEGER,
    "notes" TEXT,
    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
  )`,

  // UserAvailability table
  `CREATE TABLE IF NOT EXISTS "UserAvailability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "UserAvailability_pkey" PRIMARY KEY ("id")
  )`,

  // TimeOffRequest table
  `CREATE TABLE IF NOT EXISTS "TimeOffRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimeOffRequest_pkey" PRIMARY KEY ("id")
  )`,

  // CallLog table
  `CREATE TABLE IF NOT EXISTS "CallLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "clientId" TEXT,
    "direction" TEXT NOT NULL,
    "fromNumber" TEXT NOT NULL,
    "toNumber" TEXT NOT NULL,
    "duration" INTEGER,
    "status" TEXT NOT NULL,
    "recordingUrl" TEXT,
    "transcript" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
  )`,

  // Message table
  `CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "clientId" TEXT,
    "direction" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
  )`,

  // Notification table
  `CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
  )`,
];

async function main() {
  console.log("Ensuring database schema is up to date...");
  let applied = 0;
  let skipped = 0;

  for (const sql of migrations) {
    try {
      await prisma.$executeRawUnsafe(sql);
      applied++;
    } catch (e) {
      // Column/table already exists or other non-critical error
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already exists")) {
        skipped++;
      } else {
        console.warn(`Warning: ${msg.slice(0, 120)}`);
        skipped++;
      }
    }
  }

  console.log(`Schema sync complete: ${applied} applied, ${skipped} skipped`);
}

main()
  .catch((e) => {
    console.error("Schema sync failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
