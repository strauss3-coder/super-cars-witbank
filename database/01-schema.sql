-- ============================================================================
-- SUPER CARS WITBANK  ·  Database schema
-- ----------------------------------------------------------------------------
-- Run once in your Supabase project.
--   Dashboard -> SQL Editor -> New query -> paste all of this -> Run.
-- Safe to run more than once: every statement checks first.
--
-- Design notes
--   * Primary keys are text, not uuid. The portal generates its own ids so a
--     record created offline keeps the same id once it reaches the database.
--   * The public website reads through VIEWS only. It never touches a base
--     table. That is how VIN, internal notes, cost price and customer
--     records stay invisible no matter what a visitor types into the URL.
--   * Photos live in Storage. Only their public URLs are stored in rows.
--   * Every table here is read or written by a portal module. There are no
--     spare tables.
--
-- Table -> what consumes it
--   site_settings        Homepage Editor, Website Content, Business Info, SEO,
--                        Announcement Bar
--   vehicles             Vehicle Management, website inventory + detail
--   testimonials         Testimonials module, website testimonials
--   enquiries            Contact Enquiries module, every website form
--   finance_applications Finance Applications module, website finance form
--   tradein_requests     Trade-In Requests module, website sell form
--   media                Media Library module
--   vehicle_views        Analytics module (time series), vehicles.views counter
--   portal_users         Users module, permission checks
--   activity_log         Activity Log module, Dashboard recent activity
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------------

-- One row per settings document. The portal reads and writes whole documents:
-- homepage, about, finance, sell, business, navigation, footer, legal, seo.
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.vehicles (
  id              text primary key,
  -- identity
  stock           text default '',          -- internal stock code, public
  vin             text default '',          -- PRIVATE. never exposed to anon
  make            text default '',
  model           text default '',
  variant         text default '',
  year            int,
  -- measurements
  mileage         int default 0,
  transmission    text default '',
  fuel            text default '',
  body            text default '',
  colour          text default '',
  engine          text default '',
  power_kw        int,
  seats           int,
  fuel_use        numeric,                  -- l/100km
  co2             int,                      -- g/km
  zero_to_hundred numeric,                  -- seconds
  doors           int,
  -- commercial
  price           numeric default 0,
  price_badge     text default '',          -- Great Price / Fair Price / ...
  cost_price      numeric default 0,        -- PRIVATE
  installment     numeric default 0,
  finance_eligible boolean not null default true,
  -- content
  description     text default '',
  features        jsonb not null default '[]'::jsonb,
  images          jsonb not null default '[]'::jsonb,
  video           text default '',
  service_history text default '',
  condition       text default '',
  notes           text default '',          -- PRIVATE internal notes
  -- state
  status          text not null default 'available',
  featured        boolean not null default false,
  promoted        boolean not null default false,
  reserved        boolean not null default false,
  sold            boolean not null default false,
  archived        boolean not null default false,
  -- syndication
  autotrader_id   text default '',
  carsza_id       text default '',
  -- seo
  slug            text default '',
  meta_title      text default '',
  meta_description text default '',
  -- housekeeping
  views           int not null default 0,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- A slug must be unique when it is set, because it addresses a public page.
-- Blank slugs are allowed and are simply not indexed.
create unique index if not exists vehicles_slug_key
  on public.vehicles (slug) where slug <> '';

create table if not exists public.testimonials (
  id          text primary key,
  name        text not null default '',
  vehicle     text default '',
  location    text default '',
  rating      int not null default 5 check (rating between 1 and 5),
  review      text default '',
  photo       text default '',
  source      text not null default 'Direct',
  featured    boolean not null default false,
  published   boolean not null default true,
  archived    boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Every website form that is not a finance application or a trade-in lands
-- here: contact page, vehicle enquiry, test drive, reserve, general.
create table if not exists public.enquiries (
  id          text primary key,
  name        text not null default '',
  phone       text default '',
  email       text default '',
  vehicle     text default '',
  vehicle_id  text default '',
  kind        text not null default 'general',   -- general|vehicle|testdrive|reserve|finance
  source      text default 'Website',
  message     text default '',
  status      text not null default 'unread',    -- unread|read|contacted|closed
  notes       text default '',                   -- PRIVATE staff notes
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.finance_applications (
  id              text primary key,
  name            text not null default '',
  phone           text default '',
  email           text default '',
  id_number       text default '',            -- PRIVATE
  vehicle         text default '',
  vehicle_id      text default '',
  employment      text default '',
  employer        text default '',
  income          numeric default 0,
  deposit         numeric default 0,
  monthly_budget  numeric default 0,
  term_months     int default 72,
  message         text default '',
  status          text not null default 'new', -- new|reviewing|submitted|approved|declined
  notes           text default '',             -- PRIVATE
  archived        boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.tradein_requests (
  id            text primary key,
  name          text not null default '',
  phone         text default '',
  email         text default '',
  make          text default '',
  model         text default '',
  variant       text default '',
  year          int,
  mileage       int default 0,
  transmission  text default '',
  fuel          text default '',
  condition     text default '',
  has_finance   boolean not null default false,
  expected      numeric default 0,
  message       text default '',
  images        jsonb not null default '[]'::jsonb,
  offer         numeric default 0,
  status        text not null default 'new',  -- new|valuing|offered|accepted|declined
  notes         text default '',              -- PRIVATE
  archived      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index of everything in Storage, so the Media Library can list, rename and
-- delete without walking the bucket on every page load.
create table if not exists public.media (
  id          text primary key,
  url         text not null,
  bucket      text not null default 'vehicle-images',
  path        text not null default '',
  name        text default '',
  folder      text default 'general',    -- general|vehicles|hero|branding|testimonials|tradein
  kind        text not null default 'image',  -- image|video
  bytes       int default 0,
  width       int,
  height      int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One row per vehicle detail page view. Anonymous visitors may insert and may
-- never read. Analytics reads it as a time series; a trigger keeps the
-- vehicles.views counter in step so listings do not need a count() per card.
create table if not exists public.vehicle_views (
  id          bigserial primary key,
  vehicle_id  text not null,
  at          timestamptz not null default now()
);

create table if not exists public.portal_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text,
  name        text default '',
  role        text not null default 'sales' check (role in ('admin','manager','sales')),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.activity_log (
  id      text primary key,
  title   text default '',
  detail  text default '',
  icon    text default 'activity',
  tone    text default '',
  actor   text default '',
  at      timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 2. INDEXES
-- ---------------------------------------------------------------------------
create index if not exists vehicles_public_idx    on public.vehicles (archived, sold, featured, sort_order);
create index if not exists vehicles_created_idx   on public.vehicles (created_at desc);
create index if not exists vehicles_make_idx      on public.vehicles (make, model);
create index if not exists vehicles_price_idx     on public.vehicles (price);
create index if not exists enquiries_status_idx   on public.enquiries (status, created_at desc);
create index if not exists finance_status_idx     on public.finance_applications (status, created_at desc);
create index if not exists tradein_status_idx     on public.tradein_requests (status, created_at desc);
create index if not exists media_folder_idx       on public.media (folder, created_at desc);
create index if not exists views_vehicle_idx      on public.vehicle_views (vehicle_id, at desc);
create index if not exists views_at_idx           on public.vehicle_views (at desc);
create index if not exists testimonials_pub_idx   on public.testimonials (archived, published, sort_order);


-- ---------------------------------------------------------------------------
-- 3. TRIGGERS
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'site_settings','vehicles','testimonials','enquiries',
    'finance_applications','tradein_requests','media','portal_users'
  ]
  loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Keep the denormalised counter in step with the event table, so a listing
-- never has to run a count() per card and the two can never drift.
create or replace function public.bump_vehicle_views()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.vehicles
     set views = views + 1
   where id = new.vehicle_id;
  return new;
end;
$$;

drop trigger if exists bump_views on public.vehicle_views;
create trigger bump_views after insert on public.vehicle_views
  for each row execute function public.bump_vehicle_views();


-- ---------------------------------------------------------------------------
-- 4. WHO MAY DO WHAT
-- ---------------------------------------------------------------------------
-- The publishable key sits in the website's source code, so treat it as public
-- knowledge. "Is this request signed in?" is therefore not a strong enough
-- test on its own: with signups left open, a stranger could register and pass
-- it. Staff access is granted by an explicit row in portal_users instead.
--
--   admin    everything, including managing staff accounts
--   manager  everything except managing staff accounts
--   sales    stock, enquiries, finance and trade-ins. Not settings or users.
alter table public.portal_users enable row level security;

-- security definer so the check works without the caller needing to read the
-- table. The fixed search_path stops it being pointed at another table of the
-- same name.
create or replace function public.portal_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.portal_users
   where user_id = auth.uid() and active = true;
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.portal_users
     where user_id = auth.uid() and active = true
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.portal_users
     where user_id = auth.uid() and active = true and role = 'admin'
  );
$$;

-- Settings, SEO and staff are management level. Sales staff are kept out.
create or replace function public.is_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.portal_users
     where user_id = auth.uid() and active = true and role in ('admin','manager')
  );
$$;

revoke all on function public.portal_role() from public, anon;
revoke all on function public.is_staff()    from public, anon;
revoke all on function public.is_admin()    from public, anon;
revoke all on function public.is_manager()  from public, anon;
grant execute on function public.portal_role() to authenticated;
grant execute on function public.is_staff()    to authenticated;
grant execute on function public.is_admin()    to authenticated;
grant execute on function public.is_manager()  to authenticated;


-- ---------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.site_settings        enable row level security;
alter table public.vehicles             enable row level security;
alter table public.testimonials         enable row level security;
alter table public.enquiries            enable row level security;
alter table public.finance_applications enable row level security;
alter table public.tradein_requests     enable row level security;
alter table public.media                enable row level security;
alter table public.vehicle_views        enable row level security;
alter table public.activity_log         enable row level security;

-- Drop previous versions so the script can be rerun cleanly.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('site_settings','vehicles','testimonials','enquiries',
                        'finance_applications','tradein_requests','media',
                        'vehicle_views','activity_log','portal_users')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- ---- staff directory ----
-- Any signed in staff member may see the team. Only an admin may change it.
create policy "staff read team"    on public.portal_users for select to authenticated using (public.is_staff());
create policy "admin manages team" on public.portal_users for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- what the public website may READ ----
-- Only published content, and only the documents meant to be seen. Anonymous
-- visitors reach vehicles and testimonials through views, never base tables.
create policy "public reads settings" on public.site_settings for select to anon
  using (key in ('homepage','about','finance','sell','business','navigation','footer','legal','seo','announce'));

-- ---- what the public website may WRITE ----
-- Insert only. A visitor can post a form and can never read one back, so one
-- customer's details are never visible to another.
create policy "public submits enquiry"  on public.enquiries            for insert to anon with check (true);
create policy "public submits finance"  on public.finance_applications for insert to anon with check (true);
create policy "public submits tradein"  on public.tradein_requests     for insert to anon with check (true);
create policy "public records a view"   on public.vehicle_views        for insert to anon with check (true);

-- ---- what the portal may do ----
create policy "staff manages vehicles"     on public.vehicles             for all to authenticated using (public.is_staff())   with check (public.is_staff());
create policy "staff manages enquiries"    on public.enquiries            for all to authenticated using (public.is_staff())   with check (public.is_staff());
create policy "staff manages finance"      on public.finance_applications for all to authenticated using (public.is_staff())   with check (public.is_staff());
create policy "staff manages tradeins"     on public.tradein_requests     for all to authenticated using (public.is_staff())   with check (public.is_staff());
create policy "staff manages media"        on public.media               for all to authenticated using (public.is_staff())   with check (public.is_staff());
create policy "staff manages testimonials" on public.testimonials        for all to authenticated using (public.is_staff())   with check (public.is_staff());
create policy "staff reads activity"       on public.activity_log        for select to authenticated using (public.is_staff());
create policy "staff writes activity"      on public.activity_log        for insert to authenticated with check (public.is_staff());
create policy "manager clears activity"    on public.activity_log        for delete to authenticated using (public.is_manager());
create policy "staff reads analytics"      on public.vehicle_views       for select to authenticated using (public.is_staff());

-- Website copy, business details and SEO are management level.
create policy "manager manages settings"   on public.site_settings       for all to authenticated using (public.is_manager()) with check (public.is_manager());


-- ---------------------------------------------------------------------------
-- 6. PUBLIC VIEWS  -  the only shape the website ever sees
-- ---------------------------------------------------------------------------
-- security_invoker makes a view obey the row level security of whoever queries
-- it rather than the view's owner. Without it a view can quietly hand out rows
-- the policies above were meant to withhold. Needs Postgres 15+, which every
-- current Supabase project runs.
--
-- Note what is NOT selected: vin, cost_price, notes, and the two syndication
-- references. Those columns cannot
-- reach the website even if a visitor edits the request by hand, because anon
-- has no grant on the base table at all.
drop view if exists public.website_vehicles;
create view public.website_vehicles with (security_invoker = true) as
  select id, stock, make, model, variant, year, mileage, transmission, fuel,
         body, colour, engine, power_kw, seats, fuel_use, co2, zero_to_hundred,
         doors, price, price_badge, installment, finance_eligible, description,
         features, images, video, service_history, condition, status, featured,
         promoted, reserved, sold, slug, meta_title, meta_description,
         views, sort_order, created_at
    from public.vehicles
   where archived = false
   order by featured desc, promoted desc, sort_order asc, created_at desc;

drop view if exists public.website_testimonials;
create view public.website_testimonials with (security_invoker = true) as
  select id, name, vehicle, location, rating, review, photo, source,
         featured, sort_order, created_at
    from public.testimonials
   where archived = false and published = true
   order by featured desc, sort_order asc, created_at desc;


-- ---------------------------------------------------------------------------
-- 7. STORAGE
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vehicle-images','vehicle-images',true),
       ('branding','branding',true),
       ('tradein','tradein',true)
on conflict (id) do update set public = true;

do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'supercars %'
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

-- Anyone may view a photo. Only staff may add, replace or remove one, except
-- the trade-in bucket, where a member of the public uploads photos of the car
-- they want to sell.
create policy "supercars public read" on storage.objects for select to anon, authenticated
  using (bucket_id in ('vehicle-images','branding','tradein'));
create policy "supercars public tradein upload" on storage.objects for insert to anon
  with check (bucket_id = 'tradein');
create policy "supercars staff insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('vehicle-images','branding','tradein') and public.is_staff());
create policy "supercars staff update" on storage.objects for update to authenticated
  using (bucket_id in ('vehicle-images','branding','tradein') and public.is_staff());
create policy "supercars staff delete" on storage.objects for delete to authenticated
  using (bucket_id in ('vehicle-images','branding','tradein') and public.is_staff());


-- ---------------------------------------------------------------------------
-- 8. GRANTS
-- ---------------------------------------------------------------------------
-- Row level security decides which ROWS a role may touch. Grants decide which
-- TABLES it may touch at all. Both are needed.
grant usage on schema public to anon, authenticated;

-- The website reads views and one settings table. It has NO grant on the
-- vehicles or testimonials base tables, so vin, cost_price and notes are
-- unreachable rather than merely unselected.
revoke all on public.vehicles     from anon;
revoke all on public.testimonials from anon;
revoke all on public.portal_users from anon;
revoke all on public.media        from anon;
revoke all on public.activity_log from anon;

grant select on public.site_settings        to anon;
grant select on public.website_vehicles     to anon;
grant select on public.website_testimonials to anon;
grant insert on public.enquiries            to anon;
grant insert on public.finance_applications to anon;
grant insert on public.tradein_requests     to anon;
grant insert on public.vehicle_views        to anon;
grant usage, select on sequence public.vehicle_views_id_seq to anon;

grant select, insert, update, delete on
  public.site_settings, public.vehicles, public.testimonials, public.enquiries,
  public.finance_applications, public.tradein_requests, public.media,
  public.activity_log to authenticated;
grant select on public.vehicle_views, public.portal_users,
                public.website_vehicles, public.website_testimonials to authenticated;
grant select, insert, update, delete on public.portal_users to authenticated;


-- ---------------------------------------------------------------------------
-- 9. AFTER RUNNING THIS  -  three steps, and step 2 is not optional
-- ---------------------------------------------------------------------------
--   1. Authentication -> Users -> Add user.
--      Use a real email address and a strong password.
--      Tick "Auto Confirm User", or you cannot sign in until the confirmation
--      email is clicked.
--
--   2. Put yourself on the staff list as an admin. Nothing works until you do,
--      and that is deliberate: an account that is not listed sees nothing.
--
--        insert into public.portal_users (user_id, email, name, role)
--        select id, email, 'Owner', 'admin' from auth.users
--        where email = 'you@supercars-witbank.co.za'
--        on conflict (user_id) do update set role = 'admin', active = true;
--
--      Check it worked. This must return exactly one row:
--
--        select email, role, active from public.portal_users;
--
--   3. Authentication -> Sign In / Providers -> Email -> turn OFF
--      "Allow new users to sign up".
--      Your publishable key is in the website's source where anyone can read
--      it. With signups open a stranger can create an account in your project.
--      The staff list means such an account still sees nothing, but there is
--      no reason to let it exist.
--
--   Then run 02-seed.sql to load the business details and the current stock.
-- ---------------------------------------------------------------------------
