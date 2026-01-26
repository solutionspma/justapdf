-- ═══════════════════════════════════════════════════════════════════════════════
-- JUSTAPDF - CORE DATABASE SCHEMA (SUPABASE / POSTGRES)
-- Registry + CRM + Billing + CMS + SEO scaffolding
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists registry (
  id uuid primary key,
  type text not null,
  key text unique not null,
  name text not null,
  description text,
  version text,
  active boolean default true,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  phone text,
  role text not null,
  permissions jsonb default '{}'::jsonb,
  status text default 'active',
  created_at timestamp with time zone default now()
);

create table if not exists user_profiles (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  company text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists credit_ledger (
  id uuid primary key,
  user_id uuid references users(id) on delete set null,
  action_key text not null,
  registry_id uuid references registry(id) on delete set null,
  credits integer not null,
  status text default 'success',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists events (
  id uuid primary key,
  user_id uuid references users(id) on delete set null,
  type text not null,
  source text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists sessions (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default now()
);

create table if not exists campaigns (
  id uuid primary key,
  name text not null,
  status text default 'draft',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists ads (
  id uuid primary key,
  campaign_id uuid references campaigns(id) on delete set null,
  placement text not null,
  destination_url text,
  status text default 'active',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists seo_keywords (
  id uuid primary key,
  keyword text not null,
  intent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists content_nodes (
  id uuid primary key,
  title text not null,
  slug text unique,
  type text,
  status text default 'draft',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

