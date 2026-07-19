"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Activity } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminAuditEntry } from "@/types";

export default function AuditPage() {
  const [items, setItems] = useState<AdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { setItems(await api.admin.audit.list({ limit: 200 })); }
      catch (e) { toast.error((e as Error).message); }
      finally { setLoading(false); }
    })();
  }, []);
  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        eyebrow="Forensics Shard"
        title={<>Audit <span className="text-apple-text-muted/40 font-light">Log</span></>}
        description="Most recent 200 admin actions across the platform."
      />

      {loading && <div className="h-32 rounded-[32px] bg-white/60 dark:bg-white/5 animate-pulse" />}
      {!loading && items.length === 0 && <EmptyState icon={Activity} title="No events recorded" description="Once admins act on the panel, every change shows up here." />}

      {!loading && items.length > 0 && (
        <Card className="border-none shadow-apple-soft bg-white/90 dark:bg-[#1D1D1F]/90 backdrop-blur-3xl rounded-[32px] overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-apple-gray dark:bg-white/5 text-left text-[11px] font-black uppercase tracking-widest text-apple-text-muted">
                <tr>
                  <th className="px-6 py-4">When</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">Meta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-border/50">
                {items.map((a, i) => (
                  <motion.tr key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.015, 0.4) }} className="hover:bg-apple-gray/50 dark:hover:bg-white/[0.03]">
                    <td className="px-6 py-4 text-xs text-apple-text-muted whitespace-nowrap">{relativeTime(a.createdAt)}</td>
                    <td className="px-6 py-4 text-xs">{a.actorEmail || `#${a.actorId ?? "?"}`}</td>
                    <td className="px-6 py-4"><code className="text-xs px-2 py-1 rounded-lg bg-apple-gray dark:bg-white/5">{a.action}</code></td>
                    <td className="px-6 py-4 text-xs text-apple-text-muted">{a.targetType ? `${a.targetType}#${a.targetId}` : "—"}</td>
                    <td className="px-6 py-4 text-xs text-apple-text-muted font-mono max-w-xs truncate">{JSON.stringify(a.meta)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
