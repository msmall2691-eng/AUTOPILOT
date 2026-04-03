export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// ============================================================================
// GET /api/seed — Populate the database with realistic demo data
// ============================================================================

export async function GET() {
  try {
    // Idempotency check: bail out if data already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "demo@autopilot.io" },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "Demo data already seeded — skipping.",
      });
    }

    await prisma.$transaction(async (tx: Tx) => {
      // ------------------------------------------------------------------
      // 1. Company
      // ------------------------------------------------------------------
      const company = await tx.company.create({
        data: {
          name: "Steezy Hauling",
          email: "info@steezyhauling.com",
          phone: "(555) 234-5678",
          address: "100 Commerce Blvd",
          city: "Charlotte",
          state: "NC",
          zip: "28202",
          website: "https://steezyhauling.com",
          industry: "Junk Removal & Home Services",
          plan: "pro",
        },
      });

      await tx.companySettings.create({
        data: {
          companyId: company.id,
          autoConfirmBookings: true,
          sendJobReminders: true,
          reminderHoursBefore: 24,
          autoRequestReviews: true,
          reviewDelayHours: 2,
          taxRate: 7.25,
          invoicePrefix: "INV",
          estimatePrefix: "EST",
          defaultPaymentTerms: 30,
          brandColor: "#2563eb",
        },
      });

      // ------------------------------------------------------------------
      // 2. Owner user
      // ------------------------------------------------------------------
      const passwordHash = await hashPassword("demo1234");

      const owner = await tx.user.create({
        data: {
          email: "demo@autopilot.io",
          passwordHash,
          firstName: "Marcus",
          lastName: "Williams",
          phone: "(555) 234-5678",
          role: "owner",
          companyId: company.id,
        },
      });

      // ------------------------------------------------------------------
      // 3. Employees (3)
      // ------------------------------------------------------------------
      const employeeData = [
        { firstName: "Jamal", lastName: "Carter", email: "jamal@steezyhauling.com", phone: "(555) 345-6789", role: "employee" as const },
        { firstName: "Sarah", lastName: "Mitchell", email: "sarah@steezyhauling.com", phone: "(555) 456-7890", role: "admin" as const },
        { firstName: "Diego", lastName: "Ramirez", email: "diego@steezyhauling.com", phone: "(555) 567-8901", role: "employee" as const },
      ];

      const employees = await Promise.all(
        employeeData.map((emp) =>
          tx.user.create({
            data: {
              ...emp,
              passwordHash,
              companyId: company.id,
            },
          }),
        ),
      );

      const allStaff = [owner, ...employees];

      // ------------------------------------------------------------------
      // 4. Clients (10)
      // ------------------------------------------------------------------
      const clientSeed = [
        { firstName: "Amanda", lastName: "Chen", email: "amanda.chen@gmail.com", phone: "(704) 555-1001", address: "2100 Providence Rd", city: "Charlotte", state: "NC", zip: "28207", source: "google", status: "active", tags: "residential,vip" },
        { firstName: "Robert", lastName: "Johnson", email: "rjohnson@outlook.com", phone: "(704) 555-1002", address: "450 S Tryon St", city: "Charlotte", state: "NC", zip: "28202", source: "referral", status: "active", tags: "commercial" },
        { firstName: "Lisa", lastName: "Patel", email: "lisa.patel@yahoo.com", phone: "(704) 555-1003", address: "8300 University City Blvd", city: "Charlotte", state: "NC", zip: "28223", source: "facebook", status: "active", tags: "residential" },
        { firstName: "James", lastName: "Whitmore", email: "jwhitmore@gmail.com", phone: "(704) 555-1004", address: "1200 East Blvd", city: "Charlotte", state: "NC", zip: "28203", source: "website", status: "active", tags: "residential,repeat" },
        { firstName: "Maria", lastName: "Gonzalez", email: "maria.g@hotmail.com", phone: "(704) 555-1005", address: "5600 Central Ave", city: "Charlotte", state: "NC", zip: "28212", source: "google", status: "lead", tags: "residential" },
        { firstName: "David", lastName: "Kim", email: "david.kim@gmail.com", phone: "(704) 555-1006", address: "3300 Latrobe Dr", city: "Charlotte", state: "NC", zip: "28211", source: "referral", status: "active", tags: "residential,vip" },
        { firstName: "Rachel", lastName: "Brown", email: "rachel.b@gmail.com", phone: "(704) 555-1007", address: "9100 N Tryon St", city: "Charlotte", state: "NC", zip: "28262", source: "facebook", status: "inactive", tags: "commercial" },
        { firstName: "Terrence", lastName: "Banks", email: "tbanks@outlook.com", phone: "(704) 555-1008", address: "4200 Park Rd", city: "Charlotte", state: "NC", zip: "28209", source: "google", status: "active", tags: "residential" },
        { firstName: "Stephanie", lastName: "Nguyen", email: "s.nguyen@gmail.com", phone: "(704) 555-1009", address: "6700 Fairview Rd", city: "Charlotte", state: "NC", zip: "28210", source: "website", status: "lead", tags: "residential" },
        { firstName: "Brian", lastName: "Cooper", email: "brian.cooper@yahoo.com", phone: "(704) 555-1010", address: "1500 W Morehead St", city: "Charlotte", state: "NC", zip: "28208", source: "referral", status: "active", tags: "commercial,repeat" },
      ];

      const clients = await Promise.all(
        clientSeed.map((c) =>
          tx.client.create({ data: { companyId: company.id, ...c } }),
        ),
      );

      // ------------------------------------------------------------------
      // 5. Services (5)
      // ------------------------------------------------------------------
      const serviceSeed = [
        { name: "Junk Removal", description: "Full-service junk removal for homes and businesses", duration: 120, price: 250 },
        { name: "Gutter Cleaning", description: "Gutter cleaning and downspout flushing", duration: 90, price: 150 },
        { name: "Power Washing", description: "Pressure washing for driveways, decks, and siding", duration: 120, price: 200 },
        { name: "Landscaping", description: "Lawn mowing, trimming, mulching, and landscape design", duration: 180, price: 300 },
        { name: "General Cleaning", description: "Interior deep cleaning and organizing", duration: 150, price: 175 },
      ];

      const services = await Promise.all(
        serviceSeed.map((s) =>
          tx.service.create({ data: { companyId: company.id, ...s } }),
        ),
      );

      // ------------------------------------------------------------------
      // 6. Jobs (15) — spread across statuses & next 2 weeks
      // ------------------------------------------------------------------
      const now = new Date();
      const day = (offset: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() + offset);
        d.setHours(8, 0, 0, 0);
        return d;
      };

      const jobDefs: {
        title: string;
        clientIdx: number;
        serviceIdx: number;
        staffIdx: number;
        status: string;
        priority: string;
        dayOffset: number;
        time: string;
        amount: number;
      }[] = [
        { title: "Garage cleanout - Chen residence", clientIdx: 0, serviceIdx: 0, staffIdx: 0, status: "completed", priority: "normal", dayOffset: -3, time: "9:00 AM", amount: 350 },
        { title: "Gutter cleaning - Johnson office", clientIdx: 1, serviceIdx: 1, staffIdx: 1, status: "completed", priority: "normal", dayOffset: -2, time: "10:00 AM", amount: 200 },
        { title: "Power wash driveway - Patel", clientIdx: 2, serviceIdx: 2, staffIdx: 2, status: "completed", priority: "high", dayOffset: -1, time: "8:00 AM", amount: 250 },
        { title: "Full yard cleanup - Whitmore", clientIdx: 3, serviceIdx: 3, staffIdx: 3, status: "in_progress", priority: "normal", dayOffset: 0, time: "9:00 AM", amount: 400 },
        { title: "Basement junk removal - Kim", clientIdx: 5, serviceIdx: 0, staffIdx: 0, status: "in_progress", priority: "high", dayOffset: 0, time: "1:00 PM", amount: 500 },
        { title: "Gutter repair & clean - Banks", clientIdx: 7, serviceIdx: 1, staffIdx: 1, status: "scheduled", priority: "normal", dayOffset: 1, time: "8:00 AM", amount: 175 },
        { title: "Power wash deck - Gonzalez", clientIdx: 4, serviceIdx: 2, staffIdx: 2, status: "scheduled", priority: "normal", dayOffset: 2, time: "10:00 AM", amount: 225 },
        { title: "Move-out cleaning - Brown", clientIdx: 6, serviceIdx: 4, staffIdx: 3, status: "scheduled", priority: "urgent", dayOffset: 2, time: "8:00 AM", amount: 300 },
        { title: "Office junk haul - Cooper", clientIdx: 9, serviceIdx: 0, staffIdx: 0, status: "scheduled", priority: "normal", dayOffset: 3, time: "9:00 AM", amount: 450 },
        { title: "Spring landscaping - Chen", clientIdx: 0, serviceIdx: 3, staffIdx: 1, status: "scheduled", priority: "low", dayOffset: 5, time: "8:00 AM", amount: 600 },
        { title: "Pressure wash siding - Nguyen", clientIdx: 8, serviceIdx: 2, staffIdx: 2, status: "scheduled", priority: "normal", dayOffset: 6, time: "10:00 AM", amount: 275 },
        { title: "Attic cleanout - Whitmore", clientIdx: 3, serviceIdx: 0, staffIdx: 0, status: "scheduled", priority: "normal", dayOffset: 8, time: "9:00 AM", amount: 325 },
        { title: "Deep clean - Patel home", clientIdx: 2, serviceIdx: 4, staffIdx: 3, status: "scheduled", priority: "normal", dayOffset: 10, time: "8:00 AM", amount: 200 },
        { title: "Gutter install guards - Kim", clientIdx: 5, serviceIdx: 1, staffIdx: 1, status: "scheduled", priority: "high", dayOffset: 12, time: "9:00 AM", amount: 350 },
        { title: "Estate cleanout - Cooper", clientIdx: 9, serviceIdx: 0, staffIdx: 0, status: "cancelled", priority: "normal", dayOffset: -5, time: "8:00 AM", amount: 800 },
      ];

      const jobs = await Promise.all(
        jobDefs.map((j) =>
          tx.job.create({
            data: {
              companyId: company.id,
              clientId: clients[j.clientIdx].id,
              serviceId: services[j.serviceIdx].id,
              assignedToId: allStaff[j.staffIdx].id,
              createdById: owner.id,
              title: j.title,
              status: j.status,
              priority: j.priority,
              scheduledDate: day(j.dayOffset),
              scheduledTime: j.time,
              estimatedDuration: services[j.serviceIdx].duration,
              address: clients[j.clientIdx].address,
              city: clients[j.clientIdx].city,
              state: clients[j.clientIdx].state,
              zip: clients[j.clientIdx].zip,
              totalAmount: j.amount,
            },
          }),
        ),
      );

      // ------------------------------------------------------------------
      // 7. Invoices (8) — mix of statuses
      // ------------------------------------------------------------------
      const invoiceDefs: {
        jobIdx: number;
        clientIdx: number;
        status: string;
        number: string;
        paid: boolean;
        overdue: boolean;
      }[] = [
        { jobIdx: 0, clientIdx: 0, status: "paid", number: "INV-001", paid: true, overdue: false },
        { jobIdx: 1, clientIdx: 1, status: "paid", number: "INV-002", paid: true, overdue: false },
        { jobIdx: 2, clientIdx: 2, status: "paid", number: "INV-003", paid: true, overdue: false },
        { jobIdx: 3, clientIdx: 3, status: "sent", number: "INV-004", paid: false, overdue: false },
        { jobIdx: 4, clientIdx: 5, status: "sent", number: "INV-005", paid: false, overdue: false },
        { jobIdx: 14, clientIdx: 9, status: "overdue", number: "INV-006", paid: false, overdue: true },
        { jobIdx: 5, clientIdx: 7, status: "draft", number: "INV-007", paid: false, overdue: false },
        { jobIdx: 6, clientIdx: 4, status: "draft", number: "INV-008", paid: false, overdue: false },
      ];

      await Promise.all(
        invoiceDefs.map((inv) => {
          const job = jobs[inv.jobIdx];
          const amount = job.totalAmount;
          const taxAmount = +(amount * 0.0725).toFixed(2);
          const total = +(amount + taxAmount).toFixed(2);
          const dueDate = new Date(now);
          dueDate.setDate(dueDate.getDate() + (inv.overdue ? -10 : 30));

          return tx.invoice.create({
            data: {
              companyId: company.id,
              clientId: clients[inv.clientIdx].id,
              createdById: owner.id,
              jobId: job.id,
              invoiceNumber: inv.number,
              status: inv.status,
              subtotal: amount,
              taxRate: 7.25,
              taxAmount,
              totalAmount: total,
              paidAmount: inv.paid ? total : 0,
              paidAt: inv.paid ? new Date() : null,
              sentAt: inv.status !== "draft" ? new Date() : null,
              dueDate,
              paymentMethod: inv.paid ? "stripe" : null,
              lineItems: {
                create: [
                  {
                    name: job.title,
                    quantity: 1,
                    unitPrice: amount,
                    total: amount,
                  },
                ],
              },
            },
          });
        }),
      );

      // Update client totalSpent / jobCount for the 3 paid invoice clients
      for (const idx of [0, 1, 2]) {
        const clientJobs = jobDefs.filter((j) => j.clientIdx === idx);
        const totalSpent = clientJobs.reduce((sum, j) => sum + j.amount, 0);
        await tx.client.update({
          where: { id: clients[idx].id },
          data: { totalSpent, jobCount: clientJobs.length },
        });
      }

      // ------------------------------------------------------------------
      // 8. Estimates (5)
      // ------------------------------------------------------------------
      const estimateDefs = [
        { clientIdx: 4, number: "EST-001", status: "sent", amount: 225, description: "Power wash driveway and patio" },
        { clientIdx: 8, number: "EST-002", status: "accepted", amount: 275, description: "Pressure wash siding - full house" },
        { clientIdx: 6, number: "EST-003", status: "draft", amount: 450, description: "Commercial office junk removal" },
        { clientIdx: 3, number: "EST-004", status: "declined", amount: 1200, description: "Full landscaping redesign" },
        { clientIdx: 7, number: "EST-005", status: "sent", amount: 175, description: "Gutter cleaning and minor repair" },
      ];

      await Promise.all(
        estimateDefs.map((est) => {
          const taxAmount = +(est.amount * 0.0725).toFixed(2);
          const validUntil = new Date(now);
          validUntil.setDate(validUntil.getDate() + 30);

          return tx.estimate.create({
            data: {
              companyId: company.id,
              clientId: clients[est.clientIdx].id,
              createdById: owner.id,
              estimateNumber: est.number,
              status: est.status,
              subtotal: est.amount,
              taxRate: 7.25,
              taxAmount,
              totalAmount: +(est.amount + taxAmount).toFixed(2),
              validUntil,
              sentAt: est.status !== "draft" ? new Date() : null,
              respondedAt: ["accepted", "declined"].includes(est.status) ? new Date() : null,
              lineItems: {
                create: [
                  {
                    name: est.description,
                    quantity: 1,
                    unitPrice: est.amount,
                    total: est.amount,
                  },
                ],
              },
            },
          });
        }),
      );

      // ------------------------------------------------------------------
      // 9. Campaigns (3)
      // ------------------------------------------------------------------
      await Promise.all([
        tx.campaign.create({
          data: {
            companyId: company.id,
            name: "Spring Cleaning Special",
            type: "sms_blast",
            status: "sent",
            content: "Spring is here! Get 20% off junk removal this month. Reply BOOK to schedule. - Steezy Hauling",
            recipientCount: 48,
            sentCount: 45,
            sentAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        }),
        tx.campaign.create({
          data: {
            companyId: company.id,
            name: "April Newsletter",
            type: "email_blast",
            status: "scheduled",
            subject: "What's New at Steezy Hauling",
            content: "Check out our new landscaping services and seasonal discounts.",
            recipientCount: 120,
            scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          },
        }),
        tx.campaign.create({
          data: {
            companyId: company.id,
            name: "Re-engagement Blast",
            type: "sms_blast",
            status: "draft",
            content: "We miss you! Book any service this week and save $50. - Steezy Hauling",
            recipientCount: 30,
          },
        }),
      ]);

      // ------------------------------------------------------------------
      // 10. Sequences (2) with steps
      // ------------------------------------------------------------------
      await tx.sequence.create({
        data: {
          companyId: company.id,
          name: "Post-Job Follow-Up",
          description: "Automated follow-up after a job is completed",
          trigger: "job_completed",
          isActive: true,
          steps: {
            create: [
              { order: 1, type: "sms", content: "Thanks for choosing Steezy Hauling, {{customerName}}! We hope everything looks great." },
              { order: 2, type: "delay", delayHours: 48 },
              { order: 3, type: "sms", content: "Hi {{customerName}}, would you mind leaving us a quick review? It really helps! {{reviewLink}}" },
              { order: 4, type: "delay", delayHours: 168 },
              { order: 5, type: "email", subject: "How was your experience?", content: "Hi {{customerName}},\n\nWe'd love to hear your feedback on the recent {{serviceType}} job. Let us know if there's anything we can improve!" },
            ],
          },
        },
      });

      await tx.sequence.create({
        data: {
          companyId: company.id,
          name: "New Lead Nurture",
          description: "Warm up new leads who submit a booking request",
          trigger: "new_lead",
          isActive: true,
          steps: {
            create: [
              { order: 1, type: "sms", content: "Hi {{customerName}}! Thanks for reaching out to Steezy Hauling. We'll get back to you within the hour." },
              { order: 2, type: "delay", delayHours: 24 },
              { order: 3, type: "email", subject: "Your Free Estimate from Steezy Hauling", content: "Hi {{customerName}},\n\nWe've prepared a free estimate for your {{serviceType}} project. Check it out and let us know if you have questions!" },
            ],
          },
        },
      });

      // ------------------------------------------------------------------
      // 11. Booking page (for the public booking form)
      // ------------------------------------------------------------------
      await tx.bookingPage.create({
        data: {
          companyId: company.id,
          slug: "default",
          title: "Book Online",
          description: "Schedule your service with Steezy Hauling",
          isActive: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Demo data seeded successfully.",
    });
  } catch (error) {
    console.error("GET /api/seed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed demo data" },
      { status: 500 },
    );
  }
}
