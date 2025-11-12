# Redis Setup Guide

Redis is configured in ShelfSpace for two primary purposes:
1. **Socket.IO Adapter** - Enables horizontal scaling of WebSocket connections across multiple chat-service instances
2. **Server-Side Caching** - Reduces database load by caching frequently accessed data

## Configuration

### Docker Compose

Redis is defined in `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  container_name: shelfspace-redis
  command: redis-server --appendonly yes
  volumes:
    - redis_data:/data
  ports:
    - "6379:6379"
  networks:
    - shelfspace-net
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
```

### Environment Variables

Services that use Redis should have `REDIS_URL` set:

```env
REDIS_URL=redis://redis:6379
```

This defaults to `redis://redis:6379` in the code if not provided.

## Socket.IO Redis Adapter

The chat-service uses Redis adapter to enable multi-instance Socket.IO:

**Location**: `services/chat-service/src/socket.ts`

**Features**:
- Enables horizontal scaling of chat-service
- Synchronizes Socket.IO events across instances
- Gracefully falls back to single-instance mode if Redis is unavailable

**Implementation**:
```typescript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
```

## Server-Side Caching

### User Service

The user-service implements Redis caching for:
- User profiles (`GET /api/users/me`)
- User preferences (`GET /api/users/me/preferences`)
- User stats (`GET /api/users/me/stats` - can be added)

**Cache Utilities**: `services/user-service/src/utils/cache.ts`

**Cache Keys**:
- `user:{userId}` - Full user profile (TTL: 5 minutes)
- `user:{userId}:preferences` - User preferences (TTL: 10 minutes)
- `user:{userId}:stats` - User statistics (TTL: 5 minutes)

**Cache Invalidation**:
- User updates invalidate user cache
- Preference updates invalidate both preferences and user cache

### Adding Caching to Other Services

To add caching to another service:

1. **Install Redis client**:
```bash
npm install redis
```

2. **Copy cache utilities**:
```bash
# Copy services/user-service/src/utils/cache.ts to your service
```

3. **Use in routes**:
```typescript
import * as cache from "../utils/cache.ts";

// Get from cache
const cached = await cache.get<Type>(cacheKey);
if (cached) return res.json(cached);

// Fetch from DB
const data = await prisma.model.findUnique(...);

// Set cache
await cache.set(cacheKey, data, { ttl: 300 });

// Invalidate on updates
await cache.del(cacheKey);
```

## Recommended Cache TTLs

- **User profiles**: 5 minutes (300s) - frequently accessed, occasionally updated
- **User preferences**: 10 minutes (600s) - rarely changed
- **Book data**: 30 minutes (1800s) - relatively static
- **Review data**: 5 minutes (300s) - frequently accessed, occasionally updated
- **Group data**: 10 minutes (600s) - moderately dynamic

## Monitoring

### Check Redis Health

```bash
docker exec -it shelfspace-redis redis-cli ping
# Should return: PONG
```

### View Redis Stats

```bash
docker exec -it shelfspace-redis redis-cli INFO stats
```

### Monitor Memory Usage

```bash
docker exec -it shelfspace-redis redis-cli INFO memory
```

### List All Keys

```bash
docker exec -it shelfspace-redis redis-cli KEYS "*"
```

### Clear All Cache (Development Only)

```bash
docker exec -it shelfspace-redis redis-cli FLUSHALL
```

## Troubleshooting

### Redis Connection Failed

If you see "Failed to initialize Redis adapter" in chat-service logs:
- Check Redis container is running: `docker ps | grep redis`
- Verify Redis health: `docker exec shelfspace-redis redis-cli ping`
- Check network connectivity: Services must be on `shelfspace-net`
- Service will continue without Redis adapter (single-instance mode)

### Cache Not Working

If caching isn't working:
- Verify Redis is running and accessible
- Check `REDIS_URL` environment variable is set correctly
- Look for errors in service logs
- Cache errors are logged but don't break the application (graceful degradation)

### High Memory Usage

If Redis memory usage is high:
- Review TTLs - ensure they're not too long
- Check for cache key leaks (use `KEYS "*"` to inspect)
- Consider setting `maxmemory` and `maxmemory-policy` in Redis config
- Monitor with `INFO memory` command

## Production Considerations

1. **Persistence**: Redis is configured with `--appendonly yes` for data persistence
2. **Memory Limits**: Set `maxmemory` policy for production
3. **Replication**: Consider Redis Sentinel or Redis Cluster for HA
4. **Monitoring**: Use Redis monitoring tools (RedisInsight, etc.)
5. **Security**: Bind Redis to internal network only, use password authentication

## Environment Variables

Add to `.env` files:

```env
REDIS_URL=redis://redis:6379
```

For production with password:
```env
REDIS_URL=redis://:password@redis:6379
```

