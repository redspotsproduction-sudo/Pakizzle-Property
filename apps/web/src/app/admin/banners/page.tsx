"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Tag } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Banner } from "@/types";

type Form = Partial<Banner> & { slug?: string };

export default function AdminBannersPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Form | null>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.admin.banners.list()); }
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (f: Form) => {
    try {
      if (f.id) await api.admin.banners.update(f.id, f);
      else await api.admin.banners.create({
        slug: f.slug ?? "", name: f.name ?? "", image: f.image ?? "",
        type: f.type ?? "external", status: f.status ?? "active",
        displayOrder: f.displayOrder ?? 0,
        externalLink: f.externalLink ?? null, targetId: f.targetId ?? null,
      });
      toast.success("Saved"); setEditing(null); load();
    } catch (e) { toast.error((e as Error).message); }
  };

  const remove = async (b: Banner) => {
    if (!confirm(`Delete banner "${b.name}"?`)) return;
    try { await api.admin.banners.remove(b.id); toast.success("Deleted"); load(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        eyebrow="Content Shard"
        title={<>Banners <span className="text-apple-text-muted/40 font-light">& Sliders</span></>}
        description="Hero banners shown on the homepage and category landing pages."
        actions={<Button className="rounded-2xl h-11 px-6" onClick={() => setEditing({ type: "external", status: "active", displayOrder: items.length })}>+ New banner</Button>}
      />

      {loading && <div className="h-40 rounded-[32px] bg-white/60 dark:bg-white/5 animate-pulse" />}
      {!loading && items.length === 0 && <EmptyState icon={Tag} title="No banners yet" description="Add a banner and it'll show in the hero rotator." />}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="border-none shadow-apple-soft bg-white/90 dark:bg-[#1D1D1F]/90 backdrop-blur-3xl rounded-[32px] overflow-hidden">
              <div className="relative aspect-video bg-apple-gray dark:bg-white/5">
                {b.image && <Image src={b.image} alt={b.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />}
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold tracking-tight">{b.name}</div>
                    <div className="text-xs text-apple-text-muted">/{b.slug}</div>
                  </div>
                  <Badge variant={b.status === "active" ? "success" : "outline"}>{b.status}</Badge>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-apple-text-muted">{b.type} • order {b.displayOrder}</div>
                <div className="flex gap-2 pt-1">
                  <Button variant="secondary" size="sm" className="flex-1 rounded-xl" onClick={() => setEditing(b)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="rounded-xl text-apple-red hover:bg-apple-red/10" onClick={() => remove(b)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {editing && <BannerModal form={editing} onSave={save} onCancel={() => setEditing(null)} />}
    </div>
  );
}

function BannerModal({ form, onSave, onCancel }: { form: Form; onSave: (f: Form) => void; onCancel: () => void }) {
  const [f, setF] = useState<Form>(form);
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={(e) => { e.preventDefault(); onSave(f); }}
        className="bg-white dark:bg-[#1D1D1F] rounded-[32px] border border-apple-border/50 w-full max-w-lg p-8 space-y-5 shadow-2xl my-8"
      >
        <h3 className="text-2xl font-bold tracking-tight">{f.id ? "Edit banner" : "New banner"}</h3>
        <Field label="Slug"><Input className="rounded-2xl" value={f.slug ?? ""} onChange={(e) => setF({ ...f, slug: e.target.value })} required /></Field>
        <Field label="Name"><Input className="rounded-2xl" value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
        <Field label="Image URL"><Input className="rounded-2xl" value={f.image ?? ""} onChange={(e) => setF({ ...f, image: e.target.value })} required /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Type">
            <select value={f.type ?? "external"} onChange={(e) => setF({ ...f, type: e.target.value as Banner["type"] })} className="h-10 w-full rounded-2xl bg-apple-gray dark:bg-white/5 px-3 text-sm">
              <option value="external">External</option>
              <option value="category">Category</option>
              <option value="advertisement">Advertisement</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={f.status ?? "active"} onChange={(e) => setF({ ...f, status: e.target.value as Banner["status"] })} className="h-10 w-full rounded-2xl bg-apple-gray dark:bg-white/5 px-3 text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Order">
            <Input type="number" className="rounded-2xl" value={f.displayOrder ?? 0} onChange={(e) => setF({ ...f, displayOrder: parseInt(e.target.value) || 0 })} />
          </Field>
        </div>
        <Field label="External link"><Input className="rounded-2xl" value={f.externalLink ?? ""} onChange={(e) => setF({ ...f, externalLink: e.target.value })} /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button>Save</Button>
        </div>
      </motion.form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-widest text-apple-text-muted mb-1 block">{label}</span>
      {children}
    </label>
  );
}
