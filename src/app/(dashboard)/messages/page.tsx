"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatPhone } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Mail,
  User,
  ChevronLeft,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Channel = "sms" | "email";

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  channel: Channel;
  messages: Message[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    contactName: "Maria Gonzalez",
    phoneNumber: "5551234567",
    email: "maria.gonzalez@email.com",
    channel: "sms",
    messages: [
      {
        id: "msg-1a",
        direction: "inbound",
        body: "Hi, I wanted to check on the status of my kitchen sink repair. Is the technician still coming Thursday?",
        timestamp: "2026-04-02T14:10:00Z",
        read: true,
      },
      {
        id: "msg-1b",
        direction: "outbound",
        body: "Hi Maria! Yes, Mike is confirmed for Thursday at 10 AM. He'll bring a thermal camera for the inspection.",
        timestamp: "2026-04-02T14:15:00Z",
        read: true,
      },
      {
        id: "msg-1c",
        direction: "inbound",
        body: "Perfect, thank you! Should I do anything to prepare before he arrives?",
        timestamp: "2026-04-02T14:18:00Z",
        read: true,
      },
      {
        id: "msg-1d",
        direction: "outbound",
        body: "Just make sure the area under the sink is cleared out so he can access the pipes easily. See you Thursday!",
        timestamp: "2026-04-02T14:22:00Z",
        read: true,
      },
      {
        id: "msg-1e",
        direction: "inbound",
        body: "Will do. Thanks again!",
        timestamp: "2026-04-02T14:25:00Z",
        read: false,
      },
    ],
  },
  {
    id: "conv-2",
    contactName: "James Peterson",
    phoneNumber: "5559876543",
    email: "james.p@email.com",
    channel: "sms",
    messages: [
      {
        id: "msg-2a",
        direction: "outbound",
        body: "Hi James, this is a reminder about your garage door opener installation tomorrow between 2-4 PM.",
        timestamp: "2026-04-02T13:00:00Z",
        read: true,
      },
      {
        id: "msg-2b",
        direction: "inbound",
        body: "Got it, thanks for the reminder. I'll make sure the garage is cleared.",
        timestamp: "2026-04-02T13:08:00Z",
        read: true,
      },
      {
        id: "msg-2c",
        direction: "outbound",
        body: "Great! Our team of two will be there. If anything changes, let us know.",
        timestamp: "2026-04-02T13:10:00Z",
        read: true,
      },
    ],
  },
  {
    id: "conv-3",
    contactName: "Susan Chen",
    phoneNumber: "5558765432",
    email: "susan.chen@email.com",
    channel: "email",
    messages: [
      {
        id: "msg-3a",
        direction: "inbound",
        body: "Hello, I received my invoice #1042 but I believe the total looks different from the estimate. Could you double-check?",
        timestamp: "2026-04-02T09:30:00Z",
        read: true,
      },
      {
        id: "msg-3b",
        direction: "outbound",
        body: "Hi Susan, thank you for reaching out. I reviewed invoice #1042 and the difference is the 8.25% sales tax that was applied. The labor and materials match the original estimate.",
        timestamp: "2026-04-02T10:15:00Z",
        read: true,
      },
      {
        id: "msg-3c",
        direction: "inbound",
        body: "Ah that makes sense! Also, I'd like to schedule my annual HVAC maintenance. What availability do you have next month?",
        timestamp: "2026-04-02T10:30:00Z",
        read: false,
      },
    ],
  },
  {
    id: "conv-4",
    contactName: "Robert Williams",
    phoneNumber: "5554443322",
    email: "rwilliams@email.com",
    channel: "sms",
    messages: [
      {
        id: "msg-4a",
        direction: "outbound",
        body: "Hi Robert, following up on our call about the bathroom remodel. I've attached the revised estimate for Option B at $12,400.",
        timestamp: "2026-04-01T16:30:00Z",
        read: true,
      },
      {
        id: "msg-4b",
        direction: "inbound",
        body: "Thanks! The estimate looks good. When is the earliest you could start?",
        timestamp: "2026-04-01T17:00:00Z",
        read: true,
      },
      {
        id: "msg-4c",
        direction: "outbound",
        body: "We could start as early as April 14th. The project should take about 5-7 business days. Want me to lock in that date?",
        timestamp: "2026-04-01T17:10:00Z",
        read: true,
      },
      {
        id: "msg-4d",
        direction: "inbound",
        body: "Let me confirm with my wife and I'll get back to you by Friday.",
        timestamp: "2026-04-01T17:20:00Z",
        read: true,
      },
    ],
  },
  {
    id: "conv-5",
    contactName: "Tom Bradley",
    phoneNumber: "5556667788",
    email: "tom.bradley@email.com",
    channel: "sms",
    messages: [
      {
        id: "msg-5a",
        direction: "inbound",
        body: "URGENT - My water heater is leaking badly in the basement! Water is everywhere!",
        timestamp: "2026-04-01T09:05:00Z",
        read: true,
      },
      {
        id: "msg-5b",
        direction: "outbound",
        body: "Tom, we're dispatching Mike to your location right now. ETA 45 minutes. In the meantime, please shut off the water supply valve near the heater if you can safely reach it.",
        timestamp: "2026-04-01T09:08:00Z",
        read: true,
      },
      {
        id: "msg-5c",
        direction: "inbound",
        body: "Found the valve and shut it off. Thank you for the fast response!",
        timestamp: "2026-04-01T09:15:00Z",
        read: true,
      },
      {
        id: "msg-5d",
        direction: "outbound",
        body: "Great thinking. Mike is on his way. He'll assess whether we can repair or if replacement is needed.",
        timestamp: "2026-04-01T09:18:00Z",
        read: true,
      },
      {
        id: "msg-5e",
        direction: "inbound",
        body: "Mike just arrived. He's looking at it now.",
        timestamp: "2026-04-01T09:55:00Z",
        read: true,
      },
    ],
  },
  {
    id: "conv-6",
    contactName: "Angela Martinez",
    phoneNumber: "5559998877",
    email: "angela.m@email.com",
    channel: "email",
    messages: [
      {
        id: "msg-6a",
        direction: "outbound",
        body: "Hi Angela, just following up on your electrical panel upgrade that we completed last week. Everything working well?",
        timestamp: "2026-03-31T15:45:00Z",
        read: true,
      },
      {
        id: "msg-6b",
        direction: "inbound",
        body: "Everything is working perfectly! The new panel is so much quieter. Really happy with the work your team did.",
        timestamp: "2026-03-31T16:20:00Z",
        read: true,
      },
      {
        id: "msg-6c",
        direction: "outbound",
        body: "Wonderful to hear! If you have a moment, we'd really appreciate a review on Google. Here's the link: [review link]. Thanks again for choosing us!",
        timestamp: "2026-03-31T16:30:00Z",
        read: true,
      },
    ],
  },
  {
    id: "conv-7",
    contactName: "Diana Ross",
    phoneNumber: "5551112233",
    email: "diana.ross@email.com",
    channel: "sms",
    messages: [
      {
        id: "msg-7a",
        direction: "inbound",
        body: "Hi, I got your number from a neighbor. Do you do residential electrical work? I need some outdoor lighting installed.",
        timestamp: "2026-04-02T15:00:00Z",
        read: false,
      },
    ],
  },
  {
    id: "conv-8",
    contactName: "Carlos Rivera",
    phoneNumber: "5552223344",
    email: "carlos.r@email.com",
    channel: "sms",
    messages: [
      {
        id: "msg-8a",
        direction: "outbound",
        body: "Hi Carlos, your dryer vent cleaning is scheduled for Monday April 6th between 9-11 AM. Reply CONFIRM to confirm.",
        timestamp: "2026-04-02T11:00:00Z",
        read: true,
      },
      {
        id: "msg-8b",
        direction: "inbound",
        body: "CONFIRM",
        timestamp: "2026-04-02T11:15:00Z",
        read: false,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Channel tabs
// ---------------------------------------------------------------------------

const CHANNEL_TABS: { label: string; value: Channel | "all" }[] = [
  { label: "All", value: "all" },
  { label: "SMS", value: "sms" },
  { label: "Email", value: "email" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (isToday) return time;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getLastMessage(conversation: Conversation): Message {
  return conversation.messages[conversation.messages.length - 1];
}

function getUnreadCount(conversation: Conversation): number {
  return conversation.messages.filter(
    (m) => !m.read && m.direction === "inbound"
  ).length;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function MessagesPage() {
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(MOCK_CONVERSATIONS[0].id);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Computed
  const filteredConversations = conversations
    .filter((c) => {
      if (channelFilter !== "all" && c.channel !== channelFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.contactName.toLowerCase().includes(q) ||
          c.phoneNumber.includes(q) ||
          c.email.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aTime = new Date(getLastMessage(a).timestamp).getTime();
      const bTime = new Date(getLastMessage(b).timestamp).getTime();
      return bTime - aTime;
    });

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) ?? null;

  const totalUnread = conversations.reduce(
    (sum, c) => sum + getUnreadCount(c),
    0
  );

  // Scroll to bottom on conversation change or new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversationId, conversations]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    const newMessage: Message = {
      id: `msg-new-${Date.now()}`,
      direction: "outbound",
      body: messageInput.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );
    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          {totalUnread > 0 && (
            <Badge color="red" dot>
              {totalUnread} unread
            </Badge>
          )}
        </div>
        <Button variant="primary" size="md">
          <Plus className="mr-1.5 h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Two-panel layout */}
      <Card className="overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <div className="flex h-full">
          {/* Left panel: Conversation list */}
          <div
            className={cn(
              "flex h-full w-full flex-col border-r border-gray-200 lg:w-[380px] lg:shrink-0",
              selectedConversation ? "hidden lg:flex" : "flex"
            )}
          >
            {/* Search and filters */}
            <div className="space-y-3 border-b border-gray-100 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
                {CHANNEL_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setChannelFilter(tab.value)}
                    className={cn(
                      "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      channelFilter === tab.value
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-gray-400">
                  <MessageSquare className="mb-2 h-8 w-8" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conv) => {
                    const lastMsg = getLastMessage(conv);
                    const unread = getUnreadCount(conv);
                    const isSelected = selectedConversationId === conv.id;

                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => setSelectedConversationId(conv.id)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                          isSelected && "bg-blue-50 hover:bg-blue-50"
                        )}
                      >
                        {/* Avatar */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                          {conv.contactName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={cn(
                                "truncate text-sm",
                                unread > 0
                                  ? "font-semibold text-gray-900"
                                  : "font-medium text-gray-900"
                              )}
                            >
                              {conv.contactName}
                            </p>
                            <span className="shrink-0 text-xs text-gray-400">
                              {formatTimestamp(lastMsg.timestamp)}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p
                              className={cn(
                                "truncate text-xs",
                                unread > 0
                                  ? "font-medium text-gray-700"
                                  : "text-gray-500"
                              )}
                            >
                              {lastMsg.direction === "outbound" && (
                                <span className="text-gray-400">You: </span>
                              )}
                              {lastMsg.body}
                            </p>
                            <div className="flex shrink-0 items-center gap-1.5">
                              {conv.channel === "email" && (
                                <Mail className="h-3 w-3 text-gray-400" />
                              )}
                              {unread > 0 && (
                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                                  {unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Message thread */}
          <div
            className={cn(
              "flex h-full flex-1 flex-col",
              !selectedConversation ? "hidden lg:flex" : "flex"
            )}
          >
            {selectedConversation ? (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 lg:px-6">
                  <button
                    type="button"
                    onClick={() => setSelectedConversationId(null)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                    {selectedConversation.contactName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedConversation.contactName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.channel === "sms"
                        ? formatPhone(selectedConversation.phoneNumber)
                        : selectedConversation.email}
                    </p>
                  </div>
                  <Badge
                    color={
                      selectedConversation.channel === "sms" ? "blue" : "purple"
                    }
                  >
                    {selectedConversation.channel === "sms" ? "SMS" : "Email"}
                  </Badge>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6">
                  <div className="space-y-3">
                    {selectedConversation.messages.map((msg, idx) => {
                      const isOutbound = msg.direction === "outbound";

                      // Show date separator if needed
                      const prevMsg =
                        idx > 0
                          ? selectedConversation.messages[idx - 1]
                          : null;
                      const msgDate = new Date(msg.timestamp).toDateString();
                      const prevDate = prevMsg
                        ? new Date(prevMsg.timestamp).toDateString()
                        : null;
                      const showDateSep = msgDate !== prevDate;

                      return (
                        <div key={msg.id}>
                          {showDateSep && (
                            <div className="flex items-center gap-3 py-2">
                              <div className="h-px flex-1 bg-gray-200" />
                              <span className="text-xs font-medium text-gray-400">
                                {new Date(msg.timestamp).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                              <div className="h-px flex-1 bg-gray-200" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "flex",
                              isOutbound ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2.5",
                                isOutbound
                                  ? "rounded-br-md bg-blue-600 text-white"
                                  : "rounded-bl-md bg-gray-100 text-gray-900"
                              )}
                            >
                              <p className="text-sm leading-relaxed">
                                {msg.body}
                              </p>
                              <p
                                className={cn(
                                  "mt-1 text-[10px]",
                                  isOutbound
                                    ? "text-blue-200"
                                    : "text-gray-400"
                                )}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message input */}
                <div className="border-t border-gray-100 px-4 py-3 lg:px-6">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Type a message to ${selectedConversation.contactName}...`}
                        rows={1}
                        className="block max-h-32 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        style={{
                          height: "auto",
                          minHeight: "42px",
                        }}
                      />
                    </div>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="h-[42px] px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Press Enter to send, Shift+Enter for a new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
                <MessageSquare className="mb-3 h-12 w-12" />
                <p className="text-sm font-medium">
                  Select a conversation to start messaging
                </p>
                <p className="mt-1 text-xs">
                  Or click &quot;New Message&quot; to start a new one
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
