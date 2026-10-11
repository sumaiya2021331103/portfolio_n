"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import type { CollectionConfig } from "@/lib/config";
import { sortItems } from "@/lib/config";
import { browserClient } from "@/lib/supabase";
import type { Item, ItemData } from "@/lib/types";
import { FieldInput } from "./fields";

export default function CollectionManager({ config, notify }: { config: CollectionConfig; notify: (msg: string, error?: boolean) => void }) {
  const db = browserClient()!;
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<Item | "new" | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await db.from("items").select("*").eq("kind", config.kind);
    if (error) notify(error.message, true);
    setItems(sortItems((data as Item[]) || []));
  }, [db, config.kind, notify]);

  useEffect(() => {
    setItems(null);
    setEditing(null);
    load();
  }, [load]);

  const toggleVisible = async (it: Item) => {
    const { error } = await db.from("items").update({ visible: !it.visible }).eq("id", it.id);
    if (error) return notify(error.message, true);
    notify(it.visible ? "Hidden from the website" : "Now visible on the website");
    load();
  };

  const remove = async (it: Item) => {
    if (!confirm(`Delete “${config.title(it.data) || "this item"}”? This cannot be undone.`)) return;
    const { error } = await db.from("items").delete().eq("id", it.id);
    if (error) return notify(error.message, true);
    notify("Deleted");
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!items) return;
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    const results = await Promise.all(next.map((it, i) => db.from("items").update({ sort_order: i + 1 }).eq("id", it.id)));
    const failed = results.find((r) => r.error);
    if (failed) notify(failed.error!.message, true);
    load();
  };

  if (editing) {
    return (
      <ItemEditor
        config={config}
        item={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
        notify={notify}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{config.label}</h1>
          <p className="mt-1 text-sm text-muted">{config.description}</p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 dark:text-black"
        >
          <Plus className="size-4" /> Add {config.singular.toLowerCase()}
        </button>
      </div>

      {items === null ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-accent" />
        </div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <p className="font-medium">Nothing here yet</p>
          <p className="text-sm text-muted">Click “Add {config.singular.toLowerCase()}” to create the first one. Empty sections are hidden on the website automatically.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => {
            const thumb = config.thumb?.(it.data);
            return (
              <li key={it.id} className={`card flex items-center gap-3 p-3 ${it.visible ? "" : "opacity-60"}`}>
                <div className="flex flex-col">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-muted hover:text-accent disabled:opacity-30" aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1 text-muted hover:text-accent disabled:opacity-30" aria-label="Move down">
                    <ArrowDown className="size-4" />
                  </button>
                </div>
                {config.thumb && (
                  <div className="size-12 shrink-0 overflow-hidden rounded-md bg-accent/10">{thumb && <img src={thumb} alt="" className="size-full object-cover" />}</div>
                )}
                <button onClick={() => setEditing(it)} className="min-w-0 flex-1 text-left">
                  <p className="truncate font-medium">{config.title(it.data) || "(untitled)"}</p>
                  <p className="truncate text-sm text-muted">{config.subtitle(it.data)}</p>
                </button>
                {!it.visible && <span className="hidden rounded bg-line px-2 py-0.5 text-xs text-muted sm:inline">Hidden</span>}
                <div className="flex shrink-0 items-center">
                  <IconBtn onClick={() => toggleVisible(it)} label={it.visible ? "Hide from website" : "Show on website"}>
                    {it.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </IconBtn>
                  <IconBtn onClick={() => setEditing(it)} label="Edit">
                    <Pencil className="size-4" />
                  </IconBtn>
                  <IconBtn onClick={() => remove(it)} label="Delete" danger>
                    <Trash2 className="size-4" />
                  </IconBtn>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function IconBtn({ onClick, label, children, danger }: { onClick: () => void; label: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid size-9 place-items-center rounded-lg text-muted transition hover:bg-bg ${danger ? "hover:text-red-500" : "hover:text-accent"}`}
    >
      {children}
    </button>
  );
}

function ItemEditor({
  config,
  item,
  onClose,
  onSaved,
  notify,
}: {
  config: CollectionConfig;
  item: Item | null;
  onClose: () => void;
  onSaved: () => void;
  notify: (msg: string, error?: boolean) => void;
}) {
  const db = browserClient()!;
  const [data, setData] = useState<ItemData>(item?.data || {});
  const [visible, setVisible] = useState(item?.visible ?? true);
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = config.fields.find((f) => f.required && !String(data[f.key] ?? "").trim());
    if (missing) return notify(`Please fill in “${missing.label}”`, true);
    setSaving(true);
    const clean: ItemData = {};
    for (const f of config.fields) {
      const v = data[f.key];
      if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0) || v === false) continue;
      clean[f.key] = typeof v === "string" ? v.trim() : v;
    }
    const { error } = item
      ? await db.from("items").update({ data: clean, visible }).eq("id", item.id)
      : await db.from("items").insert({ kind: config.kind, data: clean, visible, sort_order: 0 });
    setSaving(false);
    if (error) return notify(error.message, true);
    notify(item ? "Saved — the website is updated" : `${config.singular} added to the website`);
    onSaved();
  };

  return (
    <form onSubmit={save}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{config.label}</p>
          <h1 className="text-2xl font-bold">{item ? `Edit ${config.singular.toLowerCase()}` : `New ${config.singular.toLowerCase()}`}</h1>
        </div>
        <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg border border-line text-muted hover:text-accent" aria-label="Cancel">
          <X className="size-4" />
        </button>
      </div>
      <div className="card space-y-5 p-6">
        {config.fields.map((f) => (
          <FieldInput key={f.key} field={f} value={data[f.key]} onChange={(v) => setData((d) => ({ ...d, [f.key]: v }))} folder={config.kind} />
        ))}
      </div>
      <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border-t border-line bg-bg/90 py-4 backdrop-blur">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="size-4 accent-[var(--accent)]" />
          Show on website
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium">
            Cancel
          </button>
          <button
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:text-black"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
