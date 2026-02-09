#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3002}"
USER_SERVICE_URL="${USER_SERVICE_URL:-http://localhost:3001}"
BOOK_SERVICE_URL="${BOOK_SERVICE_URL:-http://localhost:3004}"
TEST_USER_EMAIL="${TEST_USER_EMAIL:-curl-test-user@example.com}"
TEST_USER_NAME="${TEST_USER_NAME:-Curl Test User}"

WORKDIR="$(mktemp -d)"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

log() { printf "\n== %s ==\n" "$1"; }

# Login/create test user
user_payload="$WORKDIR/user-payload.json"
cat <<JSON > "$user_payload"
{
  "email": "$TEST_USER_EMAIL",
  "name": "$TEST_USER_NAME"
}
JSON

user_resp="$WORKDIR/user-login.json"
user_status=$(curl -sS -o "$user_resp" -w "%{http_code}" -X POST "$USER_SERVICE_URL/api/me" \
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

# Ensure a book exists
BOOK_ID=""
books_resp="$WORKDIR/books.json"
books_status=$(curl -sS -o "$books_resp" -w "%{http_code}" "$BOOK_SERVICE_URL/api/books?limit=1" || true)
if [[ "$books_status" == "200" ]]; then
  BOOK_ID=$(python3 - <<'PY' "$books_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
books = data.get('books') or []
print(books[0].get('book_id','') if books else '')
PY
)
fi

if [[ -z "$BOOK_ID" ]]; then
  log "POST /api/books (seed for reviews)"
  create_book_resp="$WORKDIR/create-book.json"
  create_status=$(curl -sS -o "$create_book_resp" -w "%{http_code}" -X POST "$BOOK_SERVICE_URL/api/books" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    --data-binary '{"title":"Review Curl Seed Book","authors":[{"author_id":"auth-1","name":"Curl Test","role":""}],"genres":["Curl"],"language_code":"eng","average_rating":4.2}' || true)
  if [[ "$create_status" == "201" ]]; then
    BOOK_ID=$(python3 - <<'PY' "$create_book_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('book_id',''))
PY
)
  else
    echo "failed to seed book (status $create_status)" >&2
    cat "$create_book_resp" >&2 || true
    exit 1
  fi
fi

if [[ -z "$BOOK_ID" ]]; then
  echo "unable to determine a book_id for review tests" >&2
  exit 1
fi

log "GET /"
root_resp="$WORKDIR/root.txt"
curl -sS "$BASE_URL/" -o "$root_resp"
root_body=$(cat "$root_resp")
if [[ "$root_body" != "Review service is running!" ]]; then
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
assert data.get('service') == 'review-service', data
PY

log "POST /api/reviews (unauthorized)"
unauth_review_status=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/reviews" \
  -H "Content-Type: application/json" \
  --data-binary "{\"rating\":5,\"reviewText\":\"Unauthorized\",\"tldr\":\"nope\",\"bookId\":\"$BOOK_ID\"}")
if [[ "$unauth_review_status" != "401" && "$unauth_review_status" != "403" ]]; then
  echo "expected 401/403 for unauthorized review create, got $unauth_review_status" >&2
  exit 1
fi

log "GET /api/reviews/book/:bookId"
book_reviews_resp="$WORKDIR/book-reviews.json"
curl -sS "$BASE_URL/api/reviews/book/$BOOK_ID?limit=5" -o "$book_reviews_resp"
python3 - <<'PY' "$book_reviews_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert isinstance(data, list), data
PY

log "POST /api/reviews"
create_review_payload="$WORKDIR/create-review.json"
cat <<JSON > "$create_review_payload"
{
  "rating": 5,
  "reviewText": "This is a curl-created review for integration testing.",
  "tldr": "Solid read",
  "bookId": "$BOOK_ID"
}
JSON

create_review_resp="$WORKDIR/create-review-resp.json"
create_review_status=$(curl -sS -o "$create_review_resp" -w "%{http_code}" -X POST "$BASE_URL/api/reviews" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  --data-binary "@$create_review_payload")

if [[ "$create_review_status" != "201" ]]; then
  echo "create review failed (status $create_review_status)" >&2
  cat "$create_review_resp" >&2 || true
  exit 1
fi

REVIEW_ID=$(python3 - <<'PY' "$create_review_resp" "$BOOK_ID" "$USER_ID"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('bookId') == sys.argv[2], data
assert data.get('userId') == sys.argv[3], data
print(data.get('id',''))
PY
)

if [[ -z "$REVIEW_ID" ]]; then
  echo "create review response missing id" >&2
  exit 1
fi

log "GET /api/reviews/:id"
get_review_resp="$WORKDIR/get-review.json"
curl -sS "$BASE_URL/api/reviews/$REVIEW_ID" -o "$get_review_resp"
python3 - <<'PY' "$get_review_resp" "$REVIEW_ID"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('id') == sys.argv[2], data
PY

log "GET /api/reviews/user/:userId"
user_reviews_resp="$WORKDIR/user-reviews.json"
curl -sS "$BASE_URL/api/reviews/user/$USER_ID?limit=5" -o "$user_reviews_resp"
python3 - <<'PY' "$user_reviews_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert isinstance(data, list), data
PY

log "PUT /api/reviews/:id"
update_review_resp="$WORKDIR/update-review.json"
update_review_status=$(curl -sS -o "$update_review_resp" -w "%{http_code}" -X PUT "$BASE_URL/api/reviews/$REVIEW_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  --data-binary '{"rating":4,"reviewText":"Updated curl review text for validation."}')
if [[ "$update_review_status" != "200" ]]; then
  echo "update review failed (status $update_review_status)" >&2
  cat "$update_review_resp" >&2 || true
  exit 1
fi

log "DELETE /api/reviews/:id"
delete_status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/reviews/$REVIEW_ID" \
  -H "$AUTH_HEADER")
if [[ "$delete_status" != "204" ]]; then
  echo "delete review failed (status $delete_status)" >&2
  exit 1
fi

log "GET /api/reviews/:id (after delete)"
get_deleted_status=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/api/reviews/$REVIEW_ID")
if [[ "$get_deleted_status" != "404" ]]; then
  echo "expected 404 after delete, got $get_deleted_status" >&2
  exit 1
fi

log "All curl checks passed"
