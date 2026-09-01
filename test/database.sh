#!/usr/bin/env bash
# ============================================================================
# SUPER CARS WITBANK  ·  Database test
# ----------------------------------------------------------------------------
# Runs 01-schema.sql and 02-seed.sql against a throwaway Postgres and checks
# both that they execute and that the security actually behaves.
#
#   ./test/database.sh
#
# Needs Postgres once:  brew install postgresql@16
#
# Why this exists: three defects reached the customer before it did. A view
# marked security_invoker that the website could not read, a storage section
# that aborted the script and silently took the grants with it, and a settings
# document that grew past jsonb_build_object's hard limit of 100 arguments.
# None of those are visible by reading the file. All three fail loudly here.
# ============================================================================
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

PG="/opt/homebrew/opt/postgresql@16/bin"
[[ -d "$PG" ]] || PG="$(dirname "$(command -v psql 2>/dev/null || echo /nonexistent)")"
if [[ ! -x "$PG/psql" ]]; then
  echo "  Postgres not found. Install it once with:  brew install postgresql@16" >&2
  exit 2
fi
export PATH="$PG:$PATH"

DATA=/tmp/sc-testdb
# A port nothing else is likely to hold, and the socket lives beside the data
# directory rather than in /tmp, so this can never attach to somebody else's
# Postgres and read their rows as if they were ours.
PORT=55987
SOCK="$DATA-sock"
fail=0
say(){ printf '  %s\n' "$*"; }
check(){ # check <label> <actual> <expected>
  if [[ "$2" == "$3" ]]; then say "ok    $1"; else say "FAIL  $1 — got '$2', expected '$3'"; fail=1; fi
}

# ---- a clean cluster every run, so a stale one cannot mask a failure ----
pg_ctl -D "$DATA" stop -m immediate >/dev/null 2>&1 || true
rm -rf "$DATA" "$SOCK"; mkdir -p "$SOCK"
initdb -D "$DATA" --locale=en_US.UTF-8 -E UTF-8 -U postgres >/dev/null 2>&1
pg_ctl -D "$DATA" -o "-p $PORT -k $SOCK -c listen_addresses=''" -l "$DATA.log" start >/dev/null 2>&1
for i in {1..25}; do psql -h "$SOCK" -p $PORT -U postgres -c 'select 1' >/dev/null 2>&1 && break; sleep 0.4; done

if ! psql -h "$SOCK" -p $PORT -U postgres -c 'select 1' >/dev/null 2>&1; then
  echo "  Could not start a test Postgres. See $DATA.log" >&2; exit 2
fi

Q(){ psql -h "$SOCK" -p $PORT -U postgres -d sc -qAt -c "$1" 2>&1; }
psql -h "$SOCK" -p $PORT -U postgres -q -v ON_ERROR_STOP=1 -c "create database sc" >/dev/null 2>&1 \
  || { echo "  Could not create the test database." >&2; exit 2; }

# ---- enough of Supabase for the scripts to run exactly as they would there --
psql -h "$SOCK" -p $PORT -U postgres -d sc -q -v ON_ERROR_STOP=1 >/dev/null 2>&1 <<'SQL'
create role anon nologin; create role authenticated nologin; create role service_role nologin;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text unique);
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean default false);
create table storage.objects (id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id), name text);
alter table storage.objects enable row level security;
grant usage on schema public to anon, authenticated, service_role;
SQL

echo "── the two scripts run ───────────────────────────────"
if psql -h "$SOCK" -p $PORT -U postgres -d sc -v ON_ERROR_STOP=1 -f database/01-schema.sql >/tmp/sc-schema.log 2>&1
  then say "ok    01-schema.sql"; else say "FAIL  01-schema.sql"; grep -i error /tmp/sc-schema.log | head -5; fail=1; fi
if psql -h "$SOCK" -p $PORT -U postgres -d sc -v ON_ERROR_STOP=1 -f database/02-seed.sql >/tmp/sc-seed.log 2>&1
  then say "ok    02-seed.sql";   else say "FAIL  02-seed.sql";   grep -i error /tmp/sc-seed.log   | head -5; fail=1; fi

echo
echo "── the content landed ────────────────────────────────"
check "10 settings documents"  "$(Q 'select count(*) from site_settings')" "10"
check "17 vehicles"            "$(Q 'select count(*) from vehicles')" "17"
check "17 live on the website" "$(Q 'select count(*) from website_vehicles')" "17"
check "59 photograph records"  "$(Q 'select count(*) from media')" "59"
check "homepage kept its keys" "$(Q "select count(*) from jsonb_object_keys((select value from site_settings where key='homepage')) k")" "58"
check "every vehicle priced"   "$(Q 'select count(*) from website_vehicles where price <= 0')" "0"
check "every slug unique"      "$(Q 'select count(*) from (select slug from vehicles group by slug having count(*)>1) d')" "0"

echo
echo "── a visitor can read the shop ───────────────────────"
check "sees the stock"    "$(Q 'set role anon; select count(*) from website_vehicles')" "17"
check "sees the settings" "$(Q 'set role anon; select count(*) from site_settings')" "10"

echo
echo "── and nothing else ──────────────────────────────────"
for t in vehicles testimonials media portal_users activity_log; do
  out="$(Q "set role anon; select count(*) from $t" | tr '\n' ' ')"
  case "$out" in *"permission denied"*) say "ok    $t refused";;
                 *) say "FAIL  $t was readable — $out"; fail=1;; esac
done
for c in vin cost_price notes; do
  out="$(Q "set role anon; select $c from website_vehicles limit 1" | tr '\n' ' ')"
  case "$out" in *"does not exist"*|*"permission denied"*) say "ok    $c is not in the public view";;
                 *) say "FAIL  $c LEAKED — $out"; fail=1;; esac
done

echo
echo "── a visitor may submit a lead, never read one ───────"
Q "set role anon; insert into enquiries (id,name,message) values ('e_t','Test','Is it available?')" >/dev/null
check "the enquiry was accepted" "$(Q 'select count(*) from enquiries')" "1"
out="$(Q 'set role anon; select name from enquiries' | tr '\n' ' ')"
case "$out" in *"permission denied"*|"") say "ok    cannot read it back";;
               *) say "FAIL  a visitor read a customer record — $out"; fail=1;; esac

echo
echo "── staff see everything ──────────────────────────────"
Q "insert into auth.users (id,email) values ('11111111-1111-1111-1111-111111111111','staff@test')" >/dev/null
Q "insert into portal_users (user_id,email,name,role) values ('11111111-1111-1111-1111-111111111111','staff@test','Test','admin')" >/dev/null
STAFF="set role authenticated; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';"
check "reported as admin"     "$(Q "$STAFF select portal_role()")" "admin"
check "reads the stock"       "$(Q "$STAFF select count(*) from vehicles")" "17"
check "reads the enquiry"     "$(Q "$STAFF select count(*) from enquiries")" "1"

pg_ctl -D "$DATA" stop -m immediate >/dev/null 2>&1
rm -rf "$SOCK"
echo
if [[ $fail -eq 0 ]]; then echo "  Database clean."; else echo "  Database FAILED."; fi
exit $fail
