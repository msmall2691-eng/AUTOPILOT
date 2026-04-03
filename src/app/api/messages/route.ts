export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    if (!session?.companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const channel = searchParams.get("channel");

    const where: Record<string, unknown> = { companyId: session.companyId };
    if (channel && channel !== "all") where.channel = channel;

    const messages = await prisma.message.findMany({
      where,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Group messages into conversations by clientId
    const conversationMap = new Map<string, {
      id: string;
      contactName: string;
      phoneNumber: string;
      email: string;
      channel: string;
      messages: typeof messages;
    }>();

    for (const msg of messages) {
      const key = msg.clientId ?? msg.fromAddress;
      if (!conversationMap.has(key)) {
        const contactName = msg.client
          ? `${msg.client.firstName} ${msg.client.lastName}`
          : msg.direction === "inbound" ? msg.fromAddress : msg.toAddress;
        conversationMap.set(key, {
          id: key,
          contactName,
          phoneNumber: msg.client?.phone ?? (msg.channel === "sms" ? (msg.direction === "inbound" ? msg.fromAddress : msg.toAddress) : ""),
          email: msg.client?.email ?? (msg.channel === "email" ? (msg.direction === "inbound" ? msg.fromAddress : msg.toAddress) : ""),
          channel: msg.channel,
          messages: [],
        });
      }
      conversationMap.get(key)!.messages.push(msg);
    }

    // Sort messages within each conversation by time ascending
    const conversations = Array.from(conversationMap.values()).map((conv) => ({
      ...conv,
      messages: conv.messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    }));

    // Sort conversations by most recent message
    conversations.sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.createdAt;
      const bLast = b.messages[b.messages.length - 1]?.createdAt;
      return new Date(bLast).getTime() - new Date(aLast).getTime();
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    if (!session?.companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, channel, toAddress, body: messageBody, subject } = body;

    if (!messageBody?.trim()) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        companyId: session.companyId,
        userId: session.id,
        clientId: clientId || null,
        direction: "outbound",
        channel: channel || "sms",
        fromAddress: "system",
        toAddress: toAddress || "",
        subject: subject || null,
        body: messageBody.trim(),
        status: "sent",
        read: true,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
