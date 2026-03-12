-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS Table
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  email text unique not null,
  password text not null,
  identity_hash text,
  algorand_tx_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BOOKINGS Table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  hotel_name text not null,
  check_in text,
  check_out text,
  booking_hash text,
  algorand_tx_id text,
  escrow_tx_id text,
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INCIDENTS Table
create table public.incidents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  location text,
  type text default 'SOS',
  risk_score numeric,
  algorand_tx_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS Table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  booking_id uuid references public.bookings(id) not null,
  hotel_name text,
  rating integer,
  comment text,
  review_hash text,
  algorand_tx_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) - Optional but recommended
alter table public.users enable row level security;
alter table public.bookings enable row level security;
alter table public.incidents enable row level security;
alter table public.reviews enable row level security;

-- Create policies (Open for now/Service Role will bypass, but for client access if needed)
-- For hackathon/MVP, we might want to just allow public access or meaningful policies.
-- Let's create a policy to allow read/write for now to avoid RLS errors if using anon key.
-- IF using service_role key (which backend does), these policies are bypassed.
-- But if frontend uses supabase-js directly with anon key, RLS matters.
-- Backend uses `process.env.SUPABASE_KEY` which is usually service_role or anon.
-- If it's anon, we need policies. If service_role, we don't.
-- Assuming backend is trusted, it should use service_role.
-- However, just in case, let's allow all for now to simplify debugging.

create policy "Enable all access for all users" on public.users for all using (true) with check (true);
create policy "Enable all access for all users" on public.bookings for all using (true) with check (true);
create policy "Enable all access for all users" on public.incidents for all using (true) with check (true);
create policy "Enable all access for all users" on public.reviews for all using (true) with check (true);
