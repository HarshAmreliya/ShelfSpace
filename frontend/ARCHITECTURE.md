# Frontend Architecture Guide

## Purpose
This document explains how the ShelfSpace frontend is structured, how data moves through the app, and where to add or modify behavior safely.

Related ADRs:
- `docs/adr/0001-layer-contracts.md`
- `docs/adr/0002-standardized-query-behavior.md`
- `docs/adr/0003-feature-decomposition.md`

## Runtime Stack
- Framework: Next.js App Router (`frontend/src/app`)
- Language: TypeScript (`.ts`/`.tsx`)
- State: React hooks + context
- Auth: NextAuth session + bearer token forwarding
- Data: Service wrappers in `frontend/src/lib` and `frontend/src/services`

## Directory Overview
- `src/app`: route entrypoints and route-level API handlers
- `src/components`: feature UI and reusable UI primitives
- `src/contexts`: app-wide providers and shared state containers
- `src/hooks`: stateful composition hooks
- `src/lib`: low-level API clients and service-specific wrappers
- `src/services`: domain service facades (higher-level business operations)
- `src/utils`: diagnostics, validation, formatting, accessibility helpers
- `src/types`: shared type contracts

## Request/Data Flow
1. UI component triggers an action (button click, form submit, filter change).
2. Component calls a hook action (for example, `useLibraryState` action).
3. Hook delegates to a service (`libraryService`, `userApi`, etc.).
4. Service uses configured API client (`lib/api.ts` or feature client).
5. API client injects auth token and normalizes errors.
6. Service maps backend payloads into frontend-friendly shapes.
7. Hook updates local UI state and derived values.
8. Component re-renders from updated state.

## Core Modules

### App Context (`src/contexts/AppContext.tsx`)
Responsibilities:
- Holds app-global state: authenticated user, theme, preferences, loading/error status.
- Synchronizes NextAuth session into context state.
- Exposes stable action methods (`setTheme`, `signOut`, etc.).

Important behavior:
- Reducer is intentionally pure.
- DOM theme toggles by changing root `dark` class.
- Token-expired session error triggers exactly one sign-out sequence.

### API Client (`src/lib/api.ts`)
Responsibilities:
- Creates Axios instances with consistent behavior.
- Injects bearer token from NextAuth session on each request.
- Intercepts `401` responses and routes user to login.
- Enriches errors with user-facing message text.

### User API Wrapper (`src/lib/user-api.ts`)
Responsibilities:
- Encapsulates profile/preferences/stats/admin endpoints.
- Keeps route paths and headers centralized.
- Throws normalized `Error` messages from backend/network failures.

### Library Service (`src/services/libraryService.ts`)
Responsibilities:
- High-level library domain operations (books, reading lists, move/add/remove books).
- Converts between frontend and backend payload shapes.
- Applies optional in-memory filtering/sorting to support consistent UI behavior.
- Maps backend failures into domain errors.

Error types used by service:
- `ValidationError`: invalid inputs before or during request
- `NotFoundError`: requested entity does not exist
- `ConflictError`: duplicate/conflicting write operation
- `ServiceError`: generic transport or backend failure

### Error Logger (`src/utils/errorLogger.ts`)
Responsibilities:
- Capture errors as structured reports.
- Keep breadcrumb trail of recent actions/events.
- Emit logs to console in development.
- Optionally ship logs to remote endpoint in production.
- Register global listeners (`error`, `unhandledrejection`).

## Feature Module Notes

### Dashboard Feature
Primary file: `src/components/dashboard/DashboardFeature.tsx`
- Composes analytics summary, onboarding state, and section components.
- Handles first-time preference onboarding modal behavior.
- Uses `useDashboardSummary` as main data source for aggregate stats.

### Library Feature
Primary files:
- `src/components/library/LibraryFeature.tsx`
- `src/hooks/library/useLibraryState.ts`
- `src/services/libraryService.ts`

Behavior:
- URL params can seed initial list/view/filter state.
- Local selection/filter state is kept in hook state.
- List/book persistence actions are delegated to `libraryService`.

### Forums Feature
Primary files:
- `src/components/forums/ForumsFeature.tsx`
- `src/components/forums/ForumFeature.tsx`
- `src/hooks/data/useForums.ts`
- `src/hooks/data/useForumThreads.ts`
- `src/hooks/data/useForumPosts.ts`

Behavior:
- DTO-to-view-model mapping is performed near UI entry points.
- Membership and admin actions are performed through dedicated hooks.
- Thread/post operations keep local state updated after mutations.

Data hooks involved:
- `useForums` for forum collection + join/leave/create/update/delete.
- `useForumThreads` for thread-level CRUD in a forum.
- `useForumPosts` for post-level CRUD/reactions in a thread.

### Chat Feature
Primary files:
- `src/components/chat/ChatFeature.tsx`
- `src/components/chat/ChatFeatureWithSessions.tsx`
- `src/hooks/chat/useChatState.ts`
- `src/hooks/chat/useChatSessions.ts`

Behavior:
- `ChatFeature` is optimized for single-session conversational flow.
- `ChatFeatureWithSessions` adds session lifecycle controls and history management.
- Message rendering supports markdown and role-based styling.

### Service Wrappers (`src/lib/*`)
Key wrappers:
- `book-service.ts`: backend-to-frontend book transformation and list/search/detail queries.
- `forum-service.ts`: forum/thread/post/membership endpoints with `ForumServiceError`.
- `chat-service.ts`: chat sessions + chatbot round-trip + best-effort message persistence.
- `review-service.ts`: review CRUD/list operations with `ReviewServiceError`.
- `analytics-service.ts`: dashboard analytics read endpoints.

Guideline:
- Keep endpoint URLs and transport concerns in wrappers.
- Convert/normalize backend payloads before exposing to hooks/components.
- Throw domain-relevant service errors instead of raw Axios errors.

## State Management Conventions
- Keep persistent/cross-feature state in context providers.
- Keep feature-local orchestration in custom hooks.
- Keep reducer logic pure and side effects in hooks/callbacks.
- Prefer deriving data with `useMemo` over duplicating state.

## Service/Networking Conventions
- Do not call Axios directly from components.
- Put transport details in `lib/*` wrappers.
- Put business-level operations and transformations in `services/*`.
- Always normalize backend response shape before exposing to UI.

## Layer Contract Summary
- `components` should not own transport logic.
- `hooks` should orchestrate feature behavior, not define endpoint contracts.
- `lib` wrappers should be the only layer directly aware of endpoint URL semantics.
- `services` should compose/transform domain data, not render UI.

## Documentation Conventions
- JSDoc on exported functions/classes/interfaces.
- Inline comments on non-obvious decision points.
- Mention side effects explicitly (network calls, DOM changes, auth/session interactions).
- Keep comments focused on "why" and "flow", not obvious syntax.

## Where To Add New Logic
- New route page: `src/app/.../page.tsx`
- New shared UI primitive: `src/components/ui`
- New feature hook: `src/hooks/<feature>`
- New backend endpoint wrapper: `src/lib/<service>-api.ts`
- New domain operation: `src/services/<domain>Service.ts`
- New app-wide shared state: `src/contexts`

## Quick Debug Checklist
- Is auth token attached? Check `src/lib/api.ts` interceptor.
- Are response shapes normalized? Check service layer mapping.
- Is UI state duplicated? Prefer derived values from source state.
- Are errors swallowed? Ensure service throws typed/domain errors.
- Is a side effect in reducer? Move it to effect/callback.
