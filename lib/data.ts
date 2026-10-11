import { cache } from "react";
import { serverClient } from "./supabase";
import { sortItems, withDefaults } from "./config";
import { SAMPLE_ITEMS, SAMPLE_SETTINGS } from "./sample";
import type { Item, SiteData } from "./types";

export const getSiteData = cache(async (): Promise<SiteData> => {
  const db = serverClient();
  if (!db) {
    return { settings: withDefaults(SAMPLE_SETTINGS), items: sortItems(SAMPLE_ITEMS), demo: true };
  }
  const [settingsRes, itemsRes] = await Promise.all([
    db.from("settings").select("data").eq("id", 1).maybeSingle(),
    db.from("items").select("*").eq("visible", true),
  ]);
  if (settingsRes.error) console.error("settings:", settingsRes.error.message);
  if (itemsRes.error) console.error("items:", itemsRes.error.message);
  return {
    settings: withDefaults(settingsRes.data?.data),
    items: sortItems((itemsRes.data as Item[]) || []),
    demo: false,
  };
});
