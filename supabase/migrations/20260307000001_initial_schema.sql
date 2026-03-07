-- ============================================
-- Rezervk.lt — Initial Database Schema
-- ============================================

-- gen_random_uuid() is built into PostgreSQL 13+, no extension needed

-- ============================================
-- 1. USERS (extends Supabase auth.users)
-- ============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  avatar_url text,
  locale text not null default 'lt' check (locale in ('lt', 'ru', 'en')),
  created_at timestamptz not null default now()
);

comment on table public.users is 'User profiles extending Supabase auth';

-- ============================================
-- 2. BUSINESSES
-- ============================================
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  category text,
  address text,
  city text,
  phone text,
  email text,
  logo_url text,
  cover_url text,
  settings jsonb default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_businesses_owner on public.businesses(owner_id);
create index idx_businesses_slug on public.businesses(slug);
create index idx_businesses_city on public.businesses(city);

comment on table public.businesses is 'Business profiles (salons, freelancers)';

-- ============================================
-- 3. SERVICES
-- ============================================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null default 60,
  price numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_services_business on public.services(business_id);

comment on table public.services is 'Services offered by businesses';

-- ============================================
-- 4. WORKING HOURS
-- ============================================
create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null default '09:00',
  end_time time not null default '18:00',
  is_working boolean not null default true,
  unique(business_id, day_of_week)
);

create index idx_working_hours_business on public.working_hours(business_id);

comment on table public.working_hours is 'Weekly working schedule (0=Sunday, 1=Monday...)';

-- ============================================
-- 5. TIME BLOCKS (breaks, days off)
-- ============================================
create table public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now()
);

create index idx_time_blocks_business on public.time_blocks(business_id);
create index idx_time_blocks_dates on public.time_blocks(start_at, end_at);

comment on table public.time_blocks is 'Blocked time slots (breaks, vacations)';

-- ============================================
-- 6. BOOKINGS
-- ============================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  client_name text not null,
  client_email text not null,
  client_phone text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  stripe_payment_id text,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_bookings_business on public.bookings(business_id);
create index idx_bookings_service on public.bookings(service_id);
create index idx_bookings_dates on public.bookings(start_at, end_at);
create index idx_bookings_status on public.bookings(status);
create index idx_bookings_client_email on public.bookings(client_email);

comment on table public.bookings is 'Client reservations';

-- ============================================
-- 7. PAYMENTS
-- ============================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  stripe_session_id text not null,
  amount numeric(10,2) not null,
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'failed')),
  created_at timestamptz not null default now()
);

create index idx_payments_booking on public.payments(booking_id);

comment on table public.payments is 'Payment records linked to Stripe';

-- ============================================
-- 8. REVIEWS
-- ============================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique(booking_id)
);

create index idx_reviews_business on public.reviews(business_id);

comment on table public.reviews is 'Client reviews after visit';

-- ============================================
-- 9. WAITLIST
-- ============================================
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  client_name text not null,
  client_email text not null,
  client_phone text,
  preferred_date date not null,
  preferred_time_range text,
  status text not null default 'waiting' check (status in ('waiting', 'notified', 'booked', 'expired')),
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_waitlist_business on public.waitlist(business_id);

comment on table public.waitlist is 'Waiting list when slots are full';

-- ============================================
-- 10. DEPOSITS (no-show protection)
-- ============================================
create table public.deposits (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  stripe_payment_intent_id text not null,
  amount numeric(10,2) not null,
  currency text not null default 'EUR',
  status text not null default 'held' check (status in ('held', 'captured', 'released', 'refunded')),
  refunded_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_deposits_booking on public.deposits(booking_id);

comment on table public.deposits is 'Deposit holds for no-show protection';

-- ============================================
-- 11. BUSINESS SETTINGS
-- ============================================
create table public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade unique,
  require_deposit boolean not null default false,
  deposit_amount numeric(10,2) default 0,
  deposit_type text default 'fixed' check (deposit_type in ('fixed', 'percentage')),
  cancellation_hours integer not null default 24,
  no_show_fee numeric(10,2) default 0,
  auto_confirm boolean not null default true,
  reminder_hours integer not null default 24,
  booking_buffer_minutes integer not null default 0,
  max_advance_days integer not null default 60,
  created_at timestamptz not null default now()
);

create index idx_business_settings_business on public.business_settings(business_id);

comment on table public.business_settings is 'Business-specific booking and payment settings';


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.working_hours enable row level security;
alter table public.time_blocks enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.waitlist enable row level security;
alter table public.deposits enable row level security;
alter table public.business_settings enable row level security;

-- ----------------------------------------
-- USERS policies
-- ----------------------------------------
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- ----------------------------------------
-- BUSINESSES policies
-- ----------------------------------------
create policy "Anyone can view active businesses"
  on public.businesses for select
  using (is_active = true);

create policy "Owners can view own businesses"
  on public.businesses for select
  using (auth.uid() = owner_id);

create policy "Owners can create businesses"
  on public.businesses for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update own businesses"
  on public.businesses for update
  using (auth.uid() = owner_id);

create policy "Owners can delete own businesses"
  on public.businesses for delete
  using (auth.uid() = owner_id);

-- ----------------------------------------
-- SERVICES policies
-- ----------------------------------------
create policy "Anyone can view active services"
  on public.services for select
  using (
    is_active = true
    or business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "Owners can manage services"
  on public.services for insert
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owners can update services"
  on public.services for update
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owners can delete services"
  on public.services for delete
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ----------------------------------------
-- WORKING HOURS policies
-- ----------------------------------------
create policy "Anyone can view working hours"
  on public.working_hours for select
  using (true);

create policy "Owners can manage working hours"
  on public.working_hours for insert
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owners can update working hours"
  on public.working_hours for update
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owners can delete working hours"
  on public.working_hours for delete
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ----------------------------------------
-- TIME BLOCKS policies
-- ----------------------------------------
create policy "Anyone can view time blocks"
  on public.time_blocks for select
  using (true);

create policy "Owners can manage time blocks"
  on public.time_blocks for insert
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owners can update time blocks"
  on public.time_blocks for update
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owners can delete time blocks"
  on public.time_blocks for delete
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ----------------------------------------
-- BOOKINGS policies
-- ----------------------------------------
create policy "Owners can view own business bookings"
  on public.bookings for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Anyone can create bookings"
  on public.bookings for insert
  with check (true);

create policy "Owners can update bookings"
  on public.bookings for update
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ----------------------------------------
-- PAYMENTS policies
-- ----------------------------------------
create policy "Owners can view payments"
  on public.payments for select
  using (
    booking_id in (
      select b.id from public.bookings b
      join public.businesses biz on b.business_id = biz.id
      where biz.owner_id = auth.uid()
    )
  );

create policy "System can create payments"
  on public.payments for insert
  with check (true);

-- ----------------------------------------
-- REVIEWS policies
-- ----------------------------------------
create policy "Anyone can view published reviews"
  on public.reviews for select
  using (is_published = true);

create policy "Owners can view all reviews for their business"
  on public.reviews for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Anyone can create reviews"
  on public.reviews for insert
  with check (true);

create policy "Owners can update reviews (publish/hide)"
  on public.reviews for update
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ----------------------------------------
-- WAITLIST policies
-- ----------------------------------------
create policy "Owners can view waitlist"
  on public.waitlist for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

create policy "Owners can update waitlist"
  on public.waitlist for update
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ----------------------------------------
-- DEPOSITS policies
-- ----------------------------------------
create policy "Owners can view deposits"
  on public.deposits for select
  using (
    booking_id in (
      select b.id from public.bookings b
      join public.businesses biz on b.business_id = biz.id
      where biz.owner_id = auth.uid()
    )
  );

create policy "System can manage deposits"
  on public.deposits for insert
  with check (true);

-- ----------------------------------------
-- BUSINESS SETTINGS policies
-- ----------------------------------------
create policy "Owners can view own settings"
  on public.business_settings for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owners can create settings"
  on public.business_settings for insert
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Owners can update settings"
  on public.business_settings for update
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Public read access for business settings (needed for booking widget)
create policy "Anyone can view business settings"
  on public.business_settings for select
  using (true);


-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'locale', 'lt')
  );
  return new;
end;
$$;

-- Trigger: auto-create profile
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-create default working hours when business is created
create or replace function public.handle_new_business()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Create default working hours (Mon-Fri 9:00-18:00, Sat-Sun off)
  insert into public.working_hours (business_id, day_of_week, start_time, end_time, is_working)
  values
    (new.id, 0, '09:00', '18:00', false),  -- Sunday
    (new.id, 1, '09:00', '18:00', true),   -- Monday
    (new.id, 2, '09:00', '18:00', true),   -- Tuesday
    (new.id, 3, '09:00', '18:00', true),   -- Wednesday
    (new.id, 4, '09:00', '18:00', true),   -- Thursday
    (new.id, 5, '09:00', '18:00', true),   -- Friday
    (new.id, 6, '09:00', '18:00', false);  -- Saturday

  -- Create default business settings
  insert into public.business_settings (business_id)
  values (new.id);

  return new;
end;
$$;

-- Trigger: auto-create working hours + settings
create or replace trigger on_business_created
  after insert on public.businesses
  for each row execute function public.handle_new_business();
