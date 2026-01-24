# User Service

Authentication and user management service for ShelfSpace.

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:migrate

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run service
npm run dev
```

## Documentation

📖 **[Complete Setup and Testing Guide](./SETUP_AND_TESTING_GUIDE.md)**

This comprehensive guide covers:
- Prerequisites and installation
- Database setup (PostgreSQL)
- Redis configuration
- Environment variables
- Running the service locally
- API testing with Newman
- Troubleshooting common issues

## Features

- ✅ User registration and authentication
- ✅ JWT token management
- ✅ User profile management
- ✅ User preferences
- ✅ User statistics tracking
- ✅ Admin operations
- ✅ Redis caching
- ✅ Input validation with Zod
- ✅ Comprehensive API tests

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT (jose)
- **Validation**: Zod
- **Testing**: Jest + Newman (Postman)

## API Endpoints

### Public Routes
- `POST /api/me` - Create/login user
- `GET /api/token/:userId` - Get token (dev only)

### Protected Routes
- `GET /api/me` - Get current user
- `PATCH /api/me` - Update profile
- `GET /api/me/preferences` - Get preferences
- `PUT /api/me/preferences` - Update preferences
- `GET /api/me/stats` - Get statistics

### Admin Routes
- `PUT /api/users/:userId/status` - Update user status
- `PUT /api/users/:userId/preferences/reset` - Reset preferences

## Testing

```bash
# Unit tests
npm test

# API tests with Newman
./run-newman-tests.sh --html
```

## Environment Variables

Required variables in `.env`:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key-min-32-chars"
ADMIN_EMAILS="admin@example.com"
PORT=3001
```

See [SETUP_AND_TESTING_GUIDE.md](./SETUP_AND_TESTING_GUIDE.md) for detailed configuration.

## Development

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production
npm start

# Database management
npm run db:studio
npm run db:migrate
```

## Project Structure

```
src/
├── index.ts              # Application entry point
├── routes/
│   ├── user.routes.ts    # User endpoints
│   ├── auth.routes.ts    # Auth endpoints
│   └── token.routes.ts   # Token generation
├── middlewares/
│   ├── auth.ts           # JWT authentication
│   ├── isAdmin.ts        # Admin authorization
│   └── validate.ts       # Request validation
├── schemas.ts            # Zod validation schemas
├── prisma.ts             # Prisma client
└── utils/
    └── cache.ts          # Redis caching utilities
```

## License

ISC
