# Prisma Migration Guide

This document outlines the Prisma migration workflow for all ShelfSpace microservices.

## Services Using Prisma

The following services use Prisma ORM with PostgreSQL:

- **user-service** (port 3001)
- **review-service** (port 3002)
- **user-library-service** (port 3003)
- **group-service** (port 3005)
- **chat-service** (port 3006)
- **admin-service** (port 3007)

## Migration Workflow

### Development

1. **Make schema changes** in `prisma/schema.prisma`
2. **Create migration:**
   ```bash
   cd services/<service-name>
   npm run db:migrate
   ```
   This will:
   - Generate SQL migration files in `prisma/migrations/`
   - Apply the migration to your development database
   - Regenerate Prisma Client

3. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

### Production/Staging

1. **Run migrations on deployment:**
   ```bash
   cd services/<service-name>
   npx prisma migrate deploy
   ```

2. **Or using npm script (if added):**
   ```bash
   npm run db:deploy
   ```

## Service-Specific Notes

### User Service
- Has existing migrations in `prisma/migrations/`
- Schema includes: User, Preferences, UserStats, UserGoal, UserBadge

### Review Service
- Has initial migration: `20250814071600_init`
- Schema includes: Review model

### User Library Service
- **NEW SERVICE** - Needs initial migration
- Schema includes: ReadingList, ReadingListBook
- To create initial migration:
  ```bash
  cd services/user-library-service
  npm run db:migrate -- --name init
  ```

### Group Service
- Check for existing migrations or create initial migration

### Chat Service
- Check for existing migrations or create initial migration

### Admin Service
- Check for existing migrations or create initial migration

## Migration Best Practices

1. **Never delete migration files** - They represent the history of your database schema
2. **Always test migrations** in development before deploying
3. **Use descriptive migration names:**
   ```bash
   npm run db:migrate -- --name add_user_avatar_field
   ```
4. **Commit migrations** to version control alongside schema changes
5. **Review generated SQL** before applying in production

## Docker Compose Integration

Migrations can be run manually after services start, or you can add an init container:

```yaml
migration-job:
  build: ./services/<service-name>
  command: npx prisma migrate deploy
  depends_on:
    postgres:
      condition: service_healthy
  environment:
    DATABASE_URL: ${DATABASE_URL}
```

## Troubleshooting

### Migration Conflicts
If you have schema drift, use:
```bash
npx prisma migrate reset  # ⚠️ DROPS ALL DATA - dev only
```

### Reset Development Database
```bash
npx prisma migrate reset
```

### Generate Client Without Migration
```bash
npm run db:generate
```

## Schema Files Location

All Prisma schemas are located at:
- `services/<service-name>/prisma/schema.prisma`

## Migration Files Location

All migration SQL files are located at:
- `services/<service-name>/prisma/migrations/<timestamp>_<name>/migration.sql`

