import { Award, BadgeCheck, Calendar, Code2, Download, ExternalLink, FileText, GraduationCap, Mail, MapPin, Medal, Star, Trophy } from "lucide-react";
import type { Item, Settings } from "@/lib/types";
import { formatDate, formatRange } from "@/lib/config";
import { ZoomImage } from "./client";
import { Chip, ExtLink, GithubIcon, RichText, SocialIcon } from "./ui";

export function Hero({ s, showContact }: { s: Settings; showContact: boolean }) {
  const initials = s.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <section id="top" className="hero-glow relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div className="reveal order-2 md:order-1">
          {s.open_to_work && (
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              {s.open_to_work_text}
            </span>
          )}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Hi, I&apos;m <span className="text-accent">{s.name}</span>
          </h1>
          {s.title && <p className="mt-4 text-xl font-semibold text-fg/80 sm:text-2xl">{s.title}</p>}
          {s.tagline && <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{s.tagline}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {s.cv_url && (
              <a
                href={s.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 dark:text-black"
              >
                <Download className="size-4" /> Download CV
              </a>
            )}
            {(showContact || s.email) && (
              <a
                href={showContact ? "#contact" : `mailto:${s.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
              >
                <Mail className="size-4" /> Contact me
              </a>
            )}
          </div>
          {s.socials.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {s.socials.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l.label}
                  title={l.label}
                  className="grid size-10 place-items-center rounded-full border border-line bg-surface text-muted transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                >
                  <SocialIcon label={l.label} url={l.url} />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="reveal order-1 flex justify-center md:order-2 md:justify-end">
          <div className="relative">
            <div className="absolute -inset-3 rotate-6 rounded-[2rem] bg-accent/15" />
            {s.photo_url ? (
              <img src={s.photo_url} alt={s.name} className="relative size-56 rounded-[2rem] object-cover shadow-2xl sm:size-72" />
            ) : (
              <div className="relative grid size-56 place-items-center rounded-[2rem] bg-surface text-6xl font-bold text-accent shadow-2xl sm:size-72">{initials}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function About({ s }: { s: Settings }) {
  return (
    <div className="grid gap-10 md:grid-cols-[1.5fr_1fr]">
      <div className="reveal text-lg text-muted">
        <RichText text={s.about} />
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {s.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-accent" /> {s.location}
            </span>
          )}
          {s.email && (
            <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 hover:text-accent">
              <Mail className="size-4 text-accent" /> {s.email}
            </a>
          )}
        </div>
      </div>
      {s.stats.length > 0 && (
        <div className="reveal grid grid-cols-2 gap-4 self-start">
          {s.stats.map((st) => (
            <div key={st.label} className="card p-5">
              <div className="text-3xl font-extrabold text-accent">{st.value}</div>
              <div className="mt-1 text-sm text-muted">{st.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Skills({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.id} className="reveal card p-6">
          <h3 className="mb-4 font-semibold">{it.data.category}</h3>
          <div className="flex flex-wrap gap-2">
            {(it.data.skills || []).map((sk: string) => (
              <span key={sk} className="rounded-lg bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
                {sk}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Authors({ authors, name }: { authors: string; name: string }) {
  if (!name) return <>{authors}</>;
  const parts = authors.split(new RegExp(`(${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === name.toLowerCase() ? (
          <strong key={i} className="font-semibold text-fg">
            {p}
          </strong>
        ) : (
          p
        ),
      )}
    </>
  );
}

export function Research({ items, name }: { items: Item[]; name: string }) {
  return (
    <div className="space-y-5">
      {items.map((it) => {
        const d = it.data;
        const paper = d.paper_url || d.pdf;
        return (
          <article key={it.id} className="reveal card p-6 transition hover:border-accent/40">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {d.type && <Chip accent>{d.type}</Chip>}
              {d.status && <Chip>{d.status}</Chip>}
              {d.year && <span className="text-sm text-muted">{d.year}</span>}
            </div>
            <h3 className="text-lg font-semibold leading-snug">{d.title}</h3>
            {d.authors && (
              <p className="mt-2 text-sm text-muted">
                <Authors authors={d.authors} name={name} />
              </p>
            )}
            {d.venue && <p className="mt-1 text-sm italic text-muted">{d.venue}</p>}
            {d.keywords?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.keywords.map((k: string) => (
                  <Chip key={k}>{k}</Chip>
                ))}
              </div>
            )}
            {d.abstract && (
              <details className="group mt-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-accent">
                  <span className="group-open:hidden">Show abstract</span>
                  <span className="hidden group-open:inline">Hide abstract</span>
                </summary>
                <RichText text={d.abstract} className="mt-3 text-sm text-muted" />
              </details>
            )}
            {(paper || d.doi_url || d.code_url) && (
              <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-4">
                {paper && (
                  <ExtLink href={paper}>
                    <FileText className="size-4" /> Paper
                  </ExtLink>
                )}
                {d.doi_url && (
                  <ExtLink href={d.doi_url}>
                    <ExternalLink className="size-4" /> DOI
                  </ExtLink>
                )}
                {d.code_url && (
                  <ExtLink href={d.code_url}>
                    <Code2 className="size-4" /> Code
                  </ExtLink>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function Projects({ items }: { items: Item[] }) {
  const ordered = [...items.filter((i) => i.data.featured), ...items.filter((i) => !i.data.featured)];
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((it) => {
        const d = it.data;
        return (
          <article key={it.id} className="reveal card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5">
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5">
              {d.image ? (
                <img src={d.image} alt={d.title} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="grid size-full place-items-center text-5xl font-bold text-accent/40">{(d.title || "?")[0]}</div>
              )}
              {d.featured && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900">
                  <Star className="size-3 fill-amber-400 text-amber-400" /> Featured
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-snug">{d.title}</h3>
                {d.date && <span className="shrink-0 text-xs text-muted">{formatDate(d.date)}</span>}
              </div>
              {d.summary && <p className="mt-2 text-sm text-muted">{d.summary}</p>}
              {d.description && <RichText text={d.description} className="mt-2 line-clamp-4 text-sm text-muted" />}
              {d.tech?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {d.tech.map((t: string) => (
                    <Chip key={t} accent>
                      {t}
                    </Chip>
                  ))}
                </div>
              )}
              {(d.github_url || d.live_url) && (
                <div className="mt-auto flex gap-4 pt-5">
                  {d.github_url && (
                    <ExtLink href={d.github_url}>
                      <GithubIcon className="size-4" /> Code
                    </ExtLink>
                  )}
                  {d.live_url && (
                    <ExtLink href={d.live_url}>
                      <ExternalLink className="size-4" /> Live
                    </ExtLink>
                  )}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function Timeline({ items, kind }: { items: Item[]; kind: "experience" | "education" }) {
  return (
    <ol className="relative space-y-8 border-l-2 border-line pl-8">
      {items.map((it) => {
        const d = it.data;
        const title = kind === "experience" ? d.role : d.degree;
        const org = kind === "experience" ? d.organization : d.institution;
        return (
          <li key={it.id} className="reveal relative">
            <span className="absolute top-1.5 -left-[41px] grid size-5 place-items-center rounded-full border-2 border-accent bg-bg">
              <span className="size-2 rounded-full bg-accent" />
            </span>
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="font-medium text-accent">
                    {d.link_url ? (
                      <a href={d.link_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {org}
                      </a>
                    ) : (
                      org
                    )}
                  </p>
                </div>
                <div className="text-right text-sm text-muted">
                  <div>{formatRange(d)}</div>
                  {d.location && <div>{d.location}</div>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {d.type && <Chip>{d.type}</Chip>}
                {d.grade && <Chip accent>{d.grade}</Chip>}
              </div>
              <RichText text={d.description} className="mt-3 text-sm text-muted" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const ACH_ICONS: Record<string, typeof Award> = {
  Award: Trophy,
  Competition: Medal,
  Scholarship: GraduationCap,
  Certification: BadgeCheck,
  Honor: Award,
};

export function Achievements({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map((it) => {
        const d = it.data;
        const Icon = ACH_ICONS[d.category] || Award;
        return (
          <article key={it.id} className="reveal card flex flex-col overflow-hidden">
            {d.image && <ZoomImage src={d.image} alt={d.title} className="aspect-[16/9] w-full object-cover transition hover:scale-105" />}
            <div className="flex flex-1 gap-4 p-6">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {d.category && <span className="font-semibold uppercase tracking-wide text-accent">{d.category}</span>}
                  {d.date && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" /> {formatDate(d.date)}
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 font-semibold leading-snug">{d.title}</h3>
                {d.issuer && <p className="mt-0.5 text-sm text-muted">{d.issuer}</p>}
                <RichText text={d.description} className="mt-2 text-sm text-muted" />
                {d.link_url && (
                  <ExtLink href={d.link_url} className="mt-3">
                    <ExternalLink className="size-4" /> View
                  </ExtLink>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
