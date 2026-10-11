"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, Trash2 } from "lucide-react";
import { browserClient } from "@/lib/supabase";
import type { Message } from "@/lib/types";

export default function Messages({ notify, onChange }: { notify: (msg: string, error?: boolean) => void; onChange: () => void }) {
  const db = browserClient()!;
  const [list, setList] = useState<Message[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await db.from("messages").select("*").order("created_at", { ascending: false });
    if (error) notify(error.message, true);
    setList((data as Message[]) || []);
    onChange();
  }, [db, notify, onChange]);

  useEffect(() => {
    load();
  }, [load]);

  const expand = async (m: Message) => {
    setOpen(open === m.id ? null : m.id);
    if (!m.read) {
      await db.from("messages").update({ read: true }).eq("id", m.id);
      load();
    }
  };

  const remove = async (m: Message) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await db.from("messages").delete().eq("id", m.id);
    if (error) return notify(error.message, true);
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="mt-1 text-sm text-muted">Messages people send through the contact form.</p>
      </div>
      {list === null ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-accent" />
        </div>
      ) : list.length === 0 ? (
        <div className="card p-12 text-center text-sm text-muted">No messages yet.</div>
      ) : (
        <ul className="space-y-2">
          {list.map((m) => (
            <li key={m.id} className="card overflow-hidden">
              <button onClick={() => expand(m)} className="flex w-full items-center gap-3 p-4 text-left">
                <span className={`size-2 shrink-0 rounded-full ${m.read ? "bg-transparent" : "bg-accent"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate ${m.read ? "" : "font-semibold"}`}>
                    {m.name} <span className="font-normal text-muted">· {m.email}</span>
                  </p>
                  <p className="truncate text-sm text-muted">{m.message}</p>
                </div>
                <span className="shrink-0 text-xs text-muted">{new Date(m.created_at).toLocaleDateString()}</span>
              </button>
              {open === m.id && (
                <div className="border-t border-line p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white dark:text-black"
                    >
                      <Mail className="size-4" /> Reply by email
                    </a>
                    <button onClick={() => remove(m)} className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-red-500">
                      <Trash2 className="size-4" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
