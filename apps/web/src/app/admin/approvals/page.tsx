"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatPrice, relativeTime } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminListing } from "@/types";

export default function ApprovalCenterPage() {
  const [items, setItems] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setItems((await api.admin.listings.list({ status: "pending", limit: 100 })).items); }
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const decide = async (id: number, status: "active" | "rejected") => {
    try {
      const reason = status === "rejected" ? (prompt("Reason for rejection?") ?? "") : undefined;
      await api.admin.listings.setStatus(id, { status, reason });
      toast.success(`Listing ${status === "active" ? "approved" : "rejected"}`);
      load();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        eyebrow="Triage Shard"
        title={<>Approval <span className="text-apple-text-muted/40 font-light">Center</span></>}
        description={`${items.length} listings awaiting review.`}
      />

      {loading && (
        <div className="grid sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 rounded-[32px] bg-white/60 dark:bg-white/5 animate-pulse" />)}
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState icon={CheckCircle2} title="Inbox zero." description="No listings pending review right now." />
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {items.map((l, i) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-none shadow-apple-soft bg-white/90 dark:bg-[#1D1D1F]/90 backdrop-blur-3xl rounded-[32px] overflow-hidden hover:shadow-apple-hover transition-all duration-500">
              <CardContent className="p-7 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/vehicle/${l.id}`} className="font-bold text-lg tracking-tight text-apple-text hover:text-apple-blue">{l.title}</Link>
                    <div className="text-xs text-apple-text-muted">#{l.id} • {l.sellerEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatPrice(l.price)}</div>
                    <div className="text-xs text-apple-text-muted">{l.year} • {l.city ?? "—"}</div>
                  </div>
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest text-apple-text-muted">
                  Submitted {relativeTime(l.createdAt)}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => decide(l.id, "active")} className="flex-1 rounded-2xl bg-apple-green text-white hover:bg-apple-green/90 shadow-apple-green/20">Approve</Button>
                  <Button onClick={() => decide(l.id, "rejected")} variant="outline" className="flex-1 rounded-2xl text-apple-red hover:bg-apple-red/10 border-apple-red/30">Reject</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
