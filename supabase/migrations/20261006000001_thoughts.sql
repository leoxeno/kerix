-- 0001 · thoughts
-- One table. Owner-only access through row-level security. Server-side last-writer-wins by updated_at.
-- Applied by the agent through the management API (spec 002). Re-runnable.

create table if not exists public.thoughts (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  done_at timestamptz,
  deleted_at timestamptz,
  device text not null default '',
  server_updated_at timestamptz not null default now()
);

create index if not exists thoughts_user_server_updated
  on public.thoughts (user_id, server_updated_at);

alter table public.thoughts enable row level security;

drop policy if exists "own rows select" on public.thoughts;
create policy "own rows select" on public.thoughts
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "own rows insert" on public.thoughts;
create policy "own rows insert" on public.thoughts
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "own rows update" on public.thoughts;
create policy "own rows update" on public.thoughts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- No delete policy on purpose: deletion is deleted_at, so it can sync.

-- Last-writer-wins: an update carrying an older updated_at is skipped entirely.
create or replace function public.thoughts_lww() returns trigger
language plpgsql as $$
begin
  if new.updated_at < old.updated_at then
    return null;
  end if;
  return new;
end
$$;

-- Server stamps ownership and server time on every write.
create or replace function public.thoughts_stamp() returns trigger
language plpgsql as $$
begin
  new.user_id := auth.uid();
  new.server_updated_at := now();
  return new;
end
$$;

drop trigger if exists a_lww on public.thoughts;
create trigger a_lww before update on public.thoughts
  for each row execute function public.thoughts_lww();

drop trigger if exists b_stamp on public.thoughts;
create trigger b_stamp before insert or update on public.thoughts
  for each row execute function public.thoughts_stamp();

grant select, insert, update on public.thoughts to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'thoughts'
  ) then
    alter publication supabase_realtime add table public.thoughts;
  end if;
end
$$;
