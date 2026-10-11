import type { Item, Kind, SectionConfig, SectionKey, Settings } from "./types";

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "date"
  | "month"
  | "select"
  | "tags"
  | "boolean"
  | "image"
  | "images"
  | "file";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
}

export interface CollectionConfig {
  kind: Kind;
  label: string;
  singular: string;
  description: string;
  fields: Field[];
  title: (d: Item["data"]) => string;
  subtitle: (d: Item["data"]) => string;
  thumb?: (d: Item["data"]) => string | undefined;
}

const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" · ");

export const COLLECTIONS: CollectionConfig[] = [
  {
    kind: "projects",
    label: "Projects",
    singular: "Project",
    description: "Things you've built. Featured projects appear larger.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "summary", label: "Short summary", type: "text", placeholder: "One line about the project" },
      { key: "description", label: "Details", type: "textarea" },
      { key: "image", label: "Cover image / screenshot", type: "image" },
      { key: "tech", label: "Technologies", type: "tags", placeholder: "React, Python, Firebase" },
      { key: "github_url", label: "Code link (GitHub)", type: "url" },
      { key: "live_url", label: "Live demo link", type: "url" },
      { key: "date", label: "Date", type: "month" },
      { key: "featured", label: "Featured project", type: "boolean" },
    ],
    title: (d) => d.title,
    subtitle: (d) => (d.tech || []).join(", "),
    thumb: (d) => d.image,
  },
  {
    kind: "research",
    label: "Research",
    singular: "Research item",
    description: "Papers, preprints, theses and ongoing research.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "authors", label: "Authors", type: "text", placeholder: "A. Author, Sumaiya Mamun, B. Author", help: "Your name is highlighted automatically." },
      { key: "venue", label: "Venue / journal / conference", type: "text" },
      { key: "year", label: "Year", type: "text", placeholder: "2026" },
      { key: "type", label: "Type", type: "select", options: ["Journal Article", "Conference Paper", "Preprint", "Thesis", "Poster", "Ongoing Research"] },
      { key: "status", label: "Status", type: "select", options: ["Published", "Accepted", "Under Review", "In Progress"] },
      { key: "abstract", label: "Abstract", type: "textarea" },
      { key: "keywords", label: "Keywords", type: "tags" },
      { key: "paper_url", label: "Paper / PDF link", type: "url" },
      { key: "pdf", label: "…or upload the PDF", type: "file" },
      { key: "doi_url", label: "DOI link", type: "url" },
      { key: "code_url", label: "Code / dataset link", type: "url" },
    ],
    title: (d) => d.title,
    subtitle: (d) => join(d.type, d.venue, d.year),
  },
  {
    kind: "achievements",
    label: "Achievements",
    singular: "Achievement",
    description: "Awards, competitions, scholarships and certifications.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true, placeholder: "Champion, National Hackathon 2026" },
      { key: "issuer", label: "Organizer / issuer", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "category", label: "Category", type: "select", options: ["Award", "Competition", "Scholarship", "Certification", "Honor", "Other"] },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Certificate or photo", type: "image" },
      { key: "link_url", label: "Link (credential, news…)", type: "url" },
    ],
    title: (d) => d.title,
    subtitle: (d) => join(d.category, d.issuer),
    thumb: (d) => d.image,
  },
  {
    kind: "activities",
    label: "Activities",
    singular: "Activity",
    description: "Conferences, volunteering, workshops, clubs — with photo galleries.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true, placeholder: "ICCIT 2026 Conference" },
      { key: "type", label: "Type", type: "select", options: ["Conference", "Volunteering", "Workshop", "Seminar", "Club", "Event", "Talk", "Competition", "Other"] },
      { key: "role", label: "Your role", type: "text", placeholder: "Presenter, Volunteer, Organizer…" },
      { key: "organization", label: "Organization", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "location", label: "Location", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "photos", label: "Photos", type: "images", help: "Add as many as you like. The first one is used as the cover." },
      { key: "link_url", label: "Link", type: "url" },
    ],
    title: (d) => d.title,
    subtitle: (d) => join(d.type, d.role, d.organization),
    thumb: (d) => d.photos?.[0],
  },
  {
    kind: "experience",
    label: "Experience",
    singular: "Experience",
    description: "Jobs, internships, research or teaching assistantships.",
    fields: [
      { key: "role", label: "Role", type: "text", required: true },
      { key: "organization", label: "Organization", type: "text", required: true },
      { key: "type", label: "Type", type: "select", options: ["Internship", "Full-time", "Part-time", "Research Assistant", "Teaching Assistant", "Freelance", "Leadership"] },
      { key: "location", label: "Location", type: "text" },
      { key: "start", label: "Start", type: "month" },
      { key: "end", label: "End", type: "month" },
      { key: "current", label: "I currently work here", type: "boolean" },
      { key: "description", label: "What you did", type: "textarea", help: "Tip: start lines with “- ” to make bullet points." },
      { key: "link_url", label: "Link", type: "url" },
    ],
    title: (d) => d.role,
    subtitle: (d) => d.organization,
  },
  {
    kind: "education",
    label: "Education",
    singular: "Education",
    description: "Degrees and schools.",
    fields: [
      { key: "degree", label: "Degree", type: "text", required: true, placeholder: "B.Sc. in Computer Science & Engineering" },
      { key: "institution", label: "Institution", type: "text", required: true },
      { key: "start", label: "Start", type: "month" },
      { key: "end", label: "End", type: "month" },
      { key: "current", label: "Currently studying here", type: "boolean" },
      { key: "grade", label: "Result / CGPA", type: "text" },
      { key: "description", label: "Notes", type: "textarea", placeholder: "Thesis, relevant coursework…" },
    ],
    title: (d) => d.degree,
    subtitle: (d) => d.institution,
  },
  {
    kind: "skills",
    label: "Skills",
    singular: "Skill group",
    description: "Group your skills, e.g. Languages, Frameworks, Tools.",
    fields: [
      { key: "category", label: "Group name", type: "text", required: true, placeholder: "Languages" },
      { key: "skills", label: "Skills", type: "tags", placeholder: "C++, Python, JavaScript" },
    ],
    title: (d) => d.category,
    subtitle: (d) => (d.skills || []).join(", "),
  },
];

export const collectionFor = (kind: Kind) => COLLECTIONS.find((c) => c.kind === kind)!;

export const ACCENTS: Record<string, { label: string; light: string; dark: string }> = {
  indigo: { label: "Indigo", light: "#4f46e5", dark: "#818cf8" },
  violet: { label: "Violet", light: "#7c3aed", dark: "#a78bfa" },
  sky: { label: "Sky", light: "#0284c7", dark: "#38bdf8" },
  teal: { label: "Teal", light: "#0d9488", dark: "#2dd4bf" },
  emerald: { label: "Emerald", light: "#059669", dark: "#34d399" },
  rose: { label: "Rose", light: "#e11d48", dark: "#fb7185" },
  amber: { label: "Amber", light: "#d97706", dark: "#fbbf24" },
  slate: { label: "Graphite", light: "#334155", dark: "#cbd5e1" },
};

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { key: "about", title: "About", visible: true },
  { key: "skills", title: "Skills", visible: true },
  { key: "research", title: "Research", subtitle: "Publications and ongoing work", visible: true },
  { key: "projects", title: "Projects", subtitle: "Selected things I've built", visible: true },
  { key: "experience", title: "Experience", visible: true },
  { key: "education", title: "Education", visible: true },
  { key: "achievements", title: "Achievements", subtitle: "Awards, competitions and certifications", visible: true },
  { key: "activities", title: "Activities", subtitle: "Conferences, volunteering and community", visible: true },
  { key: "contact", title: "Contact", subtitle: "Let's work together", visible: true },
];

export const DEFAULT_SETTINGS: Settings = {
  name: "Sumaiya Mamun",
  title: "CSE Student",
  tagline: "I build software and explore research problems in computer science.",
  about: "",
  photo_url: "",
  cv_url: "",
  email: "",
  location: "",
  open_to_work: false,
  open_to_work_text: "Open to opportunities",
  socials: [],
  stats: [],
  accent: "indigo",
  sections: DEFAULT_SECTIONS,
  seo_description: "",
  footer_text: "",
};

/** Merge stored settings with defaults so new options never break old data. */
export function withDefaults(stored: Partial<Settings> | null | undefined): Settings {
  const s = { ...DEFAULT_SETTINGS, ...(stored || {}) } as Settings;
  const saved = Array.isArray(stored?.sections) ? stored!.sections : [];
  const known = new Set<SectionKey>(DEFAULT_SECTIONS.map((x) => x.key));
  const ordered = saved.filter((x) => known.has(x.key)).map((x) => ({ ...DEFAULT_SECTIONS.find((d) => d.key === x.key)!, ...x }));
  for (const d of DEFAULT_SECTIONS) if (!ordered.some((x) => x.key === d.key)) ordered.push(d);
  s.sections = ordered;
  s.socials = Array.isArray(s.socials) ? s.socials : [];
  s.stats = Array.isArray(s.stats) ? s.stats : [];
  return s;
}

const dateKey = (d: Item["data"]) => String(d.date || d.end || d.start || d.year || "");

/** Manual order first (sort_order), then newest first. */
export function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    const ac = a.data.current ? "9999" : dateKey(a.data);
    const bc = b.data.current ? "9999" : dateKey(b.data);
    if (ac !== bc) return bc.localeCompare(ac);
    return String(b.created_at || "").localeCompare(String(a.created_at || ""));
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(v?: string, withDay = false): string {
  if (!v) return "";
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(v);
  if (!m) return v;
  const [, y, mo, d] = m;
  if (!mo) return y;
  const month = MONTHS[Number(mo) - 1];
  return withDay && d ? `${Number(d)} ${month} ${y}` : `${month} ${y}`;
}

export function formatRange(d: Item["data"]): string {
  const start = formatDate(d.start);
  const end = d.current ? "Present" : formatDate(d.end);
  if (start && end) return `${start} — ${end}`;
  return start || end;
}
