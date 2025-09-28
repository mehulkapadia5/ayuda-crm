-- Create follow_ups table
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  follow_up_date timestamptz not null,
  notes text default '',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes
create index if not exists follow_ups_lead_id_idx on public.follow_ups (lead_id);
create index if not exists follow_ups_follow_up_date_idx on public.follow_ups (follow_up_date);
create index if not exists follow_ups_completed_idx on public.follow_ups (completed);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_follow_ups_updated_at
    before update on public.follow_ups
    for each row
    execute function update_updated_at_column();
