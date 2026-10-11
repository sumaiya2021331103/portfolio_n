"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, ImagePlus, Loader2, Trash2, Upload, X } from "lucide-react";
import type { Field } from "@/lib/config";
import { uploadFile } from "@/lib/upload";

export const inputCls =
  "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-accent/10";

export function Label({ field, children }: { field: Pick<Field, "label" | "required" | "help">; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {field.help && <span className="mt-1 block text-xs text-muted">{field.help}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 text-sm font-medium" role="switch" aria-checked={checked}>
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-accent" : "bg-line"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setText("");
  };
  return (
    <div className={`${inputCls} flex flex-wrap items-center gap-1.5`}>
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setText(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(text);
          } else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => text && add(text)}
        placeholder={value.length ? "Add more…" : placeholder || "Type and press Enter"}
        className="min-w-[8rem] flex-1 bg-transparent py-0.5 outline-none"
      />
    </div>
  );
}

function useUploader(folder: string) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const run = async (files: File[]): Promise<string[]> => {
    setError("");
    setBusy((b) => b + files.length);
    const urls: string[] = [];
    for (const f of files) {
      try {
        urls.push(await uploadFile(f, folder));
      } catch (e) {
        setError(`Upload failed for ${f.name}: ${(e as Error).message}`);
      } finally {
        setBusy((b) => b - 1);
      }
    }
    return urls;
  };
  return { busy, error, run };
}

export function ImageField({ value, onChange, folder }: { value?: string; onChange: (v: string) => void; folder: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const { busy, error, run } = useUploader(folder);
  return (
    <div>
      {value ? (
        <div className="group relative w-fit">
          <img src={value} alt="" className="h-36 max-w-full rounded-lg border border-line object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition group-hover:opacity-100">
            <button type="button" onClick={() => ref.current?.click()} className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black">
              Replace
            </button>
            <button type="button" onClick={() => onChange("")} className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex h-36 w-full max-w-xs flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line text-sm text-muted transition hover:border-accent hover:text-accent"
        >
          {busy ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
          {busy ? "Uploading…" : "Upload image"}
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) {
            const [url] = await run([f]);
            if (url) onChange(url);
          }
        }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function ImagesField({ value, onChange, folder }: { value: string[]; onChange: (v: string[]) => void; folder: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const latest = useRef(value);
  latest.current = value;
  const { busy, error, run } = useUploader(folder);
  const [drag, setDrag] = useState(false);

  const addFiles = async (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) return;
    const urls = await run(imgs);
    onChange([...latest.current, ...urls]);
  };
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        addFiles(Array.from(e.dataTransfer.files));
      }}
      className={`rounded-lg border-2 border-dashed p-3 transition ${drag ? "border-accent bg-accent/5" : "border-line"}`}
    >
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((url, i) => (
          <div key={url + i} className="group relative aspect-square overflow-hidden rounded-md border border-line">
            <img src={url} alt="" className="size-full object-cover" />
            {i === 0 && <span className="absolute top-1 left-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white dark:text-black">COVER</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 opacity-0 transition group-hover:opacity-100 max-sm:opacity-100">
              <button type="button" onClick={() => move(i, -1)} className="p-1 text-white" aria-label="Move left">
                <ArrowLeft className="size-3.5" />
              </button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="p-1 text-red-300" aria-label="Remove photo">
                <Trash2 className="size-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} className="p-1 text-white" aria-label="Move right">
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: busy }).map((_, i) => (
          <div key={`busy${i}`} className="grid aspect-square place-items-center rounded-md bg-accent/5">
            <Loader2 className="size-5 animate-spin text-accent" />
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md bg-accent/5 text-xs font-medium text-accent transition hover:bg-accent/10"
        >
          <ImagePlus className="size-5" />
          Add photos
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">Tip: you can select many photos at once, or drag & drop them here.</p>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          addFiles(files);
        }}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function FileField({ value, onChange, folder, accept }: { value?: string; onChange: (v: string) => void; folder: string; accept?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const { busy, error, run } = useUploader(folder);
  return (
    <div className="flex flex-wrap items-center gap-3">
      {value && (
        <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
          <FileText className="size-4" /> View current file
        </a>
      )}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {value ? "Replace file" : "Upload file"}
      </button>
      {value && (
        <button type="button" onClick={() => onChange("")} className="text-sm text-red-500 hover:underline">
          Remove
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) {
            const [url] = await run([f]);
            if (url) onChange(url);
          }
        }}
      />
      {error && <p className="w-full text-xs text-red-500">{error}</p>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FieldInput({ field, value, onChange, folder }: { field: Field; value: any; onChange: (v: any) => void; folder: string }) {
  switch (field.type) {
    case "textarea":
      return (
        <Label field={field}>
          <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={5} placeholder={field.placeholder} className={inputCls} />
        </Label>
      );
    case "select": {
      const id = `list-${field.key}`;
      return (
        <Label field={{ ...field, help: field.help || "Pick one or type your own." }}>
          <input list={id} value={value || ""} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder="Choose…" />
          <datalist id={id}>
            {field.options?.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </Label>
      );
    }
    case "tags":
      return (
        <Label field={{ ...field, help: field.help || "Press Enter or comma after each one." }}>
          <TagInput value={value || []} onChange={onChange} placeholder={field.placeholder} />
        </Label>
      );
    case "boolean":
      return <Toggle checked={!!value} onChange={onChange} label={field.label} />;
    case "image":
      return (
        <Label field={field}>
          <ImageField value={value} onChange={onChange} folder={folder} />
        </Label>
      );
    case "images":
      return (
        <div>
          <span className="mb-1.5 block text-sm font-medium">{field.label}</span>
          <ImagesField value={value || []} onChange={onChange} folder={folder} />
          {field.help && <span className="mt-1 block text-xs text-muted">{field.help}</span>}
        </div>
      );
    case "file":
      return (
        <div>
          <span className="mb-1.5 block text-sm font-medium">{field.label}</span>
          <FileField value={value} onChange={onChange} folder={folder} accept=".pdf,application/pdf" />
        </div>
      );
    default:
      return (
        <Label field={field}>
          <input
            type={field.type === "url" ? "url" : field.type === "date" ? "date" : field.type === "month" ? "month" : "text"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || (field.type === "url" ? "https://…" : field.type === "month" ? "YYYY-MM" : undefined)}
            className={inputCls}
          />
        </Label>
      );
  }
}
