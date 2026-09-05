-- =============================================================================
-- UPSPACE 3D SKYLINE MARKETPLACE - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- =============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked with auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  email text,
  provider text default 'email',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. FLOORS TABLE (Live 3D Arena Floors & Billboards)
-- -----------------------------------------------------------------------------
create table if not exists public.floors (
  id text primary key,
  arena_id text not null default 'business-tower',
  floor_number integer not null,
  owner_id text,
  owner_name text,
  brand_title text,
  tagline text,
  category text not null default 'Commercial',
  status text not null check (status in ('available', 'sold')) default 'available',
  price numeric not null default 1,
  currency text not null default 'INR',
  dimensions text default '360° Panoramic Digital Wrap & Spire Halo',
  impressions_per_day text default '120K+ Views',
  elevation_meters numeric not null default 50,
  logo_url text,
  ad_banner_url text,
  target_url text,
  banner_color text default '#06b6d4',
  claim_code text,
  verified_domain boolean default false,
  verified_type text check (verified_type in ('github', 'indie', 'startup', 'enterprise')) default 'indie',
  safety_scan_passed boolean default true,
  impressions_weekly integer default 0,
  clicks_delivered integer default 0,
  ctr numeric default 0,
  days_held integer default 0,
  lease_expiry_days integer default 7,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on floors
alter table public.floors enable row level security;

create policy "Floors are viewable by everyone" on public.floors
  for select using (true);

create policy "Anyone can insert or update floors" on public.floors
  for all using (true) with check (true);

-- -----------------------------------------------------------------------------
-- 3. BID_HISTORY TABLE (Historical Bids per Floor)
-- -----------------------------------------------------------------------------
create table if not exists public.bid_history (
  id uuid default uuid_generate_v4() primary key,
  floor_id text references public.floors(id) on delete cascade not null,
  bidder_name text not null,
  user_id text,
  amount numeric not null,
  is_top_bid boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on bid_history
alter table public.bid_history enable row level security;

create policy "Bid history is viewable by everyone" on public.bid_history
  for select using (true);

create policy "Anyone can insert bids" on public.bid_history
  for insert with check (true);

-- -----------------------------------------------------------------------------
-- 4. TRANSACTIONS TABLE (Payment & Audit Logs)
-- -----------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  floor_id text references public.floors(id) on delete cascade not null,
  user_id text,
  buyer_name text not null,
  amount numeric not null,
  currency text default 'INR',
  brand_title text,
  target_url text,
  payment_method text default 'upi_qr',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text not null check (status in ('pending', 'completed', 'failed')) default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on transactions
alter table public.transactions enable row level security;

create policy "Transactions are viewable by everyone" on public.transactions
  for select using (true);

create policy "Anyone can insert transactions" on public.transactions
  for insert with check (true);

-- -----------------------------------------------------------------------------
-- 5. REALTIME PUBLICATION (Enable instant live broadcast on floors & bids)
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table public.floors;
alter publication supabase_realtime add table public.bid_history;
alter publication supabase_realtime add table public.transactions;

-- -----------------------------------------------------------------------------
-- 6. SEED SHOWCASE DATA (Arena: business-tower - 20 Floors)
-- -----------------------------------------------------------------------------
insert into public.floors (
  id, arena_id, floor_number, tagline, category, status, price, currency,
  dimensions, impressions_per_day, elevation_meters, banner_color,
  safety_scan_passed, impressions_weekly, clicks_delivered, ctr, days_held, lease_expiry_days
) values
('floor-1', 'business-tower', 0, 'Prime ground lobby digital concourse display', 'Commercial Lobby', 'available', 499, 'INR', '360° Ground Concourse Digital Wrap', '12,400 / day', 4.5, '#ed7d2b', true, 0, 0, 0, 0, 7),
('floor-2', 'business-tower', 1, 'High-visibility lower-level curved ribbon display', 'DevOps & Cloud', 'available', 699, 'INR', 'Curved OLED Ribbon Display', '14,200 / day', 9.0, '#ea6f25', true, 0, 0, 0, 0, 7),
('floor-3', 'business-tower', 2, 'Recessed panoramic LED panel with premium pedestrian visibility', 'SaaS & Productivity', 'available', 899, 'INR', 'Recessed Panoramic LED Panel', '16,800 / day', 13.5, '#38bdf8', true, 0, 0, 0, 0, 7),
('floor-4', 'business-tower', 3, 'Dynamic curved OLED display for modern brands and agencies', 'Design Agency', 'available', 1199, 'INR', 'Curved OLED Ribbon Display', '18,500 / day', 18.0, '#f59a35', true, 0, 0, 0, 0, 7),
('floor-5', 'business-tower', 4, 'Expansive digital billboard for retail, commerce and consumer drops', 'E-Commerce', 'available', 1499, 'INR', 'Recessed Panoramic LED Panel', '21,000 / day', 22.5, '#0284c7', true, 0, 0, 0, 0, 7),
('floor-6', 'business-tower', 5, 'Mid-rise panoramic wrap with wide city sightlines', 'Artificial Intelligence', 'available', 1799, 'INR', 'Panoramic Digital Wrap', '24,500 / day', 27.0, '#e87529', true, 0, 0, 0, 0, 7),
('floor-7', 'business-tower', 6, 'High-contrast curved display with continuous 360 loop', 'Autonomous Agents', 'available', 2099, 'INR', 'Curved OLED Ribbon Display', '26,000 / day', 31.5, '#f18c31', true, 0, 0, 0, 0, 7),
('floor-8', 'business-tower', 7, 'Full 360-degree panoramic digital wrap with vivid illumination', 'Creative Tech', 'available', 2399, 'INR', '360° Panoramic Digital Wrap', '28,500 / day', 36.0, '#3b82f6', true, 0, 0, 0, 0, 7),
('floor-9', 'business-tower', 8, 'Tower midpoint prime billboard facing the main avenue', 'Analytics', 'available', 2699, 'INR', 'Recessed Panoramic LED Panel', '31,000 / day', 40.5, '#ea6f25', true, 0, 0, 0, 0, 7),
('floor-10', 'business-tower', 9, 'Curved high-resolution OLED billboard with vibrant color gamut', 'Video & Motion', 'available', 2999, 'INR', 'Curved OLED Ribbon Display', '33,500 / day', 45.0, '#ec7b2a', true, 0, 0, 0, 0, 7),
('floor-11', 'business-tower', 10, 'Upper mid-rise panoramic billboard with extensive aerial visibility', 'Deep Tech & Aerospace', 'available', 3399, 'INR', 'Panoramic Digital Wrap', '36,000 / day', 49.5, '#0ea5e9', true, 0, 0, 0, 0, 7),
('floor-12', 'business-tower', 11, 'Recessed panoramic billboard for developer & cloud infrastructure', 'Database & Systems', 'available', 3799, 'INR', 'Recessed Panoramic LED Panel', '38,500 / day', 54.0, '#f18c31', true, 0, 0, 0, 0, 7),
('floor-13', 'business-tower', 12, 'Upper-tier curved OLED display for fintech and global platforms', 'FinTech', 'available', 4199, 'INR', 'Curved OLED Ribbon Display', '41,000 / day', 58.5, '#eb7427', true, 0, 0, 0, 0, 7),
('floor-14', 'business-tower', 13, 'Full 360-degree panoramic wrap with unhindered high-rise views', 'BioTech', 'available', 4699, 'INR', '360° Panoramic Digital Wrap', '43,500 / day', 63.0, '#10b981', true, 0, 0, 0, 0, 7),
('floor-15', 'business-tower', 14, 'Recessed high-altitude panel with wide metropolitan reach', 'Edge Infrastructure', 'available', 5199, 'INR', 'Recessed Panoramic LED Panel', '46,000 / day', 67.5, '#ea6f25', true, 0, 0, 0, 0, 7),
('floor-16', 'business-tower', 15, 'High-elevation curved display overlooking the skyline bridges', 'Web3 & DeFi', 'available', 5799, 'INR', 'Curved OLED Ribbon Display', '48,500 / day', 72.0, '#f18c31', true, 0, 0, 0, 0, 7),
('floor-17', 'business-tower', 16, 'Penultimate tier digital wrap visible across the entire district', 'Cybersecurity', 'available', 6499, 'INR', 'Panoramic Digital Wrap', '51,000 / day', 76.5, '#6366f1', true, 0, 0, 0, 0, 7),
('floor-18', 'business-tower', 17, 'Premium high-rise curved billboard adjacent to crown levels', 'Developer Tools', 'available', 7299, 'INR', 'Curved OLED Ribbon Display', '54,000 / day', 81.0, '#f59e0b', true, 0, 0, 0, 0, 7),
('floor-19', 'business-tower', 18, 'High-altitude 360° digital crown wrap directly below penthouse', 'High-Rise Premium Billboard', 'available', 8199, 'INR', 'High-Altitude 360° Digital Crown Wrap', '58,000 / day', 85.5, '#06b6d4', true, 0, 0, 0, 0, 7),
('floor-20', 'business-tower', 19, 'The Pinnacle Penthouse Billboard · 360° Skyline Crown & Spire Halo', 'Penthouse Spire Billboard', 'available', 8999, 'INR', 'Penthouse Crown 360° Neon Wrap & Spire Halo', '65,000 / day', 90.0, '#f97316', true, 0, 0, 0, 0, 7)
on conflict (id) do update set
  arena_id = excluded.arena_id,
  floor_number = excluded.floor_number,
  tagline = excluded.tagline,
  category = excluded.category,
  price = excluded.price,
  currency = excluded.currency,
  dimensions = excluded.dimensions,
  impressions_per_day = excluded.impressions_per_day,
  elevation_meters = excluded.elevation_meters,
  banner_color = excluded.banner_color,
  updated_at = now();
