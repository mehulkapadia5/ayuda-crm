-- Ayuda CRM initial schema

-- Enums
do $$ begin
  create type lead_stage as enum ('Lead', 'Prospect', 'Enrolled', 'Rejected', 'Next Cohort');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('admin', 'sales', 'ops');
exception when duplicate_object then null; end $$;

-- Tables
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  source text,
  stage lead_stage default 'Lead',
  created_at timestamptz not null default now()
);

create unique index if not exists leads_email_idx on public.leads (lower(email)) where email is not null;
create index if not exists leads_phone_idx on public.leads (phone);
create index if not exists leads_stage_idx on public.leads (stage);
create index if not exists leads_created_at_idx on public.leads (created_at);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activities_lead_id_idx on public.activities (lead_id);
create index if not exists activities_created_at_idx on public.activities (created_at);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  filters jsonb default '{}'::jsonb,
  gallabox_campaign_id text,
  created_at timestamptz not null default now()
);

create index if not exists campaigns_created_at_idx on public.campaigns (created_at);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role user_role not null default 'sales',
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.leads enable row level security;
alter table public.activities enable row level security;
alter table public.campaigns enable row level security;
alter table public.users enable row level security;

-- Basic RLS policies
-- Users: self-manageable listing by admins; readable by all roles
drop policy if exists users_select_all on public.users;
create policy users_select_all on public.users for select using (true);

drop policy if exists users_admin_manage on public.users;
create policy users_admin_manage on public.users for all using (
  exists(select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
) with check (
  exists(select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- Leads: readable by all roles; insert/update restricted to sales/ops/admin
drop policy if exists leads_select_all on public.leads;
create policy leads_select_all on public.leads for select using (true);

drop policy if exists leads_write_roles on public.leads;
create policy leads_write_roles on public.leads for insert with check (
  exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','sales','ops'))
);

drop policy if exists leads_update_roles on public.leads;
create policy leads_update_roles on public.leads for update using (
  exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','sales','ops'))
) with check (
  true
);

-- Activities: readable by all; insert by roles
drop policy if exists activities_select_all on public.activities;
create policy activities_select_all on public.activities for select using (true);

drop policy if exists activities_insert_roles on public.activities;
create policy activities_insert_roles on public.activities for insert with check (
  exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','sales','ops'))
);

-- Campaigns: readable by all; write by roles
drop policy if exists campaigns_select_all on public.campaigns;
create policy campaigns_select_all on public.campaigns for select using (true);

drop policy if exists campaigns_write_roles on public.campaigns;
create policy campaigns_write_roles on public.campaigns for all using (
  exists(select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','sales','ops'))
) with check (
  true
);

-- Helpful utility function to upsert users from auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

-- If using supabase auth schema, attach trigger
do $$ begin
  perform 1 from pg_trigger where tgname = 'on_auth_user_created';
  if not found then
    execute 'create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();';
  end if;
exception when undefined_table then
  -- auth.users may not exist in a local dev DB; safe to ignore
  null;
end $$;

