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
  arena_id text not null default 'neo-tokyo-2099',
  floor_number integer not null,
  owner_id text,
  owner_name text,
  brand_title text,
  tagline text,
  category text not null default 'Commercial',
  status text not null check (status in ('available', 'sold')) default 'available',
  price numeric not null default 10000,
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
  impressions_weekly integer default 85000,
  clicks_delivered integer default 1240,
  ctr numeric default 12.5,
  days_held integer default 1,
  lease_expiry_days integer default 7,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on floors
alter table public.floors enable row level security;

create policy "Floors are viewable by everyone" on public.floors
  for select using (true);

create policy "Authenticated users or service can insert/update floors" on public.floors
  for all using (true);

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
-- 6. SEED SHOWCASE DATA (Arena: neo-tokyo-2099)
-- -----------------------------------------------------------------------------
insert into public.floors (
  id, arena_id, floor_number, owner_name, brand_title, tagline, category, status, price, currency,
  dimensions, impressions_per_day, elevation_meters, target_url, ad_banner_url, verified_domain,
  verified_type, safety_scan_passed, impressions_weekly, clicks_delivered, ctr, days_held, lease_expiry_days
) values
(
  'neo-tokyo-floor-1', 'neo-tokyo-2099', 0, 'Satoshi Media', 'Bitcoin Core Hub',
  'Decentralized global sound money network.', 'Crypto & Web3', 'sold', 10000, 'INR',
  '360° Panoramic Digital Wrap & Spire Halo', '95K+ Views', 14.5, 'https://bitcoin.org',
  'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80',
  true, 'enterprise', true, 110000, 1840, 15.2, 5, 2
),
(
  'neo-tokyo-floor-2', 'neo-tokyo-2099', 1, 'Supabase Devs', 'Supabase Cloud',
  'The open source Firebase alternative.', 'Developer Infrastructure', 'sold', 15000, 'INR',
  '360° Panoramic Digital Wrap & Spire Halo', '120K+ Views', 19.0, 'https://supabase.com',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  true, 'startup', true, 134000, 2190, 14.8, 4, 3
),
(
  'neo-tokyo-floor-3', 'neo-tokyo-2099', 2, 'Vercel Team', 'Next.js 15',
  'The React framework for the Web.', 'Frameworks & Tools', 'sold', 20000, 'INR',
  '360° Panoramic Digital Wrap & Spire Halo', '140K+ Views', 23.5, 'https://nextjs.org',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  true, 'enterprise', true, 158000, 2890, 16.1, 6, 1
),
(
  'neo-tokyo-floor-4', 'neo-tokyo-2099', 3, 'Resend Team', 'Resend Email',
  'Email for developers.', 'Developer Tools', 'sold', 25000, 'INR',
  '360° Panoramic Digital Wrap & Spire Halo', '160K+ Views', 28.0, 'https://resend.com',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  true, 'startup', true, 172000, 3120, 15.6, 3, 4
),
(
  'neo-tokyo-floor-5', 'neo-tokyo-2099', 4, 'Linear Team', 'Linear App',
  'Issue tracking built for high-performance software teams.', 'Productivity', 'sold', 30000, 'INR',
  '360° Panoramic Digital Wrap & Spire Halo', '180K+ Views', 32.5, 'https://linear.app',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  true, 'startup', true, 195000, 3650, 16.4, 2, 5
),
(
  'neo-tokyo-floor-6', 'neo-tokyo-2099', 5, 'Anthropic Labs', 'Claude AI 3.7',
  'Next-generation hybrid reasoning model.', 'Artificial Intelligence', 'sold', 35000, 'INR',
  '360° Panoramic Digital Wrap & Spire Halo', '210K+ Views', 37.0, 'https://anthropic.com',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  true, 'enterprise', true, 230000, 4200, 17.2, 5, 2
),
(
  'neo-tokyo-floor-7', 'neo-tokyo-2099', 6, 'OpenAI', 'Sora Video AI',
  'Creating video from text prompts in high fidelity.', 'Artificial Intelligence', 'sold', 40000, 'INR',
  '360° Panoramic Digital Wrap & Spire Halo', '250K+ Views', 41.5, 'https://openai.com',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  true, 'enterprise', true, 260000, 4850, 17.8, 1, 6
),
(
  'neo-tokyo-floor-8', 'neo-tokyo-2099', 7, 'Pinnacle Ventures', 'W3Tech',
  'Building the next generation of spatial computing.', 'Pinnacle Build Opportunity', 'sold', 50000, 'INR',
  '360° Panoramic Digital Wrap & Spire Halo', '320K+ Views', 46.0, 'https://w3tech.io',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  true, 'enterprise', true, 340000, 6200, 18.5, 7, 0
)
on conflict (id) do nothing;
