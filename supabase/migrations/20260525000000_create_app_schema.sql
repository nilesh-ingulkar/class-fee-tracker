-- Class Fee Tracker: core schema (tables, indexes, seed data)

create extension if not exists "pgcrypto";

-- =========================
-- PROFILES (CORE IDENTITY LAYER)
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamp default now()
);

-- =========================
-- CHILDREN
-- =========================
create table public.children (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamp default now()
);

-- =========================
-- TEACHERS
-- =========================
create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  is_active boolean default true,
  created_at timestamp default now()
);

-- =========================
-- CURRENCIES
-- =========================
create table public.currencies (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  symbol text not null,
  name text not null,
  is_active boolean default true
);

insert into public.currencies (code, symbol, name)
values
  ('USD', '$', 'US Dollar'),
  ('INR', '₹', 'Indian Rupee')
on conflict (code) do update
set
  symbol = excluded.symbol,
  name = excluded.name,
  is_active = true;

-- =========================
-- CLASSES
-- =========================
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.children(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  currency_id uuid references public.currencies(id),

  billing_type text check (billing_type in ('PER_CLASS', 'MONTHLY')),
  class_name text not null,
  is_active boolean default true,

  created_at timestamp default now()
);

-- =========================
-- SESSIONS
-- =========================
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  session_date date not null,
  session_time time,
  status text check (status in ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
  created_at timestamp default now()
);

-- =========================
-- FEE RULES
-- =========================
create table public.fee_rules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  amount numeric(10,2) not null,
  effective_from date not null,
  effective_to date,
  created_at timestamp default now()
);

-- =========================
-- PAYMENTS
-- =========================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  amount numeric(10,2) not null,
  payment_date date not null,
  note text,
  created_at timestamp default now()
);

-- =========================
-- INDEXES
-- =========================
create index idx_children_profile on public.children(profile_id);
create index idx_teachers_profile on public.teachers(profile_id);
create index idx_classes_child on public.classes(child_id);
create index idx_sessions_class on public.sessions(class_id);
create index idx_fee_rules_class on public.fee_rules(class_id);
create index idx_payments_class on public.payments(class_id);
