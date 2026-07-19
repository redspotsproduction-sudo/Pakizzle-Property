"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ShowcaseCategory } from "@/types";

type Form = Partial<ShowcaseCategory> & { isActive?: boolean };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<ShowcaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Form | null>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.admin.showcaseCategories.list()); }
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (f: Form) => {
    try {
      if (f.id) await api.admin.showcaseCategories.update(f.id, f);
      else await api.admin.showcaseCategories.create({
        slug: f.slug ?? "", title: f.title ?? "", image: f.image ?? "",
        subtitle: f.subtitle ?? "", icon: f.icon ?? "Sparkles",
        color: f.color ?? "text-apple-blue",
        gradient: f.gradient ?? "from-apple-blue/20 to-indigo-500/10",
        filterKey: f.filterKey ?? "", filterValue: f.filterValue ?? "",
        size: f.size ?? "small", sortOrder: f.sortOrder ?? 0,
      });
      toast.success("Saved"); setEditing(null); load();
    } catch (e) { toast.error((e as Error).message); }
  };

  const remove = async (c: ShowcaseCategory) => {
    if (!confirm(`Delete "${c.title}"?`)) return;
    try { await api.admin.showcaseCategories.remove(c.id); toast.success("Deleted"); load(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        eyebrow="Surface Shard"
        title={<>Showcase <span className="text-apple-text-muted/40 font-light">Categories</span></>}
        description="Homepage tiles linking buyers to curated marketplace filters."
        actions={<Button className="rounded-2xl h-11 px-6" onClick={() => setEditing({ size: "small", sortOrder: items.length })}>+ New category</Button>}
      />

      {loading && <div className="h-40 rounded-[32px] bg-white/60 dark:bg-white/5 animate-pulse" />}
      {!loading && items.length === 0 && <EmptyState icon={LayoutDashboard} title="No categories yet" description="Create your first showcase tile." />}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="border-none shadow-apple-soft bg-white/90 dark:bg-[#1D1D1F]/90 backdrop-blur-3xl rounded-[32px] overflow-hidden">
              <div className="relative aspect-video bg-apple-gray dark:bg-white/5">
                {c.image && <Image src={c.image} alt={c.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />}
              </div>
              <CardContent className="p-5 space-y-2">
                <div className="font-bold tracking-tight">{c.title}</div>
                <div className="text-xs text-apple-text-muted">{c.subtitle}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">
                  size {c.size} • {c.filterKey || "no filter"}{c.filterKey && c.filterValue ? `=${c.filterValue}` : ""}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="secondary" size="sm" className="flex-1 rounded-xl" onClick={() => setEditing({ ...c })}>Edit</Button>
                  <Button variant="ghost" size="sm" className="rounded-xl text-apple-red hover:bg-apple-red/10" onClick={() => remove(c)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {editing && <CatModal form={editing} onSave={save} onCancel={() => setEditing(null)} />}
    </div>
  );
}

function CatModal({ form, onSave, onCancel }: { form: Form; onSave: (f: Form) => void; onCancel: () => void }) {
  const [f, setF] = useState<Form>(form);
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-widest text-apple-text-muted mb-1 block">{label}</span>
      {children}
    </label>
  );
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={(e) => { e.preventDefault(); onSave(f); }}
        className="bg-white dark:bg-[#1D1D1F] rounded-[32px] border border-apple-border/50 w-full max-w-lg p-8 space-y-4 shadow-2xl my-8"
      >
        <h3 className="text-2xl font-bold tracking-tight">{f.id ? "Edit category" : "New category"}</h3>
        <Row label="Slug"><Input className="rounded-2xl" value={f.slug ?? ""} onChange={(e) => setF({ ...f, slug: e.target.value })} required /></Row>
        <Row label="Title"><Input className="rounded-2xl" value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} required /></Row>
        <Row label="Subtitle"><Input className="rounded-2xl" value={f.subtitle ?? ""} onChange={(e) => setF({ ...f, subtitle: e.target.value })} /></Row>
        <Row label="Image URL"><Input className="rounded-2xl" value={f.image ?? ""} onChange={(e) => setF({ ...f, image: e.target.value })} required /></Row>
        <div className="grid grid-cols-2 gap-3">
          <Row label="Icon (lucide name)"><Input className="rounded-2xl" value={f.icon ?? ""} onChange={(e) => setF({ ...f, icon: e.target.value })} /></Row>
          <Row label="Size">
            <select value={f.size ?? "small"} onChange={(e) => setF({ ...f, size: e.target.value as ShowcaseCategory["size"] })} className="h-10 w-full rounded-2xl bg-apple-gray dark:bg-white/5 px-3 text-sm">
              <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option>
            </select>
          </Row>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Row label="Filter key"><Input className="rounded-2xl" value={f.filterKey ?? ""} onChange={(e) => setF({ ...f, filterKey: e.target.value })} /></Row>
          <Row label="Filter value"><Input className="rounded-2xl" value={f.filterValue ?? ""} onChange={(e) => setF({ ...f, filterValue: e.target.value })} /></Row>
        </div>
        <Row label="Color class"><Input className="rounded-2xl" value={f.color ?? ""} onChange={(e) => setF({ ...f, color: e.target.value })} /></Row>
        <Row label="Gradient class"><Input className="rounded-2xl" value={f.gradient ?? ""} onChange={(e) => setF({ ...f, gradient: e.target.value })} /></Row>
        <Row label="Sort order"><Input type="number" className="rounded-2xl" value={f.sortOrder ?? 0} onChange={(e) => setF({ ...f, sortOrder: parseInt(e.target.value) || 0 })} /></Row>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button>Save</Button>
        </div>
      </motion.form>
    </div>
  );
}
