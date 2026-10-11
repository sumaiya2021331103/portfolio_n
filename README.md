# Sumaiya Mamun — Portfolio

A personal portfolio with a built-in admin panel. All content (profile, research, projects,
achievements, activities with photo galleries, experience, education, skills, section order and theme)
is edited at `/admin` without touching code.

**First time?** Follow [SETUP.md](SETUP.md).

## Stack
- Next.js 15 (App Router) + Tailwind CSS 4
- Supabase (Postgres, Auth, Storage): content lives in the `settings` and `items` tables
- Hosted on Vercel

## Local development
```bash
cp .env.example .env.local   # fill in the two Supabase values
npm install
npm run dev
```
Without the env values the site runs in preview mode with sample content.

## Adding a field or content type
Content types and their form fields are defined in `lib/config.ts` (`COLLECTIONS`). Item data is stored as JSON,
so adding a field there needs no database migration.
