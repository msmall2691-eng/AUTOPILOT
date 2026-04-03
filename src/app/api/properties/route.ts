export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "25", 10))
    );
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      companyId,
    };

    if (type && type !== "all") {
      where.propertyType = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { city: { contains: search } },
        { hostName: { contains: search } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          icalFeeds: true,
          checklists: true,
          turnovers: {
            orderBy: { guestCheckout: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
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

    const companyId = session.companyId;

    const body = await request.json();

    const {
      name,
      address,
      city,
      state,
      zip,
      lat,
      lng,
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      doorCode,
      lockboxCode,
      wifiName,
      wifiPassword,
      parkingInfo,
      hostName,
      hostPhone,
      hostEmail,
      specialInstructions,
      supplyLocation,
      checkInTime,
      checkOutTime,
      cleaningFee,
      isActive,
      notes,
      clientId,
      icalFeed,
      checklist,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Property name is required" },
        { status: 400 }
      );
    }

    if (!address || !address.trim()) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        companyId,
        clientId: clientId || null,
        name: name.trim(),
        address: address.trim(),
        city: city?.trim() || null,
        state: state?.trim() || null,
        zip: zip?.trim() || null,
        lat: lat ?? null,
        lng: lng ?? null,
        propertyType: propertyType || "airbnb",
        bedrooms: bedrooms ?? 1,
        bathrooms: bathrooms ?? 1,
        squareFeet: squareFeet ?? null,
        doorCode: doorCode?.trim() || null,
        lockboxCode: lockboxCode?.trim() || null,
        wifiName: wifiName?.trim() || null,
        wifiPassword: wifiPassword?.trim() || null,
        parkingInfo: parkingInfo?.trim() || null,
        hostName: hostName?.trim() || null,
        hostPhone: hostPhone?.trim() || null,
        hostEmail: hostEmail?.trim() || null,
        specialInstructions: specialInstructions?.trim() || null,
        supplyLocation: supplyLocation?.trim() || null,
        checkInTime: checkInTime?.trim() || null,
        checkOutTime: checkOutTime?.trim() || null,
        cleaningFee: cleaningFee ?? null,
        isActive: isActive ?? true,
        notes: notes?.trim() || null,
        ...(icalFeed?.feedUrl
          ? {
              icalFeeds: {
                create: {
                  platform: icalFeed.platform || "other",
                  feedUrl: icalFeed.feedUrl.trim(),
                },
              },
            }
          : {}),
        ...(checklist?.name
          ? {
              checklists: {
                create: {
                  name: checklist.name.trim(),
                  description: checklist.description?.trim() || null,
                  isDefault: checklist.isDefault ?? false,
                  ...(checklist.items?.length
                    ? {
                        items: {
                          create: checklist.items.map(
                            (
                              item: {
                                task: string;
                                category?: string;
                                isRequired?: boolean;
                                notes?: string;
                              },
                              index: number
                            ) => ({
                              order: index + 1,
                              task: item.task.trim(),
                              category: item.category || null,
                              isRequired: item.isRequired ?? true,
                              notes: item.notes?.trim() || null,
                            })
                          ),
                        },
                      }
                    : {}),
                },
              },
            }
          : {}),
      },
      include: {
        icalFeeds: true,
        checklists: {
          include: {
            items: true,
          },
        },
      },
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
