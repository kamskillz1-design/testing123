-- Membership App Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Memberships
create table if not exists public.memberships (
  user_id uuid references auth.users on delete cascade primary key,
  tier text not null default 'free' check (tier in ('free', 'pro', 'vip')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sample protected content
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  required_tier text not null default 'free' check (required_tier in ('free', 'pro', 'vip')),
  created_at timestamptz default now()
);

-- Auto-create profile + free membership on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.memberships (user_id, tier, status) values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.content enable row level security;

-- Policies
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "Users can view own membership" on memberships;
create policy "Users can view own membership" on memberships for select using (auth.uid() = user_id);

drop policy if exists "Users can read content for their tier" on content;
create policy "Users can read content for their tier" on content for select using (
  exists (
    select 1 from memberships m
    where m.user_id = auth.uid()
      and m.status = 'active'
      and (m.expires_at is null or m.expires_at > now())
      and case content.required_tier
        when 'free' then true
        when 'pro' then m.tier in ('pro', 'vip')
        when 'vip' then m.tier = 'vip'
        else false
      end
  )
);

-- Optional: insert some sample content (run after creating a user or as service role)
-- insert into public.content (title, body, required_tier) values
-- ('Free Content', 'This is available to everyone.', 'free'),
-- ('Pro Content', 'This is for Pro and VIP members.', 'pro'),
-- ('VIP Content', 'This is only for VIP members.', 'vip');
