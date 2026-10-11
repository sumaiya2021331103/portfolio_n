"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { browserClient } from "@/lib/supabase";

export default function ContactForm({ demo }: { demo: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (form.get("website")) return; // spam trap
    const db = browserClient();
    if (!db || demo) {
      setState("error");
      return;
    }
    setState("sending");
    const { error } = await db.from("messages").insert({
      name: String(form.get("name")).trim(),
      email: String(form.get("email")).trim(),
      message: String(form.get("message")).trim(),
    });
    setState(error ? "error" : "sent");
  }

  if (state === "sent") {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
        <CheckCircle2 className="size-10 text-accent" />
        <p className="text-lg font-semibold">Thanks! Your message was sent.</p>
        <p className="text-sm text-muted">I&apos;ll get back to you soon.</p>
      </div>
    );
  }

  const input =
    "w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/10";

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required maxLength={200} placeholder="Your name" className={input} aria-label="Your name" />
        <input name="email" type="email" required maxLength={320} placeholder="Your email" className={input} aria-label="Your email" />
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <textarea name="message" required maxLength={5000} rows={5} placeholder="Your message" className={input} aria-label="Message" />
      <button
        disabled={state === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60 dark:text-black"
      >
        {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send message
      </button>
      {state === "error" && (
        <p className="text-center text-sm text-red-500">{demo ? "The contact form works once the site is connected to its database." : "Something went wrong. Please try again or email me directly."}</p>
      )}
    </form>
  );
}
