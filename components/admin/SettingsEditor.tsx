"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { ACCENTS, withDefaults } from "@/lib/config";
import { browserClient } from "@/lib/supabase";
import type { Settings } from "@/lib/types";
import { FieldInput, inputCls, Label, Toggle } from "./fields";

type Mode = "profile" | "appearance";

export default function SettingsEditor({ mode, notify }: { mode: Mode; notify: (msg: string, error?: boolean) => void }) {
  const db = browserClient()!;
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.from("settings")
      .select("data")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) notify(error.message, true);
        setS(withDefaults(data?.data));
      });
  }, [db, notify]);

  if (!s) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    );
  }

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v });

  const save = async () => {
    setSaving(true);
    const clean: Settings = {
      ...s,
      socials: s.socials.filter((l) => l.url.trim()).map((l) => ({ label: l.label.trim() || l.url, url: normalizeUrl(l.url.trim()) })),
      stats: s.stats.filter((x) => x.label.trim() || x.value.trim()),
    };
    const { error } = await db.from("settings").upsert({ id: 1, data: clean, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return notify(error.message, true);
    setS(clean);
    notify("Saved — the website is updated");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{mode === "profile" ? "Profile" : "Sections & theme"}</h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "profile"
            ? "Your name, title, bio, photo, CV and links. Update this whenever your status changes."
            : "Choose the accent colour and which sections appear, in what order, and with what titles."}
        </p>
      </div>

      {mode === "profile" ? <Profile s={s} set={set} /> : <Appearance s={s} set={set} />}

      <div className="sticky bottom-0 mt-6 flex justify-end border-t border-line bg-bg/90 py-4 backdrop-blur">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:text-black"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </button>
      </div>
    </div>
  );
}

function normalizeUrl(u: string) {
  if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(u)) return `mailto:${u}`;
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
  return `https://${u}`;
}

type Setter = <K extends keyof Settings>(k: K, v: Settings[K]) => void;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card mb-5 p-6">
      <h2 className="mb-5 font-semibold">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Profile({ s, set }: { s: Settings; set: Setter }) {
  const text = (k: keyof Settings, label: string, placeholder?: string, help?: string) => (
    <FieldInput field={{ key: k, label, type: "text", placeholder, help }} value={s[k]} onChange={(v) => set(k, v)} folder="profile" />
  );
  return (
    <>
      <Group title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          {text("name", "Full name")}
          {text("title", "Title / current status", "CSE Student", "e.g. CSE Student → later Software Engineer at …")}
        </div>
        {text("tagline", "Headline", "One sentence that sums you up")}
        <FieldInput
          field={{ key: "about", label: "About me", type: "textarea", help: "Leave an empty line between paragraphs." }}
          value={s.about}
          onChange={(v) => set("about", v)}
          folder="profile"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {text("location", "Location", "Sylhet, Bangladesh")}
          <FieldInput field={{ key: "email", label: "Public email", type: "text" }} value={s.email} onChange={(v) => set("email", v)} folder="profile" />
        </div>
        <Toggle checked={s.open_to_work} onChange={(v) => set("open_to_work", v)} label="Show an availability badge" />
        {s.open_to_work && text("open_to_work_text", "Badge text", "Open to internships")}
      </Group>

      <Group title="Photo & CV">
        <FieldInput field={{ key: "photo_url", label: "Profile photo", type: "image" }} value={s.photo_url} onChange={(v) => set("photo_url", v)} folder="profile" />
        <FieldInput field={{ key: "cv_url", label: "CV / Resume (PDF)", type: "file" }} value={s.cv_url} onChange={(v) => set("cv_url", v)} folder="cv" />
      </Group>

      <Group title="Links">
        <p className="-mt-3 text-sm text-muted">GitHub, LinkedIn, Google Scholar, Codeforces… Icons are picked automatically.</p>
        <ListEditor
          rows={s.socials.map((l) => [l.label, l.url])}
          placeholders={["Label (e.g. GitHub)", "Link (e.g. github.com/you)"]}
          onChange={(rows) => set("socials", rows.map(([label, url]) => ({ label, url })))}
          addLabel="Add link"
        />
      </Group>

      <Group title="Quick stats">
        <p className="-mt-3 text-sm text-muted">Small highlight numbers shown next to your bio, e.g. “3.80 — CGPA” or “10+ — Projects”.</p>
        <ListEditor
          rows={s.stats.map((x) => [x.value, x.label])}
          placeholders={["Value (e.g. 10+)", "Label (e.g. Projects)"]}
          onChange={(rows) => set("stats", rows.map(([value, label]) => ({ value, label })))}
          addLabel="Add stat"
        />
      </Group>

      <Group title="Search engines & footer">
        <FieldInput
          field={{ key: "seo_description", label: "Description for Google & link previews", type: "textarea", help: "If empty, your headline is used." }}
          value={s.seo_description}
          onChange={(v) => set("seo_description", v)}
          folder="profile"
        />
        {text("footer_text", "Footer text", "Built with ❤️ in Sylhet")}
      </Group>
    </>
  );
}

function ListEditor({
  rows,
  placeholders,
  onChange,
  addLabel,
}: {
  rows: [string, string][];
  placeholders: [string, string];
  onChange: (rows: [string, string][]) => void;
  addLabel: string;
}) {
  const update = (i: number, j: 0 | 1, v: string) => onChange(rows.map((r, k) => (k === i ? ((j === 0 ? [v, r[1]] : [r[0], v]) as [string, string]) : r)));
  const move = (i: number, d: -1 | 1) => {
    const n = [...rows];
    if (i + d < 0 || i + d >= n.length) return;
    [n[i], n[i + d]] = [n[i + d], n[i]];
    onChange(n);
  };
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={r[0]} onChange={(e) => update(i, 0, e.target.value)} placeholder={placeholders[0]} className={`${inputCls} sm:max-w-[12rem]`} />
          <input value={r[1]} onChange={(e) => update(i, 1, e.target.value)} placeholder={placeholders[1]} className={inputCls} />
          <button type="button" onClick={() => move(i, -1)} className="p-1.5 text-muted hover:text-accent max-sm:hidden" aria-label="Move up">
            <ArrowUp className="size-4" />
          </button>
          <button type="button" onClick={() => onChange(rows.filter((_, k) => k !== i))} className="p-1.5 text-muted hover:text-red-500" aria-label="Remove">
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...rows, ["", ""]])} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}

function Appearance({ s, set }: { s: Settings; set: Setter }) {
  const move = (i: number, d: -1 | 1) => {
    const n = [...s.sections];
    if (i + d < 0 || i + d >= n.length) return;
    [n[i], n[i + d]] = [n[i + d], n[i]];
    set("sections", n);
  };
  const update = (i: number, patch: Partial<Settings["sections"][number]>) => set("sections", s.sections.map((x, k) => (k === i ? { ...x, ...patch } : x)));

  return (
    <>
      <Group title="Accent colour">
        <div className="flex flex-wrap gap-3">
          {Object.entries(ACCENTS).map(([key, a]) => (
            <button
              key={key}
              type="button"
              onClick={() => set("accent", key)}
              className={`flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm font-medium transition ${s.accent === key ? "border-fg" : "border-line"}`}
            >
              <span className="grid size-6 place-items-center rounded-full" style={{ background: a.light }}>
                {s.accent === key && <Check className="size-3.5 text-white" />}
              </span>
              {a.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">Visitors can switch between light and dark mode themselves.</p>
      </Group>

      <Group title="Sections">
        <p className="-mt-3 text-sm text-muted">Reorder, rename or hide sections. Sections with no content are hidden automatically.</p>
        <ul className="space-y-3">
          {s.sections.map((sec, i) => (
            <li key={sec.key} className={`rounded-lg border border-line p-4 ${sec.visible ? "" : "opacity-60"}`}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-muted hover:text-accent disabled:opacity-30" aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === s.sections.length - 1}
                    className="p-1 text-muted hover:text-accent disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">{sec.key}</span>
                <div className="ml-auto">
                  <Toggle checked={sec.visible} onChange={(v) => update(i, { visible: v })} label={sec.visible ? "Shown" : "Hidden"} />
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Label field={{ label: "Title" }}>
                  <input value={sec.title} onChange={(e) => update(i, { title: e.target.value })} className={inputCls} />
                </Label>
                <Label field={{ label: "Subtitle (optional)" }}>
                  <input value={sec.subtitle || ""} onChange={(e) => update(i, { subtitle: e.target.value })} className={inputCls} />
                </Label>
              </div>
            </li>
          ))}
        </ul>
      </Group>
    </>
  );
}
