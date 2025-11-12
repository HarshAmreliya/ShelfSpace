# Security Audit Report - ShelfSpace

**Audit Date:** 2025-11-10
**Auditor:** Security Review
**Project:** ShelfSpace Book Tracking Application

---

## Executive Summary

This security audit identified **2 CRITICAL**, **3 HIGH**, and **2 MEDIUM** severity vulnerabilities in the ShelfSpace application. The most severe issues involve an **admin authorization bypass** and **CORS misconfiguration** that could allow unauthorized access to administrative functions and enable cross-origin attacks.

---

## Critical Vulnerabilities

### 1. Admin Authorization Bypass ⚠️ CRITICAL
**File:** `services/user-service/src/middlewares/isAdmin.ts:22`

**Issue:**
```typescript
if (user && (adminEmails.includes(user.email) || user.status === "ACTIVE")) {
```

The isAdmin middleware incorrectly grants admin privileges to **ANY user with ACTIVE status**, not just those in the ADMIN_EMAILS list. The logical OR operator should be AND, or the status check should be removed entirely.

**Impact:** Any authenticated user can access admin-only endpoints and perform privileged operations.

**Fix:**
```typescript
// Option 1: Remove status check entirely
if (user && adminEmails.includes(user.email)) {
  next();
}

// Option 2: Add a dedicated role field to User model
if (user && (user.role === "ADMIN" || adminEmails.includes(user.email))) {
  next();
}
```

**Recommendation:** Add a `role` enum field to the User model with values like ADMIN, USER, MODERATOR.

---

### 2. CORS Misconfiguration Allows All Origins ⚠️ CRITICAL
**Files:**
- `services/user-service/src/index.ts:13`
- `services/book-service/src/index.ts`
- `services/review-service/src/index.ts`
- `services/admin-service/src/index.ts`
- `services/group-service/src/index.ts`
- `services/user-library-service/src/index.ts`

**Issue:**
```typescript
app.use(cors());
```

Using `cors()` without configuration allows **ANY origin** to make requests to your API, enabling cross-site attacks.

**Impact:**
- CSRF attacks from malicious websites
- Data theft through unauthorized cross-origin requests
- Session hijacking

**Fix:**
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Note:** `chat-service/src/socket.ts` correctly implements CORS for Socket.IO. Apply the same pattern to all services.

---

## High Severity Vulnerabilities

### 3. NoSQL Injection via Unsanitized Regex 🔴 HIGH
**File:** `services/book-service/src/controllers/book.controller.ts:29,38-40`

**Issue:**
```typescript
matchConditions["authors.name"] = { $regex: author, $options: "i" };
matchConditions.$or = [
  { title: { $regex: search, $options: "i" } },
  { "authors.name": { $regex: search, $options: "i" } },
  { description: { $regex: search, $options: "i" } },
];
```

User input is directly used in MongoDB `$regex` queries without sanitization.

**Impact:**
- ReDoS (Regular Expression Denial of Service) attacks
- Potential NoSQL injection
- Application crashes or severe performance degradation

**Fix:**
```typescript
// Escape special regex characters
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Then use it
if (author && typeof author === 'string') {
  matchConditions["authors.name"] = {
    $regex: escapeRegex(author),
    $options: "i"
  };
}
```

---

### 4. Weak Default Credentials in Docker Compose 🔴 HIGH
**File:** `docker-compose.yml:13-14,40`

**Issue:**
```yaml
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-shelfspace_dev_pass}
MONGO_PASSWORD: ${MONGO_PASSWORD:-shelfspace_dev_pass}
```

Weak default passwords are used as fallbacks.

**Impact:** If deployed without setting environment variables, databases use predictable credentials.

**Fix:**
- Remove default values for production
- Require all sensitive environment variables to be explicitly set
- Add validation script to check for required env vars before deployment

```yaml
# For development only
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
```

---

### 5. Missing Security Headers 🔴 HIGH
**Files:** All service index files

**Issue:** No security middleware (like Helmet) is configured to set essential security headers.

**Missing Headers:**
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- Strict-Transport-Security (HTTPS enforcement)
- X-XSS-Protection

**Fix:**
```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: false, // Managed by Next.js for frontend
  crossOriginEmbedderPolicy: false
}));
```

---

## Medium Severity Issues

### 6. Overly Permissive CSP in Development 🟡 MEDIUM
**File:** `frontend/next.config.ts:14`

**Issue:**
```typescript
script-src 'self' 'unsafe-eval' 'unsafe-inline'
```

Development CSP allows `unsafe-eval` and `unsafe-inline` which defeats XSS protection.

**Impact:** While acceptable for development, if accidentally deployed to production, it significantly weakens XSS defenses.

**Fix:** Use environment variables to strictly separate dev and prod CSP policies, and add CI checks to ensure production CSP is strict.

---

### 7. Missing CSRF Protection 🟡 MEDIUM

**Issue:** No CSRF token validation for state-changing operations (POST, PUT, DELETE).

**Impact:** While CORS helps, additional CSRF protection is recommended for defense in depth.

**Fix (for production):**
```bash
npm install csurf
```

```typescript
import csrf from 'csurf';
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
```

Or use SameSite cookies:
```typescript
// In your JWT/session cookie settings
sameSite: 'strict',
secure: true, // Only send over HTTPS
httpOnly: true
```

---

## Positive Security Findings ✅

1. **✅ Secrets Management:**
   - `.env` files properly gitignored
   - No `.env` files in git history
   - `.env.example` files provided with placeholder values

2. **✅ SQL Injection Protection:**
   - Prisma ORM used for PostgreSQL (parameterized queries)
   - No raw SQL queries found

3. **✅ Authentication:**
   - JWT properly implemented with jose library
   - Token expiration set (6 hours)
   - Bearer token authentication
   - Socket.IO authentication middleware

4. **✅ Password Hashing:**
   - bcrypt library used (package.json)

5. **✅ Input Validation:**
   - Zod schemas for request validation
   - Validation middleware implemented
   - Type-safe validation across services

6. **✅ Rate Limiting:**
   - Nginx configured with rate limiting (10 req/s, burst 20)
   - Applied to all API endpoints

7. **✅ XSS Prevention:**
   - React's default XSS protection (auto-escaping)
   - Only one use of `dangerouslySetInnerHTML` for JSON-LD (safe)
   - No `eval()` or `document.write()` usage

8. **✅ Socket.IO Security:**
   - Proper CORS configuration with allowed origins
   - Authentication middleware
   - Group membership verification before message sending

---

## Risk Assessment

| Severity | Count | Priority |
|----------|-------|----------|
| Critical | 2 | **Immediate Fix Required** |
| High | 3 | **Fix Before Production** |
| Medium | 2 | **Fix in Next Sprint** |

---

## Recommendations Priority

### Immediate Actions (Before Production Deploy)
1. **Fix admin authorization bypass** in `isAdmin` middleware
2. **Configure CORS properly** on all services
3. **Sanitize regex inputs** in book-service
4. **Add Helmet middleware** for security headers
5. **Remove weak default passwords** from docker-compose

### Short-term (Next 2 weeks)
1. Add CSRF protection or enforce strict SameSite cookies
2. Create separate CSP policies for dev/prod
3. Add role-based access control (RBAC) with User roles
4. Implement security headers in Nginx as well
5. Add security linting (eslint-plugin-security)

### Long-term Security Improvements
1. Implement Web Application Firewall (WAF)
2. Add API request signing
3. Implement audit logging for sensitive operations
4. Add penetration testing to CI/CD pipeline
5. Set up security monitoring and alerting
6. Implement API versioning with deprecation strategy
7. Add input sanitization library (DOMPurify for any HTML)
8. Implement rate limiting per user (not just per IP)

---

## Additional Security Best Practices

### Environment Variables
- Never commit `.env` files (✅ Already done)
- Use secret management services (AWS Secrets Manager, Vault) for production
- Rotate secrets regularly
- Use different credentials for dev/staging/prod

### Database Security
- Use connection pooling with max connection limits
- Enable SSL/TLS for database connections in production
- Implement database query logging for sensitive tables
- Regular security patches for PostgreSQL and MongoDB

### Monitoring & Logging
- Implement centralized logging (ELK Stack, Loki)
- Log all authentication attempts
- Monitor for unusual patterns (failed auth, rate limit hits)
- Set up alerts for security events

### Docker Security
- Use non-root users in Dockerfiles
- Scan images for vulnerabilities (Trivy, Snyk)
- Use minimal base images (alpine)
- Implement read-only file systems where possible

---

## Conclusion

The ShelfSpace application has a solid security foundation with proper use of Prisma ORM, Zod validation, JWT authentication, and rate limiting. However, the **critical admin authorization bypass** and **CORS misconfiguration** must be addressed immediately before any production deployment.

After implementing the recommended fixes, the application will have robust protection against common web vulnerabilities including XSS, SQL injection, and DDoS attacks.

---

## Security Testing Checklist

- [ ] Fix admin authorization logic
- [ ] Configure CORS on all services
- [ ] Sanitize MongoDB regex queries
- [ ] Add Helmet middleware
- [ ] Remove/secure default credentials
- [ ] Test CSRF protection
- [ ] Verify CSP in production mode
- [ ] Run OWASP ZAP scan
- [ ] Perform manual penetration testing
- [ ] Security code review by second engineer
- [ ] Update security documentation

---

**Report End**

For questions or clarifications, please refer to:
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
