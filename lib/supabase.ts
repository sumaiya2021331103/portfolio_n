import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);

/** Read-only client for rendering public pages on the server. */
export function serverClient(): SupabaseClient | null {
  if (!isConfigured) return null;
  return createClient(url!, key!, { auth: { persistSession: false } });
}

let browser: SupabaseClient | null = null;

/** Client used in the browser (admin panel, contact form). */
export function browserClient(): SupabaseClient | null {
  if (!isConfigured) return null;
  if (!browser) browser = createBrowserClient(url!, key!);
  return browser;
}

export const MEDIA_BUCKET = "media";
