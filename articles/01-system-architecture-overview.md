# ShelfSpace System Architecture Overview

ShelfSpace is built as a microservices platform with a Next.js frontend, an NGINX API gateway, and domain-focused backend services.

## High-Level Components

- **Frontend (`frontend`)**: Next.js App Router UI and client-side orchestration.
- **API Gateway (`api-gateway`)**: NGINX reverse proxy and route-based traffic distribution.
- **Domain Services (`services/*`)**:
  - `user-service`
  - `user-library-service`
  - `book-service`
  - `review-service`
  - `forum-service`
  - `chat-service`
  - `admin-service`
  - `analytics-service`
  - `chatbot-service` (Python)

## Data Layer

- **PostgreSQL + Prisma**: user, library, review, forum, chat, admin services
- **MongoDB**: book catalog and analytics read model
- **Redis**: chat and selective cache-oriented flows

## Core Architectural Pattern

The architecture follows **service-per-domain boundaries** with an API gateway in front. Each service owns its own schema and behavior, and cross-service coordination happens via HTTP calls plus analytics event emission.

## Why This Shape Works

- Teams can evolve services independently.
- Domain ownership is explicit.
- Gateway provides a consistent client entry point.
- Analytics is centralized but fed by all domains.
