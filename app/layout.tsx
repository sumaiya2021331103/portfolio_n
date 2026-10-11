import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { getSiteData } from "@/lib/data";
import { ACCENTS } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteData();
  const title = settings.title ? `${settings.name} — ${settings.title}` : settings.name;
  const description = settings.seo_description || settings.tagline;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: settings.photo_url ? [settings.photo_url] : [] },
    twitter: { card: "summary", title, description },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d12" },
  ],
};

// Applies the saved light/dark choice before paint to avoid a flash.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getSiteData();
  const accent = ACCENTS[settings.accent] || ACCENTS.indigo;
  const style = { "--a-light": accent.light, "--a-dark": accent.dark } as React.CSSProperties;
  return (
    <html lang="en" style={style} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
