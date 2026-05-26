-- Legacy repair script for databases created before supabase/migrations/.
-- For new projects, run the files in supabase/migrations/ in order instead.
-- Use this script only when you already have tables and need grants, RLS,
-- or compatibility columns applied without recreating the schema.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.children to authenticated;
grant select, insert, update, delete on table public.teachers to authenticated;
grant select, insert, update, delete on table public.currencies to authenticated;
grant select, insert, update, delete on table public.classes to authenticated;
grant select, insert, update, delete on table public.sessions to authenticated;
grant select, insert, update, delete on table public.fee_rules to authenticated;
grant select, insert, update, delete on table public.payments to authenticated;

grant select on table public.currencies to anon;

alter table public.teachers
add column if not exists is_active boolean default true;

update public.teachers
set is_active = true
where is_active is null;

alter table public.currencies enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'currencies'
      and policyname = 'Public currencies read access'
  ) then
    create policy "Public currencies read access"
    on public.currencies
    for select
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'currencies'
      and policyname = 'Authenticated currencies insert'
  ) then
    create policy "Authenticated currencies insert"
    on public.currencies
    for insert
    to authenticated
    with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'currencies'
      and policyname = 'Authenticated currencies update'
  ) then
    create policy "Authenticated currencies update"
    on public.currencies
    for update
    to authenticated
    using (true)
    with check (true);
  end if;
end $$;

insert into public.currencies (code, symbol, name)
values
  ('USD', '$', 'US Dollar'),
  ('INR', '₹', 'Indian Rupee')
on conflict (code) do update
set
  symbol = excluded.symbol,
  name = excluded.name,
  is_active = true;
