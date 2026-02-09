#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3004}"
USER_SERVICE_URL="${USER_SERVICE_URL:-http://localhost:3001}"
TEST_USER_EMAIL="${TEST_USER_EMAIL:-curl-test-user@example.com}"
TEST_USER_NAME="${TEST_USER_NAME:-Curl Test User}"
WORKDIR="$(mktemp -d)"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

log() { printf "\n== %s ==\n" "$1"; }

TOKEN="${TOKEN:-}"
AUTH_AVAILABLE=0
if [[ -z "$TOKEN" ]]; then
  user_resp="$WORKDIR/user-login.json"
  user_payload="$WORKDIR/user-payload.json"
  cat <<JSON > "$user_payload"
{
  "email": "$TEST_USER_EMAIL",
  "name": "$TEST_USER_NAME"
}
JSON
  user_status=$(curl -sS -o "$user_resp" -w "%{http_code}" -X POST "$USER_SERVICE_URL/api/me" \
    -H "Content-Type: application/json" \
    --data-binary "@$user_payload" || true)
  if [[ "$user_status" == "200" || "$user_status" == "201" ]]; then
    TOKEN=$(python3 - <<'PY' "$user_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('token', ''))
PY
)
  else
    echo "warning: could not create/login test user via user-service at $USER_SERVICE_URL (status $user_status); auth tests will be skipped unless TOKEN is set." >&2
  fi
fi
if [[ -n "$TOKEN" ]]; then
  AUTH_AVAILABLE=1
fi

create_book() {
  local title="$1"
  local create_resp="$WORKDIR/create.json"
  local create_payload="$WORKDIR/create-payload.json"
  cat <<JSON > "$create_payload"
{
  "title": "$title",
  "authors": [{"author_id": "auth-1", "name": "Curl Test", "role": ""}],
  "genres": ["Curl"],
  "language_code": "eng",
  "average_rating": 4.2
}
JSON
  local status
  status=$(curl -sS -w "%{http_code}" -X POST "$BASE_URL/api/books" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    --data-binary "@$create_payload" \
    -o "$create_resp")

  if [[ "$status" == "401" || "$status" == "403" ]]; then
    AUTH_AVAILABLE=0
    echo "warning: auth routes rejected token (status $status); skipping auth-only tests." >&2
    return 1
  fi
  if [[ "$status" != "201" ]]; then
    echo "unexpected status from create book: $status" >&2
    cat "$create_resp" >&2
    exit 1
  fi

  CREATED_ID=$(python3 - <<'PY' "$create_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('title'), data
assert data.get('book_id'), data
print(data.get('_id', ''))
PY
)
  CREATED_BOOK_ID=$(python3 - <<'PY' "$create_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('book_id', ''))
PY
)

  if [[ -z "$CREATED_ID" || -z "$CREATED_BOOK_ID" ]]; then
    echo "create book response missing _id/book_id" >&2
    exit 1
  fi
}

log "GET /"
root_resp="$WORKDIR/root.txt"
curl -sS "$BASE_URL/" -o "$root_resp"
root_body=$(cat "$root_resp")
if [[ "$root_body" != "Hello from Book Service!" ]]; then
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
assert data.get('service') == 'book-service', data
PY

log "POST /api/books (unauthorized)"
unauth_status=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/books" \
  -H "Content-Type: application/json" \
  --data-binary '{"title":"Unauthorized","authors":[{"author_id":"auth-1","name":"No Auth","role":""}],"genres":["Curl"],"language_code":"eng","average_rating":4.2}')
if [[ "$unauth_status" != "401" && "$unauth_status" != "403" ]]; then
  echo "expected 401/403 for unauthorized create, got $unauth_status" >&2
  exit 1
fi

log "GET /api/books?limit=1"
books_resp="$WORKDIR/books.json"
curl -sS "$BASE_URL/api/books?limit=1" -o "$books_resp"
python3 - <<'PY' "$books_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('success') is True, data
assert isinstance(data.get('totalBooks'), int), data
assert isinstance(data.get('currentPage'), int), data
assert isinstance(data.get('totalPages'), int), data
books = data.get('books')
assert isinstance(books, list), data
PY

BOOKS_COUNT=$(python3 - <<'PY' "$books_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(len(data.get('books', [])))
PY
)

BOOK_ID=""
BOOK_TITLE=""
CREATED_ID=""
CREATED_BOOK_ID=""
CREATED_IN_SETUP=0

if [[ "$BOOKS_COUNT" -gt 0 ]]; then
  BOOK_TITLE=$(python3 - <<'PY' "$books_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data['books'][0].get('title', ''))
PY
)
  BOOK_ID=$(python3 - <<'PY' "$books_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data['books'][0].get('book_id', ''))
PY
)
else
  if [[ -n "$TOKEN" ]]; then
    log "POST /api/books (auth) [seed]"
    if create_book "Curl Test Book"; then
      CREATED_IN_SETUP=1
      BOOK_ID="$CREATED_BOOK_ID"
      BOOK_TITLE="Curl Test Book"
    fi
  else
    echo "no books available; skipping GET /api/books/:bookId" >&2
  fi
fi

if [[ -n "$BOOK_ID" && -z "$BOOK_TITLE" ]]; then
  BOOK_TITLE=$(python3 - <<'PY' "$books_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data['books'][0].get('title', ''))
PY
)
fi

if [[ -n "$BOOK_ID" ]]; then
  log "GET /api/books/:bookId"
  book_resp="$WORKDIR/book.json"
  curl -sS "$BASE_URL/api/books/$BOOK_ID" -o "$book_resp"
  python3 - <<'PY' "$book_resp" "$BOOK_ID"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('book_id') == sys.argv[2], data
PY
fi

log "GET /api/books/search?q=..."
SEARCH_Q=$(python3 - <<'PY' "$BOOK_TITLE"
import sys, urllib.parse
text = sys.argv[1].strip()
if not text:
    print('the')
else:
    print(urllib.parse.quote(text.split()[0]))
PY
)
search_resp="$WORKDIR/search.json"
curl -sS "$BASE_URL/api/books/search?q=$SEARCH_Q&limit=1" -o "$search_resp"
python3 - <<'PY' "$search_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('success') is True, data
assert isinstance(data.get('books'), list), data
PY

log "GET /api/books/genres"
genres_resp="$WORKDIR/genres.json"
curl -sS "$BASE_URL/api/books/genres" -o "$genres_resp"
python3 - <<'PY' "$genres_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert isinstance(data, list), data
PY

log "GET /api/books/authors"
authors_resp="$WORKDIR/authors.json"
curl -sS "$BASE_URL/api/books/authors" -o "$authors_resp"
python3 - <<'PY' "$authors_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert isinstance(data, list), data
PY

log "GET /api/books/languages"
languages_resp="$WORKDIR/languages.json"
curl -sS "$BASE_URL/api/books/languages" -o "$languages_resp"
python3 - <<'PY' "$languages_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert isinstance(data, list), data
PY

if [[ -n "$TOKEN" && "$AUTH_AVAILABLE" -eq 1 ]]; then
  if [[ "$CREATED_IN_SETUP" -eq 0 ]]; then
    log "POST /api/books (auth)"
    if ! create_book "Curl Test Book"; then
      echo "skipping auth-required routes (POST/PUT/DELETE) due to auth rejection" >&2
      AUTH_AVAILABLE=0
    fi
  else
    log "POST /api/books (auth) [seeded earlier]"
  fi

  if [[ "$AUTH_AVAILABLE" -eq 1 ]]; then
    log "PUT /api/books/:id (auth)"
  update_resp="$WORKDIR/update.json"
  curl -sS -X PUT "$BASE_URL/api/books/$CREATED_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    --data-binary '{"title":"Curl Test Book Updated"}' \
    -o "$update_resp"
  python3 - <<'PY' "$update_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('title') == 'Curl Test Book Updated', data
PY

    log "GET /api/books/:bookId (created book)"
    created_get_resp="$WORKDIR/created-get.json"
    curl -sS "$BASE_URL/api/books/$CREATED_BOOK_ID" -o "$created_get_resp"
    python3 - <<'PY' "$created_get_resp" "$CREATED_BOOK_ID"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('book_id') == sys.argv[2], data
PY

    log "DELETE /api/books/:id (auth)"
    delete_status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/books/$CREATED_ID" \
      -H "Authorization: Bearer $TOKEN")
    if [[ "$delete_status" != "204" ]]; then
      echo "expected 204 from delete, got $delete_status" >&2
      exit 1
    fi

    log "GET /api/books/:bookId (after delete)"
    deleted_get_status=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/api/books/$CREATED_BOOK_ID")
    if [[ "$deleted_get_status" != "404" ]]; then
      echo "expected 404 after delete, got $deleted_get_status" >&2
      exit 1
    fi
  fi
else
  if [[ -z "$TOKEN" ]]; then
    echo "skipping auth-required routes (POST/PUT/DELETE) due to missing token" >&2
  else
    echo "skipping auth-required routes (POST/PUT/DELETE) due to auth rejection" >&2
  fi
fi

log "All curl checks passed"
