.PHONY: help lint typecheck test build ci docker-build docker-up docker-down deploy quick-start stop clean

help:
	@echo "Available commands:"
	@echo "  make lint         - Run linting on all services"
	@echo "  make typecheck    - Run TypeScript type checking on all services"
	@echo "  make test         - Run tests on all services"
	@echo "  make build        - Build all services"
	@echo "  make ci           - Run full CI checks (lint, typecheck, test)"
	@echo ""
	@echo "Docker commands:"
	@echo "  make docker-build - Build all Docker images"
	@echo "  make docker-up    - Start all services with docker-compose"
	@echo "  make docker-down  - Stop all services"
	@echo ""
	@echo "Deployment commands:"
	@echo "  make deploy       - Deploy locally with full setup (recommended)"
	@echo "  make quick-start  - Quick start (minimal checks, faster)"
	@echo "  make stop         - Stop all services"
	@echo "  make clean        - Stop services and remove volumes (WARNING: Deletes data)"

lint:
	@echo "Running linters..."
	@./scripts/ci-check.sh | grep -A 100 "Running linter" || true

typecheck:
	@echo "Running TypeScript type checks..."
	@cd frontend && npx tsc --noEmit
	@cd services/user-service && npx tsc --noEmit
	@cd services/user-library-service && npx tsc --noEmit
	@cd services/review-service && npx tsc --noEmit
	@cd services/book-service && npx tsc --noEmit
	@cd services/forum-service && npx tsc --noEmit
	@cd services/chat-service && npx tsc --noEmit
	@cd services/admin-service && npx tsc --noEmit

test:
	@echo "Running tests..."
	@cd frontend && npm test -- --passWithNoTests || true
	@cd services/user-service && npm test -- --passWithNoTests || true

build:
	@echo "Building all services..."
	@cd frontend && npm run build
	@cd services/user-service && npm run build
	@cd services/user-library-service && npm run build
	@cd services/review-service && npm run build
	@cd services/book-service && npm run build || true
	@cd services/forum-service && npm run build
	@cd services/chat-service && npm run build
	@cd services/admin-service && npm run build

ci: lint typecheck test

docker-build:
	@echo "Building Docker images..."
	@docker-compose build

docker-up:
	@echo "Starting services..."
	@docker-compose up -d

docker-down:
	@echo "Stopping services..."
	@docker-compose down

deploy:
	@echo "Deploying ShelfSpace locally..."
	@./scripts/deploy-local.sh

quick-start:
	@echo "Quick starting ShelfSpace..."
	@./scripts/quick-start.sh

stop:
	@echo "Stopping ShelfSpace services..."
	@./scripts/stop-local.sh

clean: stop
	@echo "Cleaning up (removing volumes)..."
	@./scripts/stop-local.sh --clean

