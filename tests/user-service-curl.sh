#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3001}"
TEST_USER_EMAIL="${TEST_USER_EMAIL:-curl-test-user@example.com}"
TEST_USER_NAME="${TEST_USER_NAME:-Curl Test User}"

WORKDIR="$(mktemp -d)"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

log() { printf "\n== %s ==\n" "$1"; }

log "GET /"
root_resp="$WORKDIR/root.txt"
curl -sS "$BASE_URL/" -o "$root_resp"
root_body=$(cat "$root_resp")
if [[ "$root_body" != "Hello from User Service!" ]]; then
  echo "unexpected / response: $root_body" >&2
  exit 1
fi

log "GET /health"
health_resp="$WORKDIR/health.json"
curl -sS "$BASE_URL/health" -o "$health_resp"
python3 - <<'PY' "$health_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('status') == 'ok', data
assert data.get('service') == 'user-service', data
PY

log "POST /api/me (create/login)"
user_payload="$WORKDIR/user-payload.json"
cat <<JSON > "$user_payload"
{
  "email": "$TEST_USER_EMAIL",
  "name": "$TEST_USER_NAME"
}
JSON

user_resp="$WORKDIR/user-login.json"
user_status=$(curl -sS -o "$user_resp" -w "%{http_code}" -X POST "$BASE_URL/api/me" \
  -H "Content-Type: application/json" \
  --data-binary "@$user_payload" || true)

if [[ "$user_status" != "200" && "$user_status" != "201" ]]; then
  echo "failed to login/create test user (status $user_status)" >&2
  cat "$user_resp" >&2 || true
  exit 1
fi

TOKEN=$(python3 - <<'PY' "$user_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('token', ''))
PY
)

USER_ID=$(python3 - <<'PY' "$user_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
user = data.get('user') or {}
print(user.get('id',''))
PY
)

if [[ -z "$TOKEN" || -z "$USER_ID" ]]; then
  echo "user-service did not return token/userId" >&2
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"

log "POST /api/auth/verify (unauthorized)"
unauth_verify_status=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/verify" || true)
if [[ "$unauth_verify_status" != "401" && "$unauth_verify_status" != "403" ]]; then
  echo "expected 401/403 for unauthorized verify, got $unauth_verify_status" >&2
  exit 1
fi

log "POST /api/auth/verify"
verify_resp="$WORKDIR/verify.json"
verify_status=$(curl -sS -o "$verify_resp" -w "%{http_code}" -X POST "$BASE_URL/api/auth/verify" \
  -H "$AUTH_HEADER")
if [[ "$verify_status" != "200" ]]; then
  echo "verify failed (status $verify_status)" >&2
  cat "$verify_resp" >&2 || true
  exit 1
fi
python3 - <<'PY' "$verify_resp" "$USER_ID"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('userId') == sys.argv[2], data
PY

log "GET /api/me (unauthorized)"
unauth_me_status=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/api/me" || true)
if [[ "$unauth_me_status" != "401" && "$unauth_me_status" != "403" ]]; then
  echo "expected 401/403 for unauthorized me, got $unauth_me_status" >&2
  exit 1
fi

log "GET /api/me"
me_resp="$WORKDIR/me.json"
me_status=$(curl -sS -o "$me_resp" -w "%{http_code}" "$BASE_URL/api/me" -H "$AUTH_HEADER")
if [[ "$me_status" != "200" ]]; then
  echo "get me failed (status $me_status)" >&2
  cat "$me_resp" >&2 || true
  exit 1
fi
python3 - <<'PY' "$me_resp" "$USER_ID"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('id') == sys.argv[2], data
PY

log "PATCH /api/me"
update_resp="$WORKDIR/update.json"
update_status=$(curl -sS -o "$update_resp" -w "%{http_code}" -X PATCH "$BASE_URL/api/me" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  --data-binary '{"name":"Curl Test User Updated"}')
if [[ "$update_status" != "200" ]]; then
  echo "update me failed (status $update_status)" >&2
  cat "$update_resp" >&2 || true
  exit 1
fi

log "PUT /api/me/preferences"
prefs_resp="$WORKDIR/prefs.json"
prefs_status=$(curl -sS -o "$prefs_resp" -w "%{http_code}" -X PUT "$BASE_URL/api/me/preferences" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  --data-binary '{"theme":"DARK","language":"en","notificationsEmail":true,"dailyDigest":false,"defaultViewMode":"CARD"}')
if [[ "$prefs_status" != "200" ]]; then
  echo "update preferences failed (status $prefs_status)" >&2
  cat "$prefs_resp" >&2 || true
  exit 1
fi

log "GET /api/me/preferences"
get_prefs_resp="$WORKDIR/get-prefs.json"
get_prefs_status=$(curl -sS -o "$get_prefs_resp" -w "%{http_code}" "$BASE_URL/api/me/preferences" -H "$AUTH_HEADER")
if [[ "$get_prefs_status" != "200" ]]; then
  echo "get preferences failed (status $get_prefs_status)" >&2
  cat "$get_prefs_resp" >&2 || true
  exit 1
fi

log "GET /api/me/stats"
stats_resp="$WORKDIR/stats.json"
stats_status=$(curl -sS -o "$stats_resp" -w "%{http_code}" "$BASE_URL/api/me/stats" -H "$AUTH_HEADER")
if [[ "$stats_status" != "200" ]]; then
  echo "get stats failed (status $stats_status)" >&2
  cat "$stats_resp" >&2 || true
  exit 1
fi

log "GET /api/token/:userId"
token_resp="$WORKDIR/token.json"
token_status=$(curl -sS -o "$token_resp" -w "%{http_code}" "$BASE_URL/api/token/$USER_ID")
if [[ "$token_status" != "200" ]]; then
  echo "token endpoint failed (status $token_status)" >&2
  cat "$token_resp" >&2 || true
  exit 1
fi

log "GET /api/public/:userId"
public_resp="$WORKDIR/public.json"
public_status=$(curl -sS -o "$public_resp" -w "%{http_code}" "$BASE_URL/api/public/$USER_ID")
if [[ "$public_status" != "200" ]]; then
  echo "public token endpoint failed (status $public_status)" >&2
  cat "$public_resp" >&2 || true
  exit 1
fi

log "PUT /api/users/:userId/status (non-admin should fail)"
admin_status=$(curl -sS -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/users/$USER_ID/status" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  --data-binary '{"status":"SUSPENDED"}')
if [[ "$admin_status" != "403" && "$admin_status" != "401" ]]; then
  echo "expected 401/403 for admin status update, got $admin_status" >&2
  exit 1
fi

log "PUT /api/users/:userId/preferences/reset (non-admin should fail)"
admin_prefs_status=$(curl -sS -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/api/users/$USER_ID/preferences/reset" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER")
if [[ "$admin_prefs_status" != "403" && "$admin_prefs_status" != "401" ]]; then
  echo "expected 401/403 for admin reset, got $admin_prefs_status" >&2
  exit 1
fi

log "All curl checks passed"
