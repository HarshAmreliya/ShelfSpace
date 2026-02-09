#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3005}"
USER_SERVICE_URL="${USER_SERVICE_URL:-http://localhost:3001}"
TEST_USER_EMAIL="${TEST_USER_EMAIL:-curl-forum-user@example.com}"
TEST_USER_NAME="${TEST_USER_NAME:-Curl Forum Admin}"
TEST_USER2_EMAIL="${TEST_USER2_EMAIL:-curl-forum-member@example.com}"
TEST_USER2_NAME="${TEST_USER2_NAME:-Curl Forum Member}"

WORKDIR="$(mktemp -d)"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

log() { printf "\n== %s ==\n" "$1"; }

log "GET /"
root_resp="$WORKDIR/root.txt"
curl -sS "$BASE_URL/" -o "$root_resp"
root_body=$(cat "$root_resp")
if [[ "$root_body" != "Hello from Forum Service!" ]]; then
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
assert data.get('service') == 'forum-service', data
PY

log "POST /api/forums (unauthorized)"
unauth_status=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/forums" \
  -H "Content-Type: application/json" \
  --data-binary '{"name":"Unauthorized Forum","description":"No token","tags":["curl"]}' || true)
if [[ "$unauth_status" != "401" && "$unauth_status" != "403" ]]; then
  echo "expected 401/403 for unauthorized create, got $unauth_status" >&2
  exit 1
fi

log "POST /api/me (admin user)"
user_payload="$WORKDIR/user1.json"
cat <<JSON > "$user_payload"
{
  "email": "$TEST_USER_EMAIL",
  "name": "$TEST_USER_NAME"
}
JSON

user_resp="$WORKDIR/user1-resp.json"
user_status=$(curl -sS -o "$user_resp" -w "%{http_code}" -X POST "$USER_SERVICE_URL/api/me" \
  -H "Content-Type: application/json" \
  --data-binary "@$user_payload" || true)
if [[ "$user_status" != "200" && "$user_status" != "201" ]]; then
  echo "failed to login/create admin user (status $user_status)" >&2
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

log "POST /api/forums"
create_forum_payload="$WORKDIR/create-forum.json"
cat <<JSON > "$create_forum_payload"
{
  "name": "Curl Test Forum",
  "description": "Forum created by curl script",
  "isPublic": true,
  "tags": ["curl","test"]
}
JSON

create_forum_resp="$WORKDIR/create-forum-resp.json"
create_forum_status=$(curl -sS -o "$create_forum_resp" -w "%{http_code}" -X POST "$BASE_URL/api/forums" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  --data-binary "@$create_forum_payload")
if [[ "$create_forum_status" != "201" ]]; then
  echo "create forum failed (status $create_forum_status)" >&2
  cat "$create_forum_resp" >&2 || true
  exit 1
fi

FORUM_ID=$(python3 - <<'PY' "$create_forum_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('id',''))
PY
)

if [[ -z "$FORUM_ID" ]]; then
  echo "create forum response missing id" >&2
  exit 1
fi

log "GET /api/forums"
forums_resp="$WORKDIR/forums.json"
curl -sS "$BASE_URL/api/forums?limit=5" -o "$forums_resp"
python3 - <<'PY' "$forums_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert isinstance(data, list), data
PY

log "GET /api/forums/:id"
forum_resp="$WORKDIR/forum.json"
forum_status=$(curl -sS -o "$forum_resp" -w "%{http_code}" "$BASE_URL/api/forums/$FORUM_ID")
if [[ "$forum_status" != "200" ]]; then
  echo "get forum failed (status $forum_status)" >&2
  cat "$forum_resp" >&2 || true
  exit 1
fi

log "POST /api/me (member user)"
user2_payload="$WORKDIR/user2.json"
cat <<JSON > "$user2_payload"
{
  "email": "$TEST_USER2_EMAIL",
  "name": "$TEST_USER2_NAME"
}
JSON

user2_resp="$WORKDIR/user2-resp.json"
user2_status=$(curl -sS -o "$user2_resp" -w "%{http_code}" -X POST "$USER_SERVICE_URL/api/me" \
  -H "Content-Type: application/json" \
  --data-binary "@$user2_payload" || true)
if [[ "$user2_status" != "200" && "$user2_status" != "201" ]]; then
  echo "failed to login/create member user (status $user2_status)" >&2
  cat "$user2_resp" >&2 || true
  exit 1
fi

TOKEN2=$(python3 - <<'PY' "$user2_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('token', ''))
PY
)

USER2_ID=$(python3 - <<'PY' "$user2_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
user = data.get('user') or {}
print(user.get('id',''))
PY
)

if [[ -z "$TOKEN2" || -z "$USER2_ID" ]]; then
  echo "user-service did not return token/userId for member user" >&2
  exit 1
fi

AUTH_HEADER_2="Authorization: Bearer $TOKEN2"

log "GET /api/forums/:id/members/:userId/verify (before join)"
verify_before_status=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/api/forums/$FORUM_ID/members/$USER2_ID/verify")
if [[ "$verify_before_status" != "404" ]]; then
  echo "expected 404 before join, got $verify_before_status" >&2
  exit 1
fi

log "POST /api/forums/:id/join"
join_resp="$WORKDIR/join.json"
join_status=$(curl -sS -o "$join_resp" -w "%{http_code}" -X POST "$BASE_URL/api/forums/$FORUM_ID/join" \
  -H "$AUTH_HEADER_2")
if [[ "$join_status" != "201" ]]; then
  echo "join forum failed (status $join_status)" >&2
  cat "$join_resp" >&2 || true
  exit 1
fi

log "GET /api/forums/:id/members"
members_resp="$WORKDIR/members.json"
members_status=$(curl -sS -o "$members_resp" -w "%{http_code}" "$BASE_URL/api/forums/$FORUM_ID/members")
if [[ "$members_status" != "200" ]]; then
  echo "get members failed (status $members_status)" >&2
  cat "$members_resp" >&2 || true
  exit 1
fi

log "GET /api/forums/:id/members/:userId/verify (after join)"
verify_resp="$WORKDIR/verify.json"
verify_status=$(curl -sS -o "$verify_resp" -w "%{http_code}" "$BASE_URL/api/forums/$FORUM_ID/members/$USER2_ID/verify")
if [[ "$verify_status" != "200" ]]; then
  echo "verify membership failed (status $verify_status)" >&2
  cat "$verify_resp" >&2 || true
  exit 1
fi
python3 - <<'PY' "$verify_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
assert data.get('isMember') is True, data
PY

log "POST /api/forums/:id/threads (unauthorized)"
unauth_thread_status=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/forums/$FORUM_ID/threads" \
  -H "Content-Type: application/json" \
  --data-binary '{"title":"No auth","content":"Should fail"}' || true)
if [[ "$unauth_thread_status" != "401" && "$unauth_thread_status" != "403" ]]; then
  echo "expected 401/403 for unauthorized thread create, got $unauth_thread_status" >&2
  exit 1
fi

log "POST /api/forums/:id/threads (member)"
thread_resp="$WORKDIR/thread.json"
thread_status=$(curl -sS -o "$thread_resp" -w "%{http_code}" -X POST "$BASE_URL/api/forums/$FORUM_ID/threads" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER_2" \
  --data-binary '{"title":"Curl Thread","content":"Thread content"}')
if [[ "$thread_status" != "201" ]]; then
  echo "create thread failed (status $thread_status)" >&2
  cat "$thread_resp" >&2 || true
  exit 1
fi

THREAD_ID=$(python3 - <<'PY' "$thread_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('id',''))
PY
)
if [[ -z "$THREAD_ID" ]]; then
  echo "create thread response missing id" >&2
  exit 1
fi

log "GET /api/forums/:id/threads"
threads_resp="$WORKDIR/threads.json"
threads_status=$(curl -sS -o "$threads_resp" -w "%{http_code}" "$BASE_URL/api/forums/$FORUM_ID/threads?limit=5")
if [[ "$threads_status" != "200" ]]; then
  echo "list threads failed (status $threads_status)" >&2
  cat "$threads_resp" >&2 || true
  exit 1
fi

log "GET /api/forums/:id/threads/:threadId"
thread_get_resp="$WORKDIR/thread-get.json"
thread_get_status=$(curl -sS -o "$thread_get_resp" -w "%{http_code}" "$BASE_URL/api/forums/$FORUM_ID/threads/$THREAD_ID")
if [[ "$thread_get_status" != "200" ]]; then
  echo "get thread failed (status $thread_get_status)" >&2
  cat "$thread_get_resp" >&2 || true
  exit 1
fi

log "POST /api/forums/:id/threads/:threadId/posts"
post_resp="$WORKDIR/post.json"
post_status=$(curl -sS -o "$post_resp" -w "%{http_code}" -X POST "$BASE_URL/api/forums/$FORUM_ID/threads/$THREAD_ID/posts" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER_2" \
  --data-binary '{"content":"First post from curl"}')
if [[ "$post_status" != "201" ]]; then
  echo "create post failed (status $post_status)" >&2
  cat "$post_resp" >&2 || true
  exit 1
fi

POST_ID=$(python3 - <<'PY' "$post_resp"
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(data.get('id',''))
PY
)
if [[ -z "$POST_ID" ]]; then
  echo "create post response missing id" >&2
  exit 1
fi

log "GET /api/forums/:id/threads/:threadId/posts"
posts_resp="$WORKDIR/posts.json"
posts_status=$(curl -sS -o "$posts_resp" -w "%{http_code}" "$BASE_URL/api/forums/$FORUM_ID/threads/$THREAD_ID/posts?limit=5")
if [[ "$posts_status" != "200" ]]; then
  echo "list posts failed (status $posts_status)" >&2
  cat "$posts_resp" >&2 || true
  exit 1
fi

log "POST /api/forums/:id/threads/:threadId/posts/:postId/reactions"
reaction_resp="$WORKDIR/reaction.json"
reaction_status=$(curl -sS -o "$reaction_resp" -w "%{http_code}" -X POST "$BASE_URL/api/forums/$FORUM_ID/threads/$THREAD_ID/posts/$POST_ID/reactions" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER_2" \
  --data-binary '{"type":"LIKE"}')
if [[ "$reaction_status" != "201" ]]; then
  echo "add reaction failed (status $reaction_status)" >&2
  cat "$reaction_resp" >&2 || true
  exit 1
fi

log "DELETE /api/forums/:id/threads/:threadId/posts/:postId/reactions"
remove_reaction_status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/forums/$FORUM_ID/threads/$THREAD_ID/posts/$POST_ID/reactions" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER_2" \
  --data-binary '{"type":"LIKE"}')
if [[ "$remove_reaction_status" != "204" ]]; then
  echo "remove reaction failed (status $remove_reaction_status)" >&2
  exit 1
fi

log "PUT /api/forums/:id/threads/:threadId/posts/:postId"
update_post_resp="$WORKDIR/update-post.json"
update_post_status=$(curl -sS -o "$update_post_resp" -w "%{http_code}" -X PUT "$BASE_URL/api/forums/$FORUM_ID/threads/$THREAD_ID/posts/$POST_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER_2" \
  --data-binary '{"content":"Updated post content"}')
if [[ "$update_post_status" != "200" ]]; then
  echo "update post failed (status $update_post_status)" >&2
  cat "$update_post_resp" >&2 || true
  exit 1
fi

log "DELETE /api/forums/:id/threads/:threadId/posts/:postId"
delete_post_status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/forums/$FORUM_ID/threads/$THREAD_ID/posts/$POST_ID" \
  -H "$AUTH_HEADER_2")
if [[ "$delete_post_status" != "204" ]]; then
  echo "delete post failed (status $delete_post_status)" >&2
  exit 1
fi

log "PUT /api/forums/:id/threads/:threadId"
update_thread_resp="$WORKDIR/update-thread.json"
update_thread_status=$(curl -sS -o "$update_thread_resp" -w "%{http_code}" -X PUT "$BASE_URL/api/forums/$FORUM_ID/threads/$THREAD_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER_2" \
  --data-binary '{"title":"Curl Thread Updated"}')
if [[ "$update_thread_status" != "200" ]]; then
  echo "update thread failed (status $update_thread_status)" >&2
  cat "$update_thread_resp" >&2 || true
  exit 1
fi

log "DELETE /api/forums/:id/threads/:threadId"
delete_thread_status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/forums/$FORUM_ID/threads/$THREAD_ID" \
  -H "$AUTH_HEADER_2")
if [[ "$delete_thread_status" != "204" ]]; then
  echo "delete thread failed (status $delete_thread_status)" >&2
  exit 1
fi

log "POST /api/forums/:id/leave"
leave_status=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/forums/$FORUM_ID/leave" \
  -H "$AUTH_HEADER_2")
if [[ "$leave_status" != "204" ]]; then
  echo "leave forum failed (status $leave_status)" >&2
  exit 1
fi

log "DELETE /api/forums/:id (admin)"
delete_forum_status=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/api/forums/$FORUM_ID" \
  -H "$AUTH_HEADER")
if [[ "$delete_forum_status" != "204" ]]; then
  echo "delete forum failed (status $delete_forum_status)" >&2
  exit 1
fi

log "All curl checks passed"
