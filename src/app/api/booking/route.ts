export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      serviceType,
      preferredDate,
      preferredTime,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      notes,
    } = body;

    // ---- Validation ----

    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 },
      );
    }

    if (!customerPhone || !customerPhone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    if (!preferredDate) {
      return NextResponse.json(
        { error: "Preferred date is required" },
        { status: 400 },
      );
    }

    if (!preferredTime) {
      return NextResponse.json(
        { error: "Preferred time is required" },
        { status: 400 },
      );
    }

    if (!serviceType) {
      return NextResponse.json(
        { error: "Service type is required" },
        { status: 400 },
      );
    }

    // ---- Find or create a default booking page ----

    let bookingPage = await prisma.bookingPage.findFirst({
      where: { slug: "default" },
    });

    if (!bookingPage) {
      // Look for any company to attach the booking page to
      let company = await prisma.company.findFirst();

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: "Steezy Hauling",
            email: "info@steezyhauling.com",
          },
        });
      }

      bookingPage = await prisma.bookingPage.create({
        data: {
          companyId: company.id,
          slug: "default",
          title: "Book Online",
          description: "Schedule your service online",
          isActive: true,
        },
      });
    }

    // ---- Create booking record ----

    const booking = await prisma.booking.create({
      data: {
        bookingPageId: bookingPage.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail?.trim() || null,
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress?.trim() || null,
        serviceType: serviceType.trim(),
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime.trim(),
        notes: notes?.trim() || null,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        booking: {
          bookingId: booking.id,
          customerName: booking.customerName,
          serviceType: booking.serviceType,
          preferredDate: preferredDate,
          preferredTime: booking.preferredTime,
          status: booking.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
