# One-time setup (about 15 minutes)

You only do this once. After that, everything is edited from **your-site/admin**, with no code.

## 1. Create the database (Supabase, free)

1. Go to <https://supabase.com> → **Start your project** → sign in with GitHub.
2. Click **New project**. Pick any name (e.g. `portfolio`), set a database password (save it somewhere), choose the region closest to you (e.g. *Singapore*), and click **Create**. Wait ~2 minutes.
3. In the left menu open **SQL Editor** → **New query**. Open [`supabase/schema.sql`](supabase/schema.sql) in this repo, copy **everything**, paste it, and click **Run**. You should see "Success".
4. Create your login: **Authentication** → **Users** → **Add user** → **Create new user**. Enter your email and a strong password, tick **Auto Confirm User**, click **Create user**.
5. Stop anyone else from making an account: **Authentication** → **Sign In / Providers** → turn **off** "Allow new users to sign up" → **Save**.
6. Copy your keys from **Project Settings** (gear icon) → **API Keys** / **Data API**:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon / publishable key** (long text starting with `eyJ…` or `sb_publishable_…`)

   Never share the `service_role` / secret key. This site doesn't need it.

## 2. Put the site online (Vercel, free)

1. Go to <https://vercel.com> → **Sign up** with GitHub.
2. **Add New… → Project** → find `portfolio_n` → **Import**.
3. Under **Environment Variables** add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon / publishable key |

4. Click **Deploy**. You get a free address like `portfolio-n.vercel.app`.
   To pick a nicer free name: Vercel project → **Settings → Domains** → edit it, e.g. `sumaiya-mamun.vercel.app`.
5. Back in Supabase → **Authentication → URL Configuration** → set **Site URL** to your Vercel address (used by "Forgot password" emails).

## 3. Add your content

Open `https://your-address.vercel.app/admin` and sign in with the email and password from step 1.4.
The first account that signs in becomes the site owner.

- **Profile**: name, title (e.g. *CSE Student*), headline, bio, photo, CV, links, quick stats
- **Sections & theme**: accent colour; show, hide, reorder or rename sections
- **Projects, Research, Achievements, Activities, Experience, Education, Skills**: add, edit, hide, reorder, delete
- **Activities** have photo galleries: select many photos at once or drag and drop them
- **Messages**: what visitors send through the contact form

Changes appear on the website immediately. Empty sections are hidden automatically.

## Free-tier notes

- Supabase pauses a free project after about a week with **no visits at all**. If that happens, open the Supabase dashboard and click **Restore**.
- Photos are shrunk automatically before upload, so the 1 GB of free storage holds thousands of pictures.
