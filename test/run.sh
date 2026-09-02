#!/usr/bin/env bash
# ============================================================================
# SUPER CARS WITBANK  ·  Run everything
#
#   ./test/run.sh
#
# Needs, once:
#   npm --prefix /tmp install jsdom
#   brew install postgresql@16
# ============================================================================
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
fail=0

echo "── parse ─────────────────────────────────────────────"
for f in js/*.js; do
  node --check "$f" >/dev/null 2>&1 || { echo "  FAIL $f"; fail=1; }
done
echo "  $(ls js/*.js | wc -l | tr -d ' ') website scripts"

python3 - <<'PY' || fail=1
import io,re,subprocess,sys
b=re.findall(r'<script>\n(.*?)\n</script>',
             io.open('portal/index.html',encoding='utf-8').read(),re.S)[0]
io.open('/tmp/_portal.js','w',encoding='utf-8').write(b)
r=subprocess.run(['node','--check','/tmp/_portal.js'],capture_output=True,text=True)
print('  portal script' if r.returncode==0 else '  FAIL portal\n'+r.stderr[:400])
sys.exit(r.returncode)
PY

echo
echo "── pages ─────────────────────────────────────────────"
node test/pages.js || fail=1

echo
echo "── mobile menu ───────────────────────────────────────"
node test/menu.js || fail=1

echo
echo "── every control ─────────────────────────────────────"
node test/interactive.js || fail=1

echo
echo "── portal ────────────────────────────────────────────"
node test/portal.js || fail=1

echo
echo "── listener leaks ────────────────────────────────────"
node test/listeners.js || fail=1

echo
echo "── database ──────────────────────────────────────────"
./test/database.sh
rc=$?
[ $rc -eq 2 ] && echo "  (skipped — Postgres not installed)" || [ $rc -eq 0 ] || fail=1

echo
if [ $fail -eq 0 ]; then echo "All clear."; else echo "Something failed above."; fi
exit $fail
