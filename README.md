# Super Cars Witbank — website and CMS portal

**Live now**

| | |
|---|---|
| Website | https://strauss3-coder.github.io/super-cars-witbank/ |
| Portal | https://strauss3-coder.github.io/super-cars-witbank/portal/ |

A public dealership website and a staff portal that drives it, sharing one
Supabase database. Everything a customer sees is edited in the portal; nothing
on the website is hardcoded except the company's own branding.

```
super-cars-witbank/          <- the website lives at the repo root, so it owns
├── index.html                  the bare URL and a custom domain works properly
├── inventory.html  vehicle.html  finance.html  sell.html
├── about.html  testimonials.html  contact.html  privacy.html  terms.html
├── 404.html    robots.txt  sitemap.xml
├── assets/                  brand/ (logo, icons) · photos/ (the dealership)
│                            stock/ (the 59 vehicle photographs)
├── css/                     style.css (foundation) · components.css
├── js/                      config.js · fallback.js · one script per page
├── portal/
│   └── index.html           the whole CMS, one file
└── database/
    ├── 01-schema.sql        tables, row level security, storage, views
    ├── 02-seed.sql          business details, website copy, the stock
    ├── stock.py             the canonical vehicle list — regenerates two files
    └── upload-media.sh      pushes the photographs into Supabase Storage
```

No build step, no framework, no CDN. Open `website/index.html` and it runs —
the site ships with its content built in, so it is never blank.

### Where the content comes from

```
   website/js/fallback.js   ships with the site. Used only when nothing better exists.
              ↓  (overridden the moment a project is configured)
   Supabase                 the real source of truth, edited in the portal
```

`fallback.js` holds the same content as `02-seed.sql` so a fresh copy of the
site shows the real business details and the real stock immediately. As soon as
`config.js` points at a Supabase project, the database wins and nothing in
`fallback.js` is read again.

**It is not a second place to edit content.** Once you are connected, the portal
is the only place that matters — edits made in `fallback.js` will never appear.
It exists so the site is never empty, and as a safety net if the database is
unreachable and the visitor has no cached copy.

The browser console says which source is in use.

---

## Deploying

Both links are served by GitHub Pages from `main`. There is no build step, so a
push is a deploy:

```bash
git add -A
git commit -m "what changed"
git push
```

Give it a minute, then refresh. `gh api repos/strauss3-coder/super-cars-witbank/pages --jq .status`
reports `built` when it has landed.

The portal is at `/portal/` in the same repo, which is how it reaches
`../js/fallback.js` — the one copy of the built-in content, shared by both.

**When the real domain is ready:** point `supercars-witbank.co.za` at Pages and
add a `CNAME` file at the repo root containing the bare domain. The website then
answers on the domain itself and the portal on `/portal/`. Every page already
carries a canonical tag pointing at that domain, so nothing else needs editing.

---

## Setting it up

You can open `website/index.html` right now and see the finished site. The steps
below connect it to a database so staff can start editing it.

**1. Create the database.** In your Supabase project open the SQL Editor and run
`database/01-schema.sql`. It is safe to run more than once.

**2. Create your login.** Authentication → Users → Add user. Use a real email
address and tick *Auto Confirm User*.

**3. Put yourself on the staff list.** Nothing works until you do, and that is
deliberate — an account that is not listed can sign in and still see nothing.
Do this **after** step 2, not before.

```sql
-- Order matters: the account must exist in Authentication FIRST. This reads
-- from auth.users, and an insert...select over an empty result inserts nothing
-- and still reports success — so it is made to raise instead of failing quietly.
do $$
declare uid uuid;
begin
  select id into uid from auth.users where email = 'you@supercars-witbank.co.za';
  if uid is null then
    raise exception 'No account with that email exists yet. Create it first under Authentication -> Users -> Add user, ticking Auto Confirm User.';
  end if;

  insert into public.portal_users (user_id, email, name, role, active)
  values (uid, 'you@supercars-witbank.co.za', 'Owner', 'admin', true)
  on conflict (user_id) do update set role = 'admin', active = true;

  raise notice 'Added as administrator.';
end $$;

-- Must return exactly one row.
select email, name, role, active from public.portal_users;
```

**4. Close signups.** Authentication → Sign In / Providers → Email → turn off
*Allow new users to sign up*. Your publishable key is in the website's source
where anyone can read it; there is no reason to let strangers create accounts.

**5. Point the two clients at your project.** Both need the project URL and the
**publishable** key (Project Settings → API):

| File | What to change |
|---|---|
| `website/js/config.js` | `supabaseUrl` and `supabaseKey` |
| `portal/index.html` | `const PROJECT` near the top of the script |
| `database/02-seed.sql` | `base_url` at the top |

A `service_role` key must never go in any of them. It belongs only in step 6.

**6. Upload the photographs, then seed.** In Terminal:

```bash
cd ~/Desktop/Super-Cars
./database/upload-media.sh
```

It reads the project address out of `js/config.js` and asks you to paste the
service_role key, so nothing secret ends up in your shell history. It refuses a
publishable key rather than failing 59 times with a confusing 401.

Then run `database/02-seed.sql` in the SQL Editor.

**7. Open `portal/index.html`.** It opens straight onto the dashboard — see
*Signing in* below.

---

## How the two halves fit together

```
   portal/index.html  ──writes──►  Supabase  ◄──reads──  website/*.html
                                   (the only
                                  source of truth)
```

The portal writes to memory first, then mirrors each change to Supabase through
a retry queue, so a dropped signal at the dealership never loses an edit. The
website caches each successful read in `localStorage` and falls back to it if
Supabase is unreachable, so an outage shows yesterday's stock rather than an
empty page.

### Every portal module, and what it drives on the website

| Module | Drives |
|---|---|
| Dashboard | — (reads everything) |
| Analytics | — (reads `vehicle_views`) |
| Vehicle Management | stock list, vehicle pages, home page rows |
| Media Library | every photograph on the site |
| Contact Enquiries | receives the contact and vehicle forms |
| Finance Applications | receives the finance form |
| Trade-In Requests | receives the sell-my-car form |
| Testimonials | reviews on the home page and reviews page |
| Homepage Editor | every section of the home page, across nine tabs |
| Announcement Bar | the strip above the header on every page |
| Website Content | about, finance, sell, navigation, footer, privacy, terms |
| Business Information | header, footer, contact blocks, WhatsApp, structured data |
| SEO | page titles, descriptions, sharing cards |
| Users | who may sign in and what they may do |
| Settings | backups, exports, your password |
| Database | connection, sync, what is stored where |
| Activity Log | history of every change |
| System | standing check that portal and website agree |

There are no modules without a purpose and no editable content without a module.
The **System** page checks this continuously and lists anything incomplete.

---

## The front end

Three stylesheets and a small motion layer, in load order:

| File | What it owns |
|---|---|
| `css/style.css` | tokens, reset, typography, layout, header, footer |
| `css/components.css` | buttons, cards, filters, gallery, forms, states |
| `css/premium.css` | motion, depth, and the sections added in the polish pass |
| `js/motion.js` | scroll reveal, counters, reading bar, header shrink, ripple, FAQ |

**Nothing on the page depends on an animation arriving.** Elements only start
hidden under a `.js` class that an inline script in `<head>` adds, so with
JavaScript off everything is visible. If `motion.js` itself fails to load, a
timer in `core.js` reveals anything still waiting after 2.6 seconds. And
`prefers-reduced-motion` switches the whole layer off in one block, leaving
every element in its resting position.

Motion is deliberately restrained. One slow background gradient loops; nothing
else moves once it has settled. Confidence reads as premium — a page that keeps
moving reads as a template trying to impress you.

---

## Testing

```bash
npm --prefix /tmp install jsdom    # once
brew install postgresql@16         # once
./test/run.sh
```

Four passes, and only the first is cheap:

| | |
|---|---|
| parse | every script compiles |
| `test/pages.js` | all 11 pages loaded in a real DOM over HTTP, scripts run, 40 rendered elements asserted |
| `test/portal.js` | the portal opened, all 18 modules and 44 tabs visited, plus the sign-in lock |
| `test/database.sh` | both SQL files run against a throwaway Postgres, then the security is probed as anon and as staff |

**Changing content after go-live.** `02-seed.sql` REPLACES each settings
document, so re-running it throws away anything edited in the portal since.
Anything added later ships as a numbered migration that merges with `||`
instead — see `03-add-brand-assets.sql`, which adds fields only where they are
still empty and is safe to run twice.

Both fail on any thrown error, any `console.error`, any unhandled rejection, and
any section that renders nothing.

**Why this exists.** Reading a file proves nothing. Six defects reached the
customer before a test did:

- a variable that did not exist in scope, which showed *"Stock could not be
  loaded"* to every visitor while every syntax check passed;
- an unguarded `matchMedia` call that killed the motion layer;
- a view marked `security_invoker` that the website was refused by;
- a storage section that aborted the schema and silently took the grants with it;
- a settings document grown past `jsonb_build_object`'s limit of 100 arguments;
- and a stale Postgres on a shared port that made the database test read
  somebody else's rows.

Every one of those now fails loudly here instead.

The tests run with the network blocked, so each page has to fall back to the
content built into `js/fallback.js`. That is also the state a fresh copy is in,
so it exercises the path most people see first.

---

## Signing in

**The portal locks itself as soon as a database is configured.** There is no
switch to remember:

| `js/config.js` / `PROJECT` | What the portal does |
|---|---|
| still the placeholder | opens straight onto the dashboard, loads the content that ships with the website, saves only in that browser, status pill reads `Local only` |
| a real Supabase project | shows the sign-in screen and stays hidden until somebody signs in as staff |

That ordering matters. It means there is never a window where the portal is
publicly reachable **and** has live customer data behind it **and** has no lock
on the door — the lock arrives in the same moment the data does.

Being signed in is still not enough on its own. The database asks
`portal_users` what the account may do, and an account that is not on that list
is signed straight back out with an explanation.

Both paths are covered by `test/portal.js`: it opens the portal unconfigured
and walks all 18 modules, then loads it again with a project filled in and
asserts the sign-in screen is up, the app is hidden, and nothing has leaked
into the view.

---

## Security

Row level security is on for all ten tables. A visitor holding the publishable
key may:

- read the nine published settings documents,
- read stock and reviews **through views only**, and
- insert one enquiry, finance application, trade-in or page view.

They may read none of those back. `vin`, `cost_price` and internal `notes` are
not in the public views, and `anon` has no grant on the `vehicles` or
`testimonials` base tables at all — so those columns are unreachable rather
than merely unselected. Customer records are never readable by the public.

Staff access is granted by a row in `portal_users`, not by merely having an
account:

| | Stock & leads | Website copy & SEO | Staff accounts |
|---|---|---|---|
| **admin** | yes | yes | yes |
| **manager** | yes | yes | no |
| **sales** | yes | no | no |

These are enforced by the database, not by hiding buttons.

---

## The stock

Seventeen vehicles, from the dealership's own AutoTrader listings and the
business report. Twelve have photographs; five are real current stock that has
not been photographed yet.

`database/stock.py` is the single definition of the list. Running it rewrites
the vehicle rows in **both** `02-seed.sql` and `website/js/fallback.js`, so the
two can never drift:

```bash
python3 database/stock.py
```

The five without photographs still list, because they are genuinely for sale
and a buyer searching for a Corolla Cross should find one. They show a
placeholder and the vehicle page invites the buyer to phone for pictures. The
Dashboard and the System page both flag them until someone photographs them:

| Stock | Vehicle | Price |
|---|---|---|
| 0013 | 2023 VW T-Cross 1.0TSI 85kW Highline R-Line | R339 950 |
| 0014 | 2020 Hyundai H-100 Bakkie 2.6D | R219 950 |
| 0015 | 2026 Suzuki Ertiga 1.5 GA | R369 950 |
| 0016 | 2025 Toyota Corolla Cross 1.8 Xi | R399 950 |
| 0017 | 2020 Audi A3 Sedan 30TFSI | R299 950 |

### Two judgement calls worth knowing about

**Four cars carry a "High Price" badge.** That is AutoTrader's market value
verdict, reproduced faithfully from the report. It is shown in muted grey
rather than green, but it is still telling a buyer the car is dear. Clear the
badge in Vehicle Management on the Q5, A1, Polo Vivo 1.6 and Corolla Cross if
you would rather not advertise it.

**The finance calculator does not use the formula in the report exactly.** The
report's expression discounts the balloon *and* adds a month's interest on it,
which counts that interest twice — on a R400 000 car with a 20% balloon it
overstates the instalment by about 11% (R7 769 against R6 986). The standard
formula is implemented instead. Say the word and it can be changed back.

---

## Testimonials

The table is seeded empty on purpose. The 4.8 rating from 37 Google reviews is
real and is already shown across the site from Business Information, but the
reviews themselves were not copied in — that would mean attributing words to
named customers. Until staff add real ones through the Testimonials module, the
home page hides that section and the reviews page points visitors at the genuine
Google listing.

---

## Everyday jobs

**A car has sold.** Vehicle Management → the ⋮ menu → *Mark as sold*. It stays
on the site with a SOLD badge and sorts to the bottom.

**Prices are changing.** Vehicle Management → *Export CSV* → edit in a
spreadsheet → *Import CSV*. Matching is on stock number, so edited rows update
rather than duplicate. Photographs are never touched.

**Interest rates moved.** Website Content → Finance → change the rate. Every
monthly figure on the site moves with it, including the "from R x p/m" on each
card.

**Something is not showing.** Open **System**. It checks the connection, the
stock, the copy and the SEO, and links straight to whatever needs fixing.

---

## Known limits

- The website renders its content in the browser. It is fast and it needs no
  server, but a search engine has to run the JavaScript to see prices. The
  structured data for the business, its rating and each priced vehicle is
  emitted for exactly this reason. If organic search becomes the priority, the
  next step is pre-rendering these pages at publish time.
- `sitemap.xml` lists the fixed pages only. Vehicle pages are left out because
  stock changes weekly and a sitemap full of sold cars is worse than none; they
  are still discovered through the stock list.
- Trade-in photo uploads are open to the public by necessity (a seller is not
  signed in). They go to their own `tradein` bucket, which is the only one
  anonymous visitors may write to.

### Two things in the report that are not built

**AutoTrader Connect sync.** The report asks for real-time two-way stock
synchronisation with AutoTrader (Retail Essentials). That is a paid,
credentialled integration — it needs a Connect account, an API key and a feed
endpoint from AutoTrader, none of which I have. What exists instead is
**Export CSV** in Vehicle Management, which produces the full stock list in a
form a feed can be built from. Wiring the real sync is a contained job once the
credentials exist: one scheduled function that reads `website_vehicles` and
posts the feed.

**SMS and email alerts on a new lead.** Leads land in the portal correctly and
the sidebar badges count them, but nothing yet pushes a message to
072 116 6136 or moedindar@yahoo.com. Sending mail needs a server-side secret,
which must not sit in the website or the portal. The right home is a Supabase
Edge Function triggered on insert into `enquiries`, `finance_applications` and
`tradein_requests`, holding the mail provider's key in Supabase's own secrets.
Also a contained job, but it needs a provider account chosen first.
