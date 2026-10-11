"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Award,
  BookOpen,
  Briefcase,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Images,
  Inbox,
  LayoutList,
  Loader2,
  LogOut,
  Menu,
  Palette,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { COLLECTIONS, collectionFor } from "@/lib/config";
import { browserClient, isConfigured } from "@/lib/supabase";
import type { Kind } from "@/lib/types";
import { ThemeToggle } from "@/components/site/client";
import CollectionManager from "./CollectionManager";
import SettingsEditor from "./SettingsEditor";
import Messages from "./Messages";
import { inputCls } from "./fields";

type Tab = "profile" | "appearance" | "messages" | Kind;

const ICONS: Record<Kind, typeof Award> = {
  projects: FolderGit2,
  research: BookOpen,
  achievements: Award,
  activities: Images,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
};

export default function AdminApp() {
  if (!isConfigured) return <NotConfigured />;
  return <Authed />;
}

function NotConfigured() {
  return (
    <Center>
      <h1 className="text-xl font-bold">Almost there!</h1>
      <p className="mt-2 text-sm text-muted">
        The admin panel needs the database connection. Follow <strong>SETUP.md</strong> in the GitHub repository to connect Supabase (about 10 minutes, one time only).
      </p>
    </Center>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="card w-full max-w-sm p-8">{children}</div>
    </div>
  );
}

function Authed() {
  const db = browserClient()!;
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [owner, setOwner] = useState<boolean | null>(null);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    db.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = db.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, [db]);

  useEffect(() => {
    if (!session) return setOwner(null);
    db.rpc("claim_admin").then(({ data, error }) => setOwner(!error && data === true));
  }, [db, session]);

  if (session === undefined || (session && owner === null)) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    );
  }
  if (recovery && session) return <NewPassword onDone={() => setRecovery(false)} />;
  if (!session) return <Login />;
  if (!owner) {
    return (
      <Center>
        <h1 className="text-xl font-bold">No access</h1>
        <p className="mt-2 text-sm text-muted">This account is not the owner of this website.</p>
        <button onClick={() => db.auth.signOut()} className="mt-6 w-full rounded-lg border border-line py-2.5 text-sm font-medium">
          Sign out
        </button>
      </Center>
    );
  }
  return <Dashboard email={session.user.email || ""} />;
}

function Login() {
  const db = browserClient()!;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await db.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMsg({ text: error.message === "Invalid login credentials" ? "Wrong email or password." : error.message, error: true });
  };

  const forgot = async () => {
    if (!email) return setMsg({ text: "Type your email above first.", error: true });
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/admin` });
    setMsg(error ? { text: error.message, error: true } : { text: "Check your inbox for a password reset link." });
  };

  return (
    <Center>
      <h1 className="text-xl font-bold">Admin sign in</h1>
      <p className="mt-1 text-sm text-muted">Manage your portfolio content.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputCls} autoComplete="email" />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={inputCls}
          autoComplete="current-password"
        />
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:text-black">
          {busy && <Loader2 className="size-4 animate-spin" />} Sign in
        </button>
      </form>
      <button onClick={forgot} className="mt-3 text-sm text-muted hover:text-accent">
        Forgot password?
      </button>
      {msg && <p className={`mt-3 text-sm ${msg.error ? "text-red-500" : "text-emerald-600"}`}>{msg.text}</p>}
    </Center>
  );
}

function NewPassword({ onDone }: { onDone: () => void }) {
  const db = browserClient()!;
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await db.auth.updateUser({ password: pw });
    if (error) setErr(error.message);
    else onDone();
  };
  return (
    <Center>
      <h1 className="text-xl font-bold">Set a new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (8+ characters)" className={inputCls} />
        <button className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white dark:text-black">Save password</button>
      </form>
      {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
    </Center>
  );
}

function Dashboard({ email }: { email: string }) {
  const db = browserClient()!;
  const [tab, setTab] = useState<Tab>("profile");
  const [menu, setMenu] = useState(false);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);

  const notify = useCallback((text: string, error?: boolean) => {
    setToast({ text, error });
    setTimeout(() => setToast(null), error ? 6000 : 2500);
  }, []);

  const refreshUnread = useCallback(() => {
    db.from("messages")
      .select("id", { count: "exact", head: true })
      .eq("read", false)
      .then(({ count }) => setUnread(count || 0));
  }, [db]);

  useEffect(() => {
    const t = new URLSearchParams(location.search).get("tab") as Tab | null;
    if (t) setTab(t);
    refreshUnread();
  }, [refreshUnread]);

  const go = (t: Tab) => {
    setTab(t);
    setMenu(false);
    history.replaceState(null, "", `?tab=${t}`);
    window.scrollTo(0, 0);
  };

  const NavBtn = ({ t, icon: Icon, label, badge }: { t: Tab; icon: typeof Award; label: string; badge?: number }) => (
    <button
      onClick={() => go(t)}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
        tab === t ? "bg-accent/10 text-accent" : "text-muted hover:bg-bg hover:text-fg"
      }`}
    >
      <Icon className="size-4" />
      <span className="flex-1 text-left">{label}</span>
      {!!badge && <span className="rounded-full bg-accent px-2 text-xs font-bold text-white dark:text-black">{badge}</span>}
    </button>
  );

  const sidebar = (
    <nav className="space-y-6">
      <div className="space-y-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">You</p>
        <NavBtn t="profile" icon={UserRound} label="Profile" />
        <NavBtn t="appearance" icon={Palette} label="Sections & theme" />
        <NavBtn t="messages" icon={Inbox} label="Messages" badge={unread} />
      </div>
      <div className="space-y-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">Content</p>
        {COLLECTIONS.map((c) => (
          <NavBtn key={c.kind} t={c.kind} icon={ICONS[c.kind] || LayoutList} label={c.label} />
        ))}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <button className="lg:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">
            {menu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <span className="font-bold">
            Admin<span className="text-accent">.</span>
          </span>
          <span className="hidden truncate text-sm text-muted sm:inline">{email}</span>
          <div className="ml-auto flex items-center gap-2">
            <a href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:text-accent">
              View site <ExternalLink className="size-3.5" />
            </a>
            <ThemeToggle />
            <button onClick={() => db.auth.signOut()} className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-red-500" aria-label="Sign out" title="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>
      {menu && <div className="border-b border-line bg-surface p-4 lg:hidden">{sidebar}</div>}
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        <aside className="sticky top-22 hidden h-fit w-56 shrink-0 lg:block">{sidebar}</aside>
        <main className="min-w-0 flex-1">
          {tab === "profile" || tab === "appearance" ? (
            <SettingsEditor key={tab} mode={tab} notify={notify} />
          ) : tab === "messages" ? (
            <Messages notify={notify} onChange={refreshUnread} />
          ) : COLLECTIONS.some((c) => c.kind === tab) ? (
            <CollectionManager config={collectionFor(tab)} notify={notify} />
          ) : null}
        </main>
      </div>
      {toast && (
        <div
          className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
            toast.error ? "bg-red-600" : "bg-slate-900 dark:bg-slate-700"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
