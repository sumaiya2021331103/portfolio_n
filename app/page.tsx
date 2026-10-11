import { getSiteData } from "@/lib/data";
import type { Item, Kind, SectionConfig } from "@/lib/types";
import { Nav, RevealObserver } from "@/components/site/client";
import { Section, SocialIcon } from "@/components/site/ui";
import { About, Achievements, Hero, Projects, Research, Skills, Timeline } from "@/components/site/Sections";
import Activities from "@/components/site/Activities";
import ContactForm from "@/components/site/Contact";

export default async function Home() {
  const { settings: s, items, demo } = await getSiteData();
  const of = (k: Kind) => items.filter((i) => i.kind === k);

  const render = (sec: SectionConfig): React.ReactNode => {
    const list = (k: Kind): Item[] | null => {
      const l = of(k);
      return l.length ? l : null;
    };
    switch (sec.key) {
      case "about":
        return s.about || s.stats.length ? <About s={s} /> : null;
      case "skills": {
        const l = list("skills");
        return l && <Skills items={l} />;
      }
      case "research": {
        const l = list("research");
        return l && <Research items={l} name={s.name} />;
      }
      case "projects": {
        const l = list("projects");
        return l && <Projects items={l} />;
      }
      case "experience":
      case "education": {
        const l = list(sec.key);
        return l && <Timeline items={l} kind={sec.key} />;
      }
      case "achievements": {
        const l = list("achievements");
        return l && <Achievements items={l} />;
      }
      case "activities": {
        const l = list("activities");
        return l && <Activities items={l} />;
      }
      case "contact":
        return (
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <div className="reveal">
              <p className="text-lg text-muted">Have a question, an opportunity, or just want to say hi? My inbox is always open.</p>
              {s.email && (
                <a href={`mailto:${s.email}`} className="mt-6 inline-block text-lg font-semibold text-accent hover:underline">
                  {s.email}
                </a>
              )}
              {s.socials.length > 0 && (
                <div className="mt-6 space-y-3">
                  {s.socials.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted transition hover:text-accent">
                      <SocialIcon label={l.label} url={l.url} className="size-5" />
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="reveal">
              <ContactForm demo={demo} />
            </div>
          </div>
        );
    }
  };

  const sections = s.sections.filter((sec) => sec.visible).map((sec) => ({ sec, node: render(sec) })).filter((x) => x.node);

  return (
    <>
      {demo && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-amber-400 px-4 py-2 text-center text-sm font-medium text-black">
          Preview mode with sample content — connect Supabase (see SETUP.md) to manage your real content at /admin.
        </div>
      )}
      <Nav name={s.name} links={sections.map(({ sec }) => ({ key: sec.key, title: sec.title }))} />
      <main>
        <Hero s={s} showContact={sections.some((x) => x.sec.key === "contact")} />
        {sections.map(({ sec, node }, i) => (
          <div key={sec.key} className={i % 2 === 0 ? "bg-surface/60 dark:bg-surface/40" : ""}>
            <Section config={sec}>
              {node}
            </Section>
          </div>
        ))}
      </main>
      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} {s.name}
            {s.footer_text && ` · ${s.footer_text}`}
          </p>
          <div className="flex gap-2">
            {s.socials.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.label} className="p-1.5 transition hover:text-accent">
                <SocialIcon label={l.label} url={l.url} className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </footer>
      <RevealObserver />
      <noscript>
        <style>{`.reveal{opacity:1;transform:none}`}</style>
      </noscript>
    </>
  );
}
