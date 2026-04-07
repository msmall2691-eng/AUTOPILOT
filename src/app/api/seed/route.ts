export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// ============================================================================
// GET /api/seed — Populate the database with realistic demo data
// Requires owner authentication
// ============================================================================

export async function GET() {
  try {
    // Require authentication — only owners can seed data
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    if (!session || session.role !== "owner") {
      return NextResponse.json(
        { error: "Unauthorized — only owners can seed data" },
        { status: 403 }
      );
    }
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
          businessHoursStart: "08:00",
          businessHoursEnd: "17:00",
          workDays: "1,2,3,4,5",
          defaultJobDuration: 60,
          bufferTimeBetweenJobs: 15,
          allowWeekendBooking: false,
          maxAdvanceBookingDays: 60,
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
          color: "#2563eb",
          companyId: company.id,
        },
      });

      // ------------------------------------------------------------------
      // 3. Employees (3)
      // ------------------------------------------------------------------
      const employeeData = [
        { firstName: "Jamal", lastName: "Carter", email: "jamal@steezyhauling.com", phone: "(555) 345-6789", role: "employee" as const, color: "#16a34a" },
        { firstName: "Sarah", lastName: "Mitchell", email: "sarah@steezyhauling.com", phone: "(555) 456-7890", role: "admin" as const, color: "#dc2626" },
        { firstName: "Diego", lastName: "Ramirez", email: "diego@steezyhauling.com", phone: "(555) 567-8901", role: "employee" as const, color: "#9333ea" },
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

      // ------------------------------------------------------------------
      // 12. Properties (4) - short-term rentals
      // ------------------------------------------------------------------
      const propertySeed = [
        {
          name: "Oceanview Beach House",
          address: "456 Ocean Blvd",
          city: "Wrightsville Beach",
          state: "NC",
          zip: "28480",
          propertyType: "airbnb",
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1800,
          checkInTime: "15:00",
          checkOutTime: "11:00",
          cleaningFee: 150,
          hostName: "Jennifer Adams",
          hostPhone: "(910) 555-0101",
          hostEmail: "jen@beachrentals.com",
          wifiName: "OceanView_Guest",
          wifiPassword: "beach2026!",
          doorCode: "4521",
        },
        {
          name: "Downtown Loft Suite",
          address: "220 N Tryon St #405",
          city: "Charlotte",
          state: "NC",
          zip: "28202",
          propertyType: "vrbo",
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 750,
          checkInTime: "16:00",
          checkOutTime: "10:00",
          cleaningFee: 85,
          hostName: "Robert Miller",
          hostPhone: "(704) 555-0202",
          hostEmail: "rob@cltrentals.com",
          wifiName: "LoftGuest",
          wifiPassword: "welcome123",
          lockboxCode: "7890",
        },
        {
          name: "Mountain Retreat Cabin",
          address: "1200 Mountain Rd",
          city: "Blowing Rock",
          state: "NC",
          zip: "28605",
          propertyType: "airbnb",
          bedrooms: 4,
          bathrooms: 3,
          squareFeet: 2400,
          checkInTime: "15:00",
          checkOutTime: "10:00",
          cleaningFee: 200,
          hostName: "David Park",
          hostPhone: "(828) 555-0303",
          hostEmail: "david@mountainstays.com",
          wifiName: "CabinGuest",
          wifiPassword: "mountains!",
          doorCode: "1234",
        },
        {
          name: "Palm Villa Resort",
          address: "888 Resort Dr",
          city: "Myrtle Beach",
          state: "SC",
          zip: "29577",
          propertyType: "booking_com",
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 1200,
          checkInTime: "15:00",
          checkOutTime: "11:00",
          cleaningFee: 125,
          hostName: "Lisa Torres",
          hostPhone: "(843) 555-0404",
          hostEmail: "lisa@palmvilla.com",
          wifiName: "PalmVilla_WiFi",
          wifiPassword: "resort2026",
        },
      ];

      const properties = await Promise.all(
        propertySeed.map((p) =>
          tx.property.create({ data: { companyId: company.id, ...p } })
        )
      );

      // Create turnovers for properties
      const turnoverSeed = [
        { propertyIdx: 0, guestName: "Sarah Johnson", platform: "airbnb", status: "completed", dayOffset: -1 },
        { propertyIdx: 0, guestName: "Mike Thompson", platform: "airbnb", status: "upcoming", dayOffset: 2 },
        { propertyIdx: 1, guestName: "David Chen", platform: "vrbo", status: "upcoming", dayOffset: 1 },
        { propertyIdx: 2, guestName: "Emily Watson", platform: "airbnb", status: "upcoming", dayOffset: 4 },
        { propertyIdx: 3, guestName: "Michael Torres", platform: "booking_com", status: "upcoming", dayOffset: 3 },
      ];

      await Promise.all(
        turnoverSeed.map((t) => {
          const checkout = new Date(now);
          checkout.setDate(checkout.getDate() + t.dayOffset);
          checkout.setHours(11, 0, 0, 0);
          const checkin = new Date(checkout);
          checkin.setHours(15, 0, 0, 0);

          return tx.turnover.create({
            data: {
              propertyId: properties[t.propertyIdx].id,
              guestCheckout: checkout,
              guestCheckin: checkin,
              guestName: t.guestName,
              platform: t.platform,
              status: t.status,
              autoCreated: true,
              turnaroundHrs: 4,
            },
          });
        })
      );

      // ------------------------------------------------------------------
      // 13. Call Logs (8)
      // ------------------------------------------------------------------
      const callLogSeed = [
        { clientIdx: 4, direction: "inbound", fromNumber: "(704) 555-1005", toNumber: "(555) 234-5678", duration: 342, status: "completed", recordingUrl: "/recordings/call-1.mp3", transcript: "Customer called regarding a junk removal estimate for garage cleanout. Scheduled a site visit for Thursday at 10 AM.", notes: "Large garage, may need full crew.", daysAgo: 0, hour: 14 },
        { clientIdx: 1, direction: "outbound", fromNumber: "(555) 234-5678", toNumber: "(704) 555-1002", duration: 187, status: "completed", recordingUrl: "/recordings/call-2.mp3", transcript: "Called to confirm appointment for tomorrow. Client confirmed 2-4 PM window.", notes: "Gutter job, bring ladder.", daysAgo: 0, hour: 13 },
        { clientIdx: null, direction: "inbound", fromNumber: "(704) 555-9999", toNumber: "(555) 234-5678", duration: 0, status: "missed", recordingUrl: null, transcript: null, notes: null, daysAgo: 0, hour: 11 },
        { clientIdx: 2, direction: "inbound", fromNumber: "(704) 555-1003", toNumber: "(555) 234-5678", duration: 95, status: "completed", recordingUrl: "/recordings/call-4.mp3", transcript: "Client asking about invoice. Confirmed payment was received. Asked about scheduling power wash for patio.", notes: "Send power wash package info via email.", daysAgo: 0, hour: 10 },
        { clientIdx: 3, direction: "outbound", fromNumber: "(555) 234-5678", toNumber: "(704) 555-1004", duration: 420, status: "completed", recordingUrl: "/recordings/call-5.mp3", transcript: "Discussed estimate for full yard overhaul. Client wants to proceed with landscaping package.", notes: "Landscaping package selected. $600 estimate.", daysAgo: 1, hour: 16 },
        { clientIdx: null, direction: "inbound", fromNumber: "(704) 555-8888", toNumber: "(555) 234-5678", duration: 0, status: "missed", recordingUrl: null, transcript: null, notes: null, daysAgo: 1, hour: 14 },
        { clientIdx: 7, direction: "inbound", fromNumber: "(704) 555-1008", toNumber: "(555) 234-5678", duration: 256, status: "completed", recordingUrl: "/recordings/call-7.mp3", transcript: "Emergency call. Tree fell on fence and needs debris removal ASAP.", notes: "Emergency dispatch. Bring chainsaw and truck.", daysAgo: 1, hour: 9 },
        { clientIdx: 0, direction: "outbound", fromNumber: "(555) 234-5678", toNumber: "(704) 555-1001", duration: 145, status: "completed", recordingUrl: null, transcript: null, notes: "Follow-up on completed garage cleanout. Client very happy.", daysAgo: 2, hour: 15 },
      ];

      await Promise.all(
        callLogSeed.map((cl) => {
          const callDate = new Date(now);
          callDate.setDate(callDate.getDate() - cl.daysAgo);
          callDate.setHours(cl.hour, Math.floor(Math.random() * 60), 0, 0);

          return tx.callLog.create({
            data: {
              companyId: company.id,
              userId: owner.id,
              clientId: cl.clientIdx !== null ? clients[cl.clientIdx].id : null,
              direction: cl.direction,
              fromNumber: cl.fromNumber,
              toNumber: cl.toNumber,
              duration: cl.duration,
              status: cl.status,
              recordingUrl: cl.recordingUrl,
              transcript: cl.transcript,
              notes: cl.notes,
              createdAt: callDate,
            },
          });
        })
      );

      // ------------------------------------------------------------------
      // 14. Messages (conversations with clients)
      // ------------------------------------------------------------------
      const messageSeed = [
        // Conversation with Maria Gonzalez
        { clientIdx: 4, direction: "inbound", channel: "sms", from: "(704) 555-1005", to: "(555) 234-5678", body: "Hi, I wanted to check on the status of my garage cleanout quote. Is someone still coming Thursday?", daysAgo: 0, hour: 14, min: 10, read: true },
        { clientIdx: 4, direction: "outbound", channel: "sms", from: "(555) 234-5678", to: "(704) 555-1005", body: "Hi Maria! Yes, our crew is confirmed for Thursday at 10 AM. We'll bring a truck and all equipment.", daysAgo: 0, hour: 14, min: 15, read: true },
        { clientIdx: 4, direction: "inbound", channel: "sms", from: "(704) 555-1005", to: "(555) 234-5678", body: "Perfect, thank you! How much space should I clear in the driveway for the truck?", daysAgo: 0, hour: 14, min: 18, read: false },
        // Conversation with Robert Johnson
        { clientIdx: 1, direction: "outbound", channel: "sms", from: "(555) 234-5678", to: "(704) 555-1002", body: "Hi Robert, this is a reminder about your gutter cleaning tomorrow between 8-10 AM.", daysAgo: 0, hour: 13, min: 0, read: true },
        { clientIdx: 1, direction: "inbound", channel: "sms", from: "(704) 555-1002", to: "(555) 234-5678", body: "Got it, thanks for the reminder. The ladder access is on the south side of the building.", daysAgo: 0, hour: 13, min: 8, read: true },
        // Conversation with Amanda Chen (email)
        { clientIdx: 0, direction: "outbound", channel: "email", from: "info@steezyhauling.com", to: "amanda.chen@gmail.com", body: "Hi Amanda, just following up on your garage cleanout that we completed last week. Everything look good?", daysAgo: 1, hour: 15, min: 45, read: true },
        { clientIdx: 0, direction: "inbound", channel: "email", from: "amanda.chen@gmail.com", to: "info@steezyhauling.com", body: "Everything is perfect! The garage looks amazing. You guys did a great job. Will definitely recommend you!", daysAgo: 1, hour: 16, min: 20, read: true },
        // Conversation with Lisa Patel
        { clientIdx: 2, direction: "inbound", channel: "sms", from: "(704) 555-1003", to: "(555) 234-5678", body: "Hi, do you also do pressure washing for decks? Mine needs some work before summer.", daysAgo: 0, hour: 15, min: 0, read: false },
      ];

      await Promise.all(
        messageSeed.map((m) => {
          const msgDate = new Date(now);
          msgDate.setDate(msgDate.getDate() - m.daysAgo);
          msgDate.setHours(m.hour, m.min, 0, 0);

          return tx.message.create({
            data: {
              companyId: company.id,
              userId: owner.id,
              clientId: clients[m.clientIdx].id,
              direction: m.direction,
              channel: m.channel,
              fromAddress: m.from,
              toAddress: m.to,
              body: m.body,
              status: m.direction === "outbound" ? "sent" : "received",
              read: m.read,
              createdAt: msgDate,
            },
          });
        })
      );

      // ------------------------------------------------------------------
      // 15. Review Requests (8)
      // ------------------------------------------------------------------
      const reviewSeed = [
        { clientName: "Amanda Chen", platform: "google", status: "reviewed", rating: 5, reviewText: "Incredible service! The crew arrived on time and hauled everything from our garage in under 2 hours. Very professional and cleaned up afterward. Highly recommend!", aiResponse: "Thank you so much, Amanda! We're thrilled to hear that our crew provided prompt and professional service. Keeping your space clean is our top priority. We look forward to serving you again!", daysAgo: 3 },
        { clientName: "Robert Johnson", platform: "google", status: "reviewed", rating: 4, reviewText: "Good job on the gutter cleaning. The team was professional, though they showed up about 30 minutes late. Otherwise, quality work and fair pricing.", aiResponse: "Thank you for the feedback, Robert! We're glad the gutter cleaning met your expectations. We apologize for the scheduling delay and are working to improve our arrival times.", daysAgo: 5 },
        { clientName: "Lisa Patel", platform: "yelp", status: "reviewed", rating: 5, reviewText: "Best home service company in Charlotte! They've handled our power washing twice now and both times it was flawless.", aiResponse: "Wow, thank you, Lisa! It means a lot to know that you trust us with your home maintenance needs. See you next time!", daysAgo: 8 },
        { clientName: "James Whitmore", platform: "google", status: "reviewed", rating: 3, reviewText: "Decent work overall. The initial quote was a bit higher than expected, but they did offer a small discount.", aiResponse: "Thank you for your review, James. We appreciate your candid feedback about our pricing. We always strive to offer competitive rates.", daysAgo: 12 },
        { clientName: "Maria Gonzalez", platform: "facebook", status: "clicked", rating: null, reviewText: null, aiResponse: null, daysAgo: 2 },
        { clientName: "David Kim", platform: "google", status: "sent", rating: null, reviewText: null, aiResponse: null, daysAgo: 2 },
        { clientName: "Terrence Banks", platform: "yelp", status: "sent", rating: null, reviewText: null, aiResponse: null, daysAgo: 1 },
        { clientName: "Brian Cooper", platform: "google", status: "reviewed", rating: 5, reviewText: "Outstanding emergency service! They came out on short notice to remove storm debris. Saved us from major cleanup headaches.", aiResponse: "Thank you, Brian! We know emergencies don't wait, and we're glad our team could respond quickly. Don't hesitate to call anytime!", daysAgo: 15 },
      ];

      await Promise.all(
        reviewSeed.map((r) => {
          const sentDate = new Date(now);
          sentDate.setDate(sentDate.getDate() - r.daysAgo);

          return tx.reviewRequest.create({
            data: {
              companyId: company.id,
              clientName: r.clientName,
              platform: r.platform,
              status: r.status,
              rating: r.rating,
              reviewText: r.reviewText,
              aiResponse: r.aiResponse,
              sentAt: sentDate,
              reviewedAt: r.status === "reviewed" ? sentDate : null,
            },
          });
        })
      );

      // ------------------------------------------------------------------
      // 16. Ad Trackers (14 days of data for 2 campaigns)
      // ------------------------------------------------------------------
      const adCampaigns = [
        { platform: "google_ads", campaignName: "Junk Removal - Local Search" },
        { platform: "google_ads", campaignName: "Gutter Cleaning - Charlotte" },
        { platform: "facebook_ads", campaignName: "Spring Cleanup Promo" },
        { platform: "facebook_ads", campaignName: "Home Services Awareness" },
      ];

      for (let i = 13; i >= 0; i--) {
        const adDate = new Date(now);
        adDate.setDate(adDate.getDate() - i);
        adDate.setHours(0, 0, 0, 0);

        for (const camp of adCampaigns) {
          const isGoogle = camp.platform === "google_ads";
          const baseClicks = isGoogle ? 40 + Math.floor(Math.random() * 30) : 25 + Math.floor(Math.random() * 20);
          const impressions = baseClicks * (isGoogle ? 12 : 25) + Math.floor(Math.random() * 500);
          const conversions = Math.floor(baseClicks * (0.03 + Math.random() * 0.04));
          const spend = +(baseClicks * (isGoogle ? 2.5 : 1.8) + Math.random() * 30).toFixed(2);
          const revenue = +(conversions * (200 + Math.random() * 150)).toFixed(2);

          await tx.adTracker.create({
            data: {
              companyId: company.id,
              platform: camp.platform,
              campaignName: camp.campaignName,
              clicks: baseClicks,
              impressions,
              conversions,
              spend,
              revenue,
              date: adDate,
            },
          });
        }
      }

      // ------------------------------------------------------------------
      // 17. Recurring schedules (3)
      // ------------------------------------------------------------------
      await Promise.all([
        tx.recurringSchedule.create({
          data: {
            companyId: company.id,
            clientId: clients[0].id,
            serviceId: services[1].id,
            title: "Bi-weekly gutter cleaning - Chen",
            frequency: "biweekly",
            dayOfWeek: "3", // Wednesday
            preferredTime: "09:00",
            estimatedDuration: 90,
            address: clients[0].address,
            city: clients[0].city,
            state: clients[0].state,
            zip: clients[0].zip,
            totalAmount: 150,
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            isActive: true,
          },
        }),
        tx.recurringSchedule.create({
          data: {
            companyId: company.id,
            clientId: clients[3].id,
            serviceId: services[3].id,
            title: "Weekly lawn care - Whitmore",
            frequency: "weekly",
            dayOfWeek: "1", // Monday
            preferredTime: "08:00",
            estimatedDuration: 120,
            address: clients[3].address,
            city: clients[3].city,
            state: clients[3].state,
            zip: clients[3].zip,
            totalAmount: 200,
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            isActive: true,
          },
        }),
        tx.recurringSchedule.create({
          data: {
            companyId: company.id,
            clientId: clients[5].id,
            serviceId: services[4].id,
            title: "Monthly deep clean - Kim",
            frequency: "monthly",
            dayOfMonth: 15,
            preferredTime: "10:00",
            estimatedDuration: 150,
            address: clients[5].address,
            city: clients[5].city,
            state: clients[5].state,
            zip: clients[5].zip,
            totalAmount: 175,
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            isActive: true,
          },
        }),
      ]);
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
