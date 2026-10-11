export type Kind =
  | "projects"
  | "research"
  | "achievements"
  | "activities"
  | "experience"
  | "education"
  | "skills";

export type SectionKey =
  | "about"
  | "skills"
  | "research"
  | "projects"
  | "experience"
  | "education"
  | "achievements"
  | "activities"
  | "contact";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ItemData = Record<string, any>;

export interface Item {
  id: string;
  kind: Kind;
  data: ItemData;
  sort_order: number;
  visible: boolean;
  created_at?: string;
}

export interface LinkEntry {
  label: string;
  url: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface SectionConfig {
  key: SectionKey;
  title: string;
  subtitle?: string;
  visible: boolean;
}

export interface Settings {
  name: string;
  title: string;
  tagline: string;
  about: string;
  photo_url: string;
  cv_url: string;
  email: string;
  location: string;
  open_to_work: boolean;
  open_to_work_text: string;
  socials: LinkEntry[];
  stats: Stat[];
  accent: string;
  sections: SectionConfig[];
  seo_description: string;
  footer_text: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface SiteData {
  settings: Settings;
  items: Item[];
  demo: boolean;
}
