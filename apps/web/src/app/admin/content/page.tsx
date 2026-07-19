"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AdminContentPage } from "@/types";

type Form = Partial<AdminContentPage>;

export default function ContentPagesAdminPage() {
  const [items, setItems] = useState<AdminContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Form | null>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.admin.contentPages.list()); }
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    try {
      await api.admin.contentPages.upsert({
        slug: editing.slug ?? "", title: editing.title ?? "",
        body: editing.body ?? "", isPublished: editing.isPublished ?? true,
      });
      toast.success("Saved"); setEditing(null); load();
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        eyebrow="Editorial Shard"
        title={<>Content <span className="text-apple-text-muted/40 font-light">pages</span></>}
        description="Privacy, terms, about, FAQ — anything Markdown-rendered on the site."
        actions={<Button className="rounded-2xl h-11 px-6" onClick={() => setEditing({ isPublished: true })}>+ New page</Button>}
      />
      {loading && <div className="h-32 rounded-[32px] bg-white/60 dark:bg-white/5 animate-pulse" />}
      {!loading && items.length === 0 && <EmptyState icon={FileText} title="No pages yet" />}
      {!loading && items.length > 0 && (
        <Card className="border-none shadow-apple-soft bg-white/90 dark:bg-[#1D1D1F]/90 backdrop-blur-3xl rounded-[32px] overflow-hidden">
          <CardContent className="p-0 divide-y divide-apple-border/50">
            {items.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="font-bold tracking-tight">{p.title}</div>
                  <div className="text-xs text-apple-text-muted">/{p.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.isPublished ? "success" : "outline"}>{p.isPublished ? "published" : "draft"}</Badge>
                  <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => setEditing({ ...p })}>Edit</Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1D1D1F] rounded-[32px] border border-apple-border/50 w-full max-w-2xl p-8 space-y-4 shadow-2xl my-8">
            <h3 className="text-2xl font-bold tracking-tight">{editing.id ? "Edit page" : "New page"}</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="text-[11px] font-black uppercase tracking-widest text-apple-text-muted">Slug</span><Input className="mt-1 rounded-2xl" value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></label>
              <label className="block"><span className="text-[11px] font-black uppercase tracking-widest text-apple-text-muted">Title</span><Input className="mt-1 rounded-2xl" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label>
            </div>
            <label className="block"><span className="text-[11px] font-black uppercase tracking-widest text-apple-text-muted">Body (Markdown)</span><textarea rows={14} value={editing.body ?? ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="mt-1 w-full px-4 py-3 bg-apple-gray dark:bg-white/5 border-none rounded-2xl text-sm font-mono focus:ring-2 focus:ring-apple-blue/30" /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.isPublished ?? true} onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })} /> Published</label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
