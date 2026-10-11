-- Portfolio database setup.
-- Run this once in Supabase: SQL Editor -> New query -> paste everything -> Run.
-- It is safe to run again.

-- Site owner -----------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- The first account that logs into /admin becomes the owner. Nobody else can after that.
create or replace function public.claim_admin() returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  lock table public.admins in exclusive mode;
  if not exists (select 1 from public.admins) then
    insert into public.admins (user_id) values (auth.uid());
  end if;
  return public.is_admin();
end $$;

revoke all on function public.claim_admin() from anon;
grant execute on function public.claim_admin() to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select using (user_id = auth.uid());

-- Profile & site settings (a single row of JSON) ------------------------------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
insert into public.settings (id) values (1) on conflict do nothing;

drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- All content (projects, research, achievements, activities, ...) ------------
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  data jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists items_kind_idx on public.items (kind);
alter table public.items enable row level security;

drop policy if exists "items public read" on public.items;
create policy "items public read" on public.items for select using (visible or public.is_admin());
drop policy if exists "items admin write" on public.items;
create policy "items admin write" on public.items for all using (public.is_admin()) with check (public.is_admin());

-- Contact form messages -------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  message text not null check (char_length(message) between 1 and 5000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

drop policy if exists "anyone can send" on public.messages;
create policy "anyone can send" on public.messages for insert with check (read = false);
drop policy if exists "admin reads messages" on public.messages;
create policy "admin reads messages" on public.messages for select using (public.is_admin());
drop policy if exists "admin updates messages" on public.messages;
create policy "admin updates messages" on public.messages for update using (public.is_admin());
drop policy if exists "admin deletes messages" on public.messages;
create policy "admin deletes messages" on public.messages for delete using (public.is_admin());

-- Photo & file storage --------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());
