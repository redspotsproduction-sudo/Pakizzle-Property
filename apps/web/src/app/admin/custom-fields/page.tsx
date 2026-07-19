"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminCustomField } from "@/types";

export default function CustomFieldsPage() {
  const [items, setItems] = useState<AdminCustomField[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { setItems(await api.admin.customFields.list()); }
      catch (e) { toast.error((e as Error).message); }
      finally { setLoading(false); }
    })();
  }, []);
  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        eyebrow="Schema Shard"
        title={<>Custom <span className="text-apple-text-muted/40 font-light">Fields</span></>}
        description="Extra fields buyers or sellers see on listings."
      />
      {loading && <div className="h-32 rounded-[32px] bg-white/60 dark:bg-white/5 animate-pulse" />}
      {!loading && items.length === 0 && <EmptyState icon={FileText} title="No custom fields defined" description="Define a custom field and it will appear in the sell flow." />}
      {!loading && items.length > 0 && (
        <Card className="border-none shadow-apple-soft bg-white/90 dark:bg-[#1D1D1F]/90 backdrop-blur-3xl rounded-[32px] overflow-hidden">
          <CardContent className="p-0 divide-y divide-apple-border/50">
            {items.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="px-6 py-4">
                <div className="font-bold tracking-tight">{f.label}</div>
                <div className="text-xs text-apple-text-muted">/{f.slug} • {f.fieldType}{f.required ? " • required" : ""} • applies to {f.appliesTo}</div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
