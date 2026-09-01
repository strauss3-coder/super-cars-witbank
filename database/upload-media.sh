#!/usr/bin/env bash
# ============================================================================
# SUPER CARS WITBANK  ·  Upload vehicle photographs to Supabase Storage
# ----------------------------------------------------------------------------
# Puts every file in assets/stock/<code>/<nn>.jpg at exactly the path the
# rows in 02-seed.sql expect:
#
#     vehicle-images/stock/<code>/<nn>.jpg
#
# Run it from anywhere; it works out its own location.
#
#   ./database/upload-media.sh
#
# It reads the project address from js/config.js and asks you to paste the
# service_role key, so nothing secret ends up in your shell history.
#
# The service role key bypasses row level security, which is what lets this
# write to Storage without signing in. It is a SECRET. Never put it in the
# website, the portal, or a git commit. Use it here and nowhere else.
# ============================================================================
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(dirname "$here")"
src="$root/assets/stock"
bucket="vehicle-images"

# ---------------------------------------------------------------------------
# The project address is read out of the website's own config, so there is one
# place it is written down and this can never be pointed at the wrong project.
# ---------------------------------------------------------------------------
if [[ -z "${SUPABASE_URL:-}" ]]; then
  SUPABASE_URL="$(sed -n "s/.*supabaseUrl: *'\([^']*\)'.*/\1/p" "$root/js/config.js" | head -1)"
fi

if [[ -z "$SUPABASE_URL" || "$SUPABASE_URL" == *YOUR-PROJECT* ]]; then
  echo "No Supabase project is set in js/config.js, so there is nowhere to upload to." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# The service role key is asked for rather than typed into the command, so it
# never lands in your shell history where anyone with the machine could read it
# back. Nothing is echoed as you paste.
# ---------------------------------------------------------------------------
if [[ -z "${SUPABASE_SERVICE_KEY:-}" ]]; then
  echo
  echo "Uploading photographs to:"
  echo "  $SUPABASE_URL"
  echo
  echo "Paste your service_role key and press return."
  echo "Find it in Supabase: Settings -> API -> Project API keys -> service_role -> Reveal."
  echo "Nothing will appear as you paste. That is deliberate."
  echo
  printf "service_role key: "
  read -rs SUPABASE_SERVICE_KEY
  echo
  echo
fi

if [[ -z "$SUPABASE_SERVICE_KEY" ]]; then
  echo "No key given, so nothing was uploaded." >&2
  exit 1
fi

# A publishable key cannot write to Storage, and the failure it produces is a
# confusing 401 on every single file. Catch it here instead.
if [[ "$SUPABASE_SERVICE_KEY" == sb_publishable_* || "$SUPABASE_SERVICE_KEY" == publishable_* ]]; then
  echo "That is the publishable key, which is not allowed to upload." >&2
  echo "You need the one marked service_role, under the same screen." >&2
  exit 1
fi

url="${SUPABASE_URL%/}"

if [[ ! -d "$src" ]]; then
  echo "No photographs found at $src" >&2
  exit 1
fi

total=0; ok=0; failed=0

for dir in "$src"/*/; do
  code="$(basename "$dir")"
  for file in "$dir"*.jpg; do
    [[ -e "$file" ]] || continue
    name="$(basename "$file")"
    path="stock/$code/$name"
    total=$((total + 1))

    # x-upsert lets the script be run twice without erroring on a file that
    # is already there, so a part-finished upload can simply be repeated.
    status=$(curl -s -o /dev/null -w '%{http_code}' \
      -X POST "$url/storage/v1/object/$bucket/$path" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
      -H "Content-Type: image/jpeg" \
      -H "x-upsert: true" \
      --data-binary "@$file")

    if [[ "$status" == "200" || "$status" == "201" ]]; then
      ok=$((ok + 1))
      printf '  ok   %s\n' "$path"
    else
      failed=$((failed + 1))
      printf '  FAIL %s (HTTP %s)\n' "$path" "$status" >&2
    fi
  done
done

echo
echo "$ok of $total uploaded, $failed failed."
echo
if [[ $failed -eq 0 ]]; then
  echo "Public URLs now look like:"
  echo "  $url/storage/v1/object/public/$bucket/stock/0001/01.jpg"
  echo
  echo "Check that base_url in database/02-seed.sql is set to:"
  echo "  $url"
else
  echo "Some files did not upload. Common causes:" >&2
  echo "  403  the vehicle-images bucket does not exist yet. Run 01-schema.sql first." >&2
  echo "  401  the key is wrong, or it is the publishable key rather than service_role." >&2
  exit 1
fi
