import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  __dbMigrated?: boolean
}

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Ensures database schema is up to date at runtime.
 * This runs once per serverless cold start. All statements are idempotent.
 */
export async function ensureSchema() {
  if (globalForPrisma.__dbMigrated) return

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
    `ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3)`,

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
  ]

  const indexes = [
    `CREATE INDEX IF NOT EXISTS "User_companyId_idx" ON "User"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role")`,
    `CREATE INDEX IF NOT EXISTS "User_isActive_idx" ON "User"("isActive")`,
    `CREATE INDEX IF NOT EXISTS "Client_companyId_idx" ON "Client"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "Client_companyId_status_idx" ON "Client"("companyId", "status")`,
    `CREATE INDEX IF NOT EXISTS "Client_companyId_email_idx" ON "Client"("companyId", "email")`,
    `CREATE INDEX IF NOT EXISTS "Client_createdAt_idx" ON "Client"("createdAt")`,
    `CREATE INDEX IF NOT EXISTS "Job_companyId_idx" ON "Job"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "Job_companyId_status_idx" ON "Job"("companyId", "status")`,
    `CREATE INDEX IF NOT EXISTS "Job_companyId_scheduledDate_idx" ON "Job"("companyId", "scheduledDate")`,
    `CREATE INDEX IF NOT EXISTS "Job_clientId_idx" ON "Job"("clientId")`,
    `CREATE INDEX IF NOT EXISTS "Job_assignedToId_idx" ON "Job"("assignedToId")`,
    `CREATE INDEX IF NOT EXISTS "Job_createdById_idx" ON "Job"("createdById")`,
    `CREATE INDEX IF NOT EXISTS "Job_recurringScheduleId_idx" ON "Job"("recurringScheduleId")`,
    `CREATE INDEX IF NOT EXISTS "Invoice_companyId_idx" ON "Invoice"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "Invoice_companyId_status_idx" ON "Invoice"("companyId", "status")`,
    `CREATE INDEX IF NOT EXISTS "Invoice_clientId_idx" ON "Invoice"("clientId")`,
    `CREATE INDEX IF NOT EXISTS "Invoice_createdById_idx" ON "Invoice"("createdById")`,
    `CREATE INDEX IF NOT EXISTS "Invoice_dueDate_idx" ON "Invoice"("dueDate")`,
    `CREATE INDEX IF NOT EXISTS "Estimate_companyId_idx" ON "Estimate"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "Estimate_companyId_status_idx" ON "Estimate"("companyId", "status")`,
    `CREATE INDEX IF NOT EXISTS "Estimate_clientId_idx" ON "Estimate"("clientId")`,
    `CREATE INDEX IF NOT EXISTS "Estimate_createdById_idx" ON "Estimate"("createdById")`,
    `CREATE INDEX IF NOT EXISTS "Service_companyId_idx" ON "Service"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "Service_companyId_isActive_idx" ON "Service"("companyId", "isActive")`,
    `CREATE INDEX IF NOT EXISTS "RecurringSchedule_companyId_idx" ON "RecurringSchedule"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "RecurringSchedule_companyId_isActive_idx" ON "RecurringSchedule"("companyId", "isActive")`,
    `CREATE INDEX IF NOT EXISTS "RecurringSchedule_clientId_idx" ON "RecurringSchedule"("clientId")`,
    `CREATE INDEX IF NOT EXISTS "CallLog_companyId_idx" ON "CallLog"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "CallLog_clientId_idx" ON "CallLog"("clientId")`,
    `CREATE INDEX IF NOT EXISTS "Message_companyId_idx" ON "Message"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "Message_clientId_idx" ON "Message"("clientId")`,
    `CREATE INDEX IF NOT EXISTS "Message_read_idx" ON "Message"("read")`,
    `CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId")`,
    `CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead")`,
    `CREATE INDEX IF NOT EXISTS "JobLineItem_jobId_idx" ON "JobLineItem"("jobId")`,
    `CREATE INDEX IF NOT EXISTS "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId")`,
    `CREATE INDEX IF NOT EXISTS "EstimateLineItem_estimateId_idx" ON "EstimateLineItem"("estimateId")`,
    `CREATE INDEX IF NOT EXISTS "TimeEntry_userId_idx" ON "TimeEntry"("userId")`,
    `CREATE INDEX IF NOT EXISTS "TimeEntry_jobId_idx" ON "TimeEntry"("jobId")`,
    `CREATE INDEX IF NOT EXISTS "Payment_invoiceId_idx" ON "Payment"("invoiceId")`,
    `CREATE INDEX IF NOT EXISTS "Property_companyId_idx" ON "Property"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "Turnover_propertyId_idx" ON "Turnover"("propertyId")`,
    `CREATE INDEX IF NOT EXISTS "Turnover_status_idx" ON "Turnover"("status")`,
    `CREATE INDEX IF NOT EXISTS "Campaign_companyId_idx" ON "Campaign"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "Sequence_companyId_idx" ON "Sequence"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "BookingPage_companyId_idx" ON "BookingPage"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "Booking_bookingPageId_idx" ON "Booking"("bookingPageId")`,
    `CREATE INDEX IF NOT EXISTS "ReviewRequest_companyId_idx" ON "ReviewRequest"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "AdTracker_companyId_idx" ON "AdTracker"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "PriceBookItem_companyId_idx" ON "PriceBookItem"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "PhoneNumber_companyId_idx" ON "PhoneNumber"("companyId")`,
    `CREATE INDEX IF NOT EXISTS "UserAvailability_userId_idx" ON "UserAvailability"("userId")`,
    `CREATE INDEX IF NOT EXISTS "TimeOffRequest_userId_idx" ON "TimeOffRequest"("userId")`,
    `CREATE INDEX IF NOT EXISTS "SequenceStep_sequenceId_idx" ON "SequenceStep"("sequenceId")`,
    `CREATE INDEX IF NOT EXISTS "ICalFeed_propertyId_idx" ON "ICalFeed"("propertyId")`,
    `CREATE INDEX IF NOT EXISTS "PropertyChecklist_propertyId_idx" ON "PropertyChecklist"("propertyId")`,
    `CREATE INDEX IF NOT EXISTS "ChecklistItem_checklistId_idx" ON "ChecklistItem"("checklistId")`,
  ]

  try {
    for (const sql of migrations) {
      try {
        await prisma.$executeRawUnsafe(sql)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!msg.includes('already exists')) {
          console.warn(`[schema-sync] migration warning: ${msg.slice(0, 150)}`)
        }
      }
    }

    for (const sql of indexes) {
      try {
        await prisma.$executeRawUnsafe(sql)
      } catch {
        // indexes are best-effort
      }
    }

    console.log('[schema-sync] Runtime schema sync complete')
  } catch (e) {
    console.error('[schema-sync] Runtime schema sync failed:', e)
  }

  globalForPrisma.__dbMigrated = true
}

// Eagerly start schema sync on module load (runtime only)
// Store promise globally so it survives across imports and can be awaited
const globalWithSchema = globalThis as unknown as { __schemaReady?: Promise<void> }
if (process.env.DATABASE_URL && !globalWithSchema.__schemaReady) {
  globalWithSchema.__schemaReady = ensureSchema()
}

/** Await this before querying if you need guaranteed schema readiness */
export const schemaReady: Promise<void> = globalWithSchema.__schemaReady ?? Promise.resolve()
