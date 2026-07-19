"use client";

import { MessageSquare } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function ChatModerationPage() {
  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        eyebrow="Conversation Shard"
        title={<>Chat <span className="text-apple-text-muted/40 font-light">Moderation</span></>}
        description="Buyer ↔ seller conversation oversight"
      />
      <EmptyState
        icon={MessageSquare}
        title="Chat module not yet wired in v2"
        description="Once the messaging service ships, flagged conversations will appear here with mute / suspend / delete actions."
      />
    </div>
  );
}
