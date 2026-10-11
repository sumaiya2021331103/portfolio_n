"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ExternalLink, Images, MapPin, X } from "lucide-react";
import type { Item } from "@/lib/types";
import { formatDate } from "@/lib/config";
import { Lightbox } from "./client";
import { Chip, RichText } from "./ui";

export default function Activities({ items }: { items: Item[] }) {
  const types = useMemo(() => Array.from(new Set(items.map((i) => i.data.type).filter(Boolean))) as string[], [items]);
  const [filter, setFilter] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const shown = filter === "All" ? items : items.filter((i) => i.data.type === filter);
  const open = items.find((i) => i.id === openId);

  return (
    <>
      {types.length > 1 && (
        <div className="reveal no-scrollbar mb-8 flex gap-2 overflow-x-auto">
          {["All", ...types].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === t ? "bg-accent text-white dark:text-black" : "border border-line text-muted hover:text-accent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((it) => {
          const d = it.data;
          const photos: string[] = d.photos || [];
          return (
            <button
              key={it.id}
              onClick={() => setOpenId(it.id)}
              className="card group overflow-hidden text-left transition hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-accent/10">
                {photos[0] ? (
                  <img src={photos[0]} alt={d.title} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="grid size-full place-items-center text-5xl font-bold text-accent/40">{(d.title || "?")[0]}</div>
                )}
                {photos.length > 1 && (
                  <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                    <Images className="size-3.5" /> {photos.length}
                  </span>
                )}
                {d.type && (
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900 backdrop-blur">{d.type}</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold leading-snug">{d.title}</h3>
                {(d.role || d.organization) && <p className="mt-1 text-sm text-muted">{[d.role, d.organization].filter(Boolean).join(" · ")}</p>}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  {d.date && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {formatDate(d.date, true)}
                    </span>
                  )}
                  {d.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {d.location}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {open && <ActivityModal item={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function ActivityModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const d = item.data;
  const photos: string[] = d.photos || [];
  const [viewer, setViewer] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && viewer === null && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, viewer]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-surface sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-label={d.title}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 p-5 backdrop-blur">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {d.type && <Chip accent>{d.type}</Chip>}
              {d.role && <Chip>{d.role}</Chip>}
            </div>
            <h3 className="text-xl font-bold">{d.title}</h3>
            <p className="mt-1 text-sm text-muted">
              {[d.organization, formatDate(d.date, true), d.location].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted hover:text-accent" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <RichText text={d.description} className="text-muted" />
          {d.link_url && (
            <a href={d.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              Learn more <ExternalLink className="size-4" />
            </a>
          )}
          {photos.length > 0 && (
            <div className="columns-2 gap-3 sm:columns-3">
              {photos.map((p, i) => (
                <button key={p + i} onClick={() => setViewer(i)} className="mb-3 block w-full overflow-hidden rounded-lg">
                  <img src={p} alt={`${d.title} photo ${i + 1}`} loading="lazy" className="w-full transition hover:scale-105" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {viewer !== null && <Lightbox photos={photos} index={viewer} onClose={() => setViewer(null)} />}
    </div>
  );
}
