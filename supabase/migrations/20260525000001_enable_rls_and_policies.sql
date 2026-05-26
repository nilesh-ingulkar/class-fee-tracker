-- Class Fee Tracker: row level security policies

alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.teachers enable row level security;
alter table public.currencies enable row level security;
alter table public.classes enable row level security;
alter table public.sessions enable row level security;
alter table public.fee_rules enable row level security;
alter table public.payments enable row level security;

-- =========================
-- RLS: PROFILES
-- =========================
create policy "Own profile access"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

-- =========================
-- RLS: CHILDREN
-- =========================
create policy "Own children access"
on public.children
for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = children.profile_id
    and profiles.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = children.profile_id
    and profiles.id = auth.uid()
  )
);

-- =========================
-- RLS: TEACHERS
-- =========================
create policy "Own teachers access"
on public.teachers
for all
using (
  exists (
    select 1 from public.profiles
    where profiles.id = teachers.profile_id
    and profiles.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = teachers.profile_id
    and profiles.id = auth.uid()
  )
);

-- =========================
-- RLS: CURRENCIES
-- =========================
create policy "Public currencies read access"
on public.currencies
for select
using (true);

create policy "Authenticated currencies insert"
on public.currencies
for insert
to authenticated
with check (true);

create policy "Authenticated currencies update"
on public.currencies
for update
to authenticated
using (true)
with check (true);

-- =========================
-- RLS: CLASSES
-- =========================
create policy "Own classes via children"
on public.classes
for all
using (
  exists (
    select 1
    from public.children
    join public.profiles on profiles.id = children.profile_id
    where children.id = classes.child_id
    and profiles.id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.children
    join public.profiles on profiles.id = children.profile_id
    where children.id = classes.child_id
    and profiles.id = auth.uid()
  )
);

-- =========================
-- RLS: SESSIONS
-- =========================
create policy "Sessions via class ownership"
on public.sessions
for all
using (
  exists (
    select 1
    from public.classes
    join public.children on children.id = classes.child_id
    join public.profiles on profiles.id = children.profile_id
    where classes.id = sessions.class_id
    and profiles.id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.classes
    join public.children on children.id = classes.child_id
    join public.profiles on profiles.id = children.profile_id
    where classes.id = sessions.class_id
    and profiles.id = auth.uid()
  )
);

-- =========================
-- RLS: FEE RULES
-- =========================
create policy "Fee rules via class ownership"
on public.fee_rules
for all
using (
  exists (
    select 1
    from public.classes
    join public.children on children.id = classes.child_id
    join public.profiles on profiles.id = children.profile_id
    where classes.id = fee_rules.class_id
    and profiles.id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.classes
    join public.children on children.id = classes.child_id
    join public.profiles on profiles.id = children.profile_id
    where classes.id = fee_rules.class_id
    and profiles.id = auth.uid()
  )
);

-- =========================
-- RLS: PAYMENTS
-- =========================
create policy "Payments via class ownership"
on public.payments
for all
using (
  exists (
    select 1
    from public.classes
    join public.children on children.id = classes.child_id
    join public.profiles on profiles.id = children.profile_id
    where classes.id = payments.class_id
    and profiles.id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.classes
    join public.children on children.id = classes.child_id
    join public.profiles on profiles.id = children.profile_id
    where classes.id = payments.class_id
    and profiles.id = auth.uid()
  )
);
