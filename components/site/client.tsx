"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, Moon, Sun, X } from "lucide-react";

/** Fades sections in as they scroll into view. */
export function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.shown)");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("shown");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:text-accent"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function Nav({ name, links }: { name: string; links: { key: string; title: string }[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    links.forEach((l) => {
      const el = document.getElementById(l.key);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [links]);

  const short = name.split(" ")[0] || name;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition ${
        scrolled || open ? "border-b border-line bg-bg/80 backdrop-blur-lg" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="text-lg font-bold tracking-tight">
          {short}
          <span className="text-accent">.</span>
        </a>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.key}
              href={`#${l.key}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition hover:text-accent ${
                active === l.key ? "text-accent" : "text-muted"
              }`}
            >
              {l.title}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="grid size-9 place-items-center rounded-full border border-line text-muted lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-line px-4 pb-4 lg:hidden">
          {links.map((l) => (
            <a key={l.key} href={`#${l.key}`} onClick={() => setOpen(false)} className="block py-3 font-medium text-muted hover:text-accent">
              {l.title}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

export function Lightbox({ photos, index, onClose }: { photos: string[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  const prev = useCallback(() => setI((v) => (v - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setI((v) => (v + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={onClose} role="dialog" aria-modal>
      <img src={photos[i]} alt="" className="max-h-[85vh] max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
      <button onClick={onClose} className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close">
        <X className="size-5" />
      </button>
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => (e.stopPropagation(), prev())}
            className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={(e) => (e.stopPropagation(), next())}
            className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Next"
          >
            <ChevronRight className="size-6" />
          </button>
          <div className="absolute bottom-4 text-sm text-white/70">
            {i + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}

/** Thumbnail that opens a full-screen viewer. */
export function ZoomImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="block w-full overflow-hidden" aria-label={`View ${alt}`}>
        <img src={src} alt={alt} loading="lazy" className={className} />
      </button>
      {open && <Lightbox photos={[src]} index={0} onClose={() => setOpen(false)} />}
    </>
  );
}
