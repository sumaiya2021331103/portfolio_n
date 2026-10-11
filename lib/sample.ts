import type { Item, Settings } from "./types";

// Shown only before Supabase is connected, so the design can be previewed.
export const SAMPLE_SETTINGS: Partial<Settings> = {
  name: "Sumaiya Mamun",
  title: "CSE Student",
  tagline: "I build software and explore research problems in computer science.",
  about:
    "This is placeholder text shown until the site is connected to its database. After setup, everything on this page — your bio, photo, projects, research, achievements and activity photos — is edited from the admin panel at /admin.",
  open_to_work: true,
  open_to_work_text: "Open to opportunities",
  stats: [
    { label: "Projects", value: "10+" },
    { label: "Publications", value: "2" },
    { label: "Awards", value: "5" },
  ],
};

let n = 0;
const item = (kind: Item["kind"], data: Item["data"]): Item => ({ id: `demo-${++n}`, kind, data, sort_order: 0, visible: true });

export const SAMPLE_ITEMS: Item[] = [
  item("skills", { category: "Languages", skills: ["C++", "Python", "JavaScript", "TypeScript", "SQL"] }),
  item("skills", { category: "Frameworks", skills: ["React", "Next.js", "Node.js", "PyTorch"] }),
  item("skills", { category: "Tools", skills: ["Git", "Linux", "Docker", "Figma"] }),
  item("research", {
    title: "Sample paper title — replace me from the admin panel",
    authors: "A. Author, Sumaiya Mamun, B. Author",
    venue: "Sample International Conference",
    year: "2026",
    type: "Conference Paper",
    status: "Under Review",
    abstract: "A short abstract of the work goes here. Visitors can expand it to read more.",
    keywords: ["Machine Learning", "NLP"],
  }),
  item("projects", {
    title: "Sample Project",
    summary: "A short one-line description of a project.",
    tech: ["Next.js", "Supabase"],
    featured: true,
    date: "2026-05",
  }),
  item("projects", { title: "Another Project", summary: "Projects show as cards with links to code and demo.", tech: ["Python"], date: "2025-11" }),
  item("projects", { title: "Third Project", summary: "Add, edit or hide projects anytime.", tech: ["C++"], date: "2025-03" }),
  item("experience", { role: "Research Assistant", organization: "Sample Lab", start: "2025-06", current: true, description: "- What you worked on\n- What you achieved" }),
  item("education", { degree: "B.Sc. in Computer Science & Engineering", institution: "Your University", start: "2021-01", current: true }),
  item("achievements", { title: "Sample Award", issuer: "Organizer name", date: "2026-03-15", category: "Award", description: "What you achieved." }),
  item("achievements", { title: "Sample Certification", issuer: "Issuer", date: "2025-08-01", category: "Certification" }),
  item("activities", { title: "Sample Conference", type: "Conference", role: "Presenter", date: "2026-02-10", location: "Dhaka", description: "Activities support photo galleries.", photos: [] }),
  item("activities", { title: "Sample Volunteering", type: "Volunteering", role: "Volunteer", date: "2025-12-01", photos: [] }),
];
