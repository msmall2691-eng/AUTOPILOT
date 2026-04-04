"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPhone } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Mail,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Channel = "sms" | "email";

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  createdAt: string;
  read: boolean;
  channel: string;
}

interface Conversation {
  id: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  channel: string;
  messages: Message[];
}

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
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getLastMessage(conversation: Conversation): Message | null {
  return conversation.messages[conversation.messages.length - 1] ?? null;
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
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        const convs = data.conversations ?? [];
        setConversations(convs);
        if (!selectedConversationId && convs.length > 0) {
          setSelectedConversationId(convs[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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
      const aLast = getLastMessage(a);
      const bLast = getLastMessage(b);
      if (!aLast || !bLast) return 0;
      return new Date(bLast.createdAt).getTime() - new Date(aLast.createdAt).getTime();
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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    const newMessage: Message = {
      id: `msg-new-${Date.now()}`,
      direction: "outbound",
      body: messageInput.trim(),
      createdAt: new Date().toISOString(),
      read: true,
      channel: selectedConversation?.channel ?? "sms",
    };

    // Optimistic update
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );
    setMessageInput("");

    // Send to API
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedConversationId,
          channel: selectedConversation?.channel ?? "sms",
          toAddress: selectedConversation?.phoneNumber || selectedConversation?.email || "",
          body: newMessage.body,
        }),
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

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
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                          {conv.contactName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn("truncate text-sm", unread > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-900")}>
                              {conv.contactName}
                            </p>
                            {lastMsg && (
                              <span className="shrink-0 text-xs text-gray-400">
                                {formatTimestamp(lastMsg.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p className={cn("truncate text-xs", unread > 0 ? "font-medium text-gray-700" : "text-gray-500")}>
                              {lastMsg?.direction === "outbound" && <span className="text-gray-400">You: </span>}
                              {lastMsg?.body ?? ""}
                            </p>
                            <div className="flex shrink-0 items-center gap-1.5">
                              {conv.channel === "email" && <Mail className="h-3 w-3 text-gray-400" />}
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
          <div className={cn("flex h-full flex-1 flex-col", !selectedConversation ? "hidden lg:flex" : "flex")}>
            {selectedConversation ? (
              <>
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 lg:px-6">
                  <button
                    type="button"
                    onClick={() => setSelectedConversationId(null)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                    {selectedConversation.contactName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{selectedConversation.contactName}</p>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.channel === "sms"
                        ? formatPhone(selectedConversation.phoneNumber)
                        : selectedConversation.email}
                    </p>
                  </div>
                  <Badge color={selectedConversation.channel === "sms" ? "blue" : "purple"}>
                    {selectedConversation.channel === "sms" ? "SMS" : "Email"}
                  </Badge>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6">
                  <div className="space-y-3">
                    {selectedConversation.messages.map((msg, idx) => {
                      const isOutbound = msg.direction === "outbound";
                      const prevMsg = idx > 0 ? selectedConversation.messages[idx - 1] : null;
                      const msgDate = new Date(msg.createdAt).toDateString();
                      const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
                      const showDateSep = msgDate !== prevDate;

                      return (
                        <div key={msg.id}>
                          {showDateSep && (
                            <div className="flex items-center gap-3 py-2">
                              <div className="h-px flex-1 bg-gray-200" />
                              <span className="text-xs font-medium text-gray-400">
                                {new Date(msg.createdAt).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <div className="h-px flex-1 bg-gray-200" />
                            </div>
                          )}
                          <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2.5",
                                isOutbound
                                  ? "rounded-br-md bg-blue-600 text-white"
                                  : "rounded-bl-md bg-gray-100 text-gray-900"
                              )}
                            >
                              <p className="text-sm leading-relaxed">{msg.body}</p>
                              <p className={cn("mt-1 text-[10px]", isOutbound ? "text-blue-200" : "text-gray-400")}>
                                {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

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
                        style={{ height: "auto", minHeight: "42px" }}
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
                <p className="text-sm font-medium">Select a conversation to start messaging</p>
                <p className="mt-1 text-xs">Or click &quot;New Message&quot; to start a new one</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
