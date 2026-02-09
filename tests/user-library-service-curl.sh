#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3003}"
USER_SERVICE_URL="${USER_SERVICE_URL:-http://localhost:3001}"
BOOK_SERVICE_URL="${BOOK_SERVICE_URL:-http://localhost:3004}"
TEST_USER_EMAIL="${TEST_USER_EMAIL:-curl-test-user@example.com}"
TEST_USER_NAME="${TEST_USER_NAME:-Curl Test User}"

WORKDIR="$(mktemp -d)"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

log() { printf "\n== %s ==\n" "$1"; }

# Get token from user-service (create/login)
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

if [[ -z "$TOKEN" ]]; then
  echo "user-service did not return token" >&2
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"

# Ensure a book_id exists for book-related operations
BOOK_ID=""
BOOKS_RESP="$WORKDIR/books.json"
BOOKS_STATUS=$(curl -sS -o "$BOOKS_RESP" -w "%{http_code}" "$BOOK_SERVICE_URL/api/books?limit=1" || true)
if [[ "$BOOKS_STATUS" == "200" ]]; then
  BOOK_ID=$(python3 - <<'PY' "$BOOKS_RESP"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
books = data.get('books') or []
print(books[0].get('book_id','') if books else '')
PY
)
fi

if [[ -z "$BOOK_ID" ]]; then
  log "POST /api/books (seed for library)"
  create_book_resp="$WORKDIR/create-book.json"
  create_status=$(curl -sS -o "$create_book_resp" -w "%{http_code}" -X POST "$BOOK_SERVICE_URL/api/books" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    --data-binary '{"title":"Library Curl Seed Book","authors":[{"author_id":"auth-1","name":"Curl Test","role":""}],"genres":["Curl"],"language_code":"eng","average_rating":4.2}' || true)
  if [[ "$create_status" == "201" ]]; then
    BOOK_ID=$(python3 - <<'PY' "$create_book_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('book_id',''))
PY
)
  fi
fi

log "GET /reading-lists (unauthorized)"
unauth_list_status=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/reading-lists" || true)
if [[ "$unauth_list_status" != "401" && "$unauth_list_status" != "403" ]]; then
  echo "expected 401/403 for unauthorized list, got $unauth_list_status" >&2
  exit 1
fi

# Initialize defaults
log "POST /reading-lists/initialize-defaults"
init_resp="$WORKDIR/init.json"
init_status=$(curl -sS -o "$init_resp" -w "%{http_code}" -X POST "$BASE_URL/reading-lists/initialize-defaults" \
  -H "$AUTH_HEADER")
if [[ "$init_status" != "200" && "$init_status" != "201" ]]; then
  echo "initialize-defaults failed (status $init_status)" >&2
  cat "$init_resp" >&2 || true
  exit 1
fi

# Fetch lists
log "GET /reading-lists?includeBooks=true"
lists_resp="$WORKDIR/lists.json"
list_status=$(curl -sS -o "$lists_resp" -w "%{http_code}" "$BASE_URL/reading-lists?includeBooks=true&booksLimit=2&booksOffset=0" \
  -H "$AUTH_HEADER")
if [[ "$list_status" != "200" ]]; then
  echo "list fetch failed (status $list_status)" >&2
  cat "$lists_resp" >&2 || true
  exit 1
fi

DEFAULT_LIST_ID=$(python3 - <<'PY' "$lists_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
for item in data:
    if item.get('isDefault'):
        print(item.get('id',''))
        break
PY
)

# Create list A
log "POST /reading-lists"
create_list_resp="$WORKDIR/create-list.json"
create_payload="$WORKDIR/create-list-payload.json"
if [[ -n "$BOOK_ID" ]]; then
  cat <<JSON > "$create_payload"
{
  "name": "Curl Test List A",
  "description": "List A",
  "color": "#111111",
  "icon": "🧪",
  "isPublic": false,
  "bookIds": ["$BOOK_ID"]
}
JSON
else
  cat <<JSON > "$create_payload"
{
  "name": "Curl Test List A",
  "description": "List A",
  "color": "#111111",
  "icon": "🧪",
  "isPublic": false
}
JSON
fi

create_list_status=$(curl -sS -o "$create_list_resp" -w "%{http_code}" -X POST "$BASE_URL/reading-lists" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  --data-binary "@$create_payload")
if [[ "$create_list_status" != "201" ]]; then
  echo "create list failed (status $create_list_status)" >&2
  cat "$create_list_resp" >&2 || true
  exit 1
fi

LIST_A_ID=$(python3 - <<'PY' "$create_list_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('id',''))
PY
)

# Create list B
log "POST /reading-lists (List B)"
create_list_b_resp="$WORKDIR/create-list-b.json"
create_list_b_status=$(curl -sS -o "$create_list_b_resp" -w "%{http_code}" -X POST "$BASE_URL/reading-lists" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  --data-binary '{"name":"Curl Test List B","description":"List B","color":"#222222","icon":"🧪","isPublic":false}')
if [[ "$create_list_b_status" != "201" ]]; then
  echo "create list B failed (status $create_list_b_status)" >&2
  cat "$create_list_b_resp" >&2 || true
  exit 1
fi

LIST_B_ID=$(python3 - <<'PY' "$create_list_b_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('id',''))
PY
)

# GET list A
log "GET /reading-lists/:id"
get_list_resp="$WORKDIR/get-list.json"
get_list_status=$(curl -sS -o "$get_list_resp" -w "%{http_code}" "$BASE_URL/reading-lists/$LIST_A_ID?includeBooks=true" \
  -H "$AUTH_HEADER")
if [[ "$get_list_status" != "200" ]]; then
  echo "get list failed (status $get_list_status)" >&2
  cat "$get_list_resp" >&2 || true
  exit 1
fi

# Update list A
log "PUT /reading-lists/:id"
update_resp="$WORKDIR/update-list.json"
update_status=$(curl -sS -o "$update_resp" -w "%{http_code}" -X PUT "$BASE_URL/reading-lists/$LIST_A_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  --data-binary '{"name":"Curl Test List A Updated","description":"Updated"}')
if [[ "$update_status" != "200" ]]; then
  echo "update list failed (status $update_status)" >&2
  cat "$update_resp" >&2 || true
  exit 1
fi

# Default list immutability check
if [[ -n "$DEFAULT_LIST_ID" ]]; then
  log "PUT /reading-lists/:id (default list name change should fail)"
  default_update_status=$(curl -sS -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/reading-lists/$DEFAULT_LIST_ID" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    --data-binary '{"name":"Should Fail"}')
  if [[ "$default_update_status" != "400" ]]; then
    echo "expected 400 for default list update, got $default_update_status" >&2
    exit 1
  fi
fi

# Add books to list A (if we have a book id)
if [[ -n "$BOOK_ID" ]]; then
  log "POST /reading-lists/:id/books"
  add_resp="$WORKDIR/add-books.json"
  add_status=$(curl -sS -o "$add_resp" -w "%{http_code}" -X POST "$BASE_URL/reading-lists/$LIST_A_ID/books" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    --data-binary "{\"bookIds\":[\"$BOOK_ID\"]}")
  if [[ "$add_status" != "200" ]]; then
    echo "add books failed (status $add_status)" >&2
    cat "$add_resp" >&2 || true
    exit 1
  fi

  # Move books from list A to list B
  log "POST /reading-lists/:id/move-books"
  move_resp="$WORKDIR/move-books.json"
  move_status=$(curl -sS -o "$move_resp" -w "%{http_code}" -X POST "$BASE_URL/reading-lists/$LIST_A_ID/move-books" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    --data-binary "{\"targetListId\":\"$LIST_B_ID\",\"bookIds\":[\"$BOOK_ID\"]}")
  if [[ "$move_status" != "200" ]]; then
    echo "move books failed (status $move_status)" >&2
    cat "$move_resp" >&2 || true
    exit 1
  fi

  # Remove books from list B using query param
  log "DELETE /reading-lists/:id/books?bookIds=..."
  remove_status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/reading-lists/$LIST_B_ID/books?bookIds=$BOOK_ID" \
    -H "$AUTH_HEADER")
  if [[ "$remove_status" != "204" ]]; then
    echo "remove books failed (status $remove_status)" >&2
    exit 1
  fi
fi

# Default list delete should fail
if [[ -n "$DEFAULT_LIST_ID" ]]; then
  log "DELETE /reading-lists/:id (default list should fail)"
  default_delete_status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/reading-lists/$DEFAULT_LIST_ID" \
    -H "$AUTH_HEADER")
  if [[ "$default_delete_status" != "400" ]]; then
    echo "expected 400 for default list delete, got $default_delete_status" >&2
    exit 1
  fi
fi

# Delete list A and list B
log "DELETE /reading-lists/:id (list A)"
delete_a_status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/reading-lists/$LIST_A_ID" \
  -H "$AUTH_HEADER")
if [[ "$delete_a_status" != "204" ]]; then
  echo "delete list A failed (status $delete_a_status)" >&2
  exit 1
fi

log "DELETE /reading-lists/:id (list B)"
delete_b_status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/reading-lists/$LIST_B_ID" \
  -H "$AUTH_HEADER")
if [[ "$delete_b_status" != "204" ]]; then
  echo "delete list B failed (status $delete_b_status)" >&2
  exit 1
fi

log "All curl checks passed"
