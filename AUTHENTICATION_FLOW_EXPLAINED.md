# Authentication Flow - How It Works

## The Complete Flow

### 1. User Signs In with Google

When a user clicks "Sign in with Google" on the login page:

```
User → Login Page → NextAuth → Google OAuth → NextAuth Callback
```

### 2. NextAuth JWT Callback (User Service Integration)

In `frontend/src/app/api/auth/[...nextauth]/route.ts`, the JWT callback:

```typescript
async jwt({ token, user, account }) {
  if (account && user) {
    // Call User Service to create or find user
    const userData = await userService.createUser({
      email: user.email!,
      name: user.name || user.email!.split('@')[0] || 'User',
    });
    
    // Store flags in token
    token['isNewUser'] = userData.isNewUser;
    token['needsPreferences'] = userData.needsPreferences;
  }
}
```

### 3. User Service Logic (Backend)

The User Service `/api/me` endpoint (POST) does this:

```typescript
// Check if user exists
const existingUser = await prisma.user.findUnique({
  where: { email: data.email },
  include: { preferences: true }
});

if (existingUser) {
  // ✅ EXISTING USER - Return with flags
  return {
    token: jwt_token,
    user: existingUser,
    isNewUser: false,  // ← User already exists
    needsPreferences: !existingUser.preferences  // ← Check if they have preferences
  };
}

// ❌ NEW USER - Create and return
const newUser = await prisma.user.create({ data });
return {
  token: jwt_token,
  user: newUser,
  isNewUser: true,  // ← Brand new user
  needsPreferences: true  // ← Definitely needs preferences
};
```

### 4. Login Page Redirect Logic

In `frontend/src/app/login/page.tsx`:

```typescript
useEffect(() => {
  if (status === "authenticated" && session) {
    // Check the flags from User Service
    if (session.isNewUser || session.needsPreferences) {
      router.push("/onboarding");  // ← Needs setup
    } else {
      router.push(callbackUrl);  // ← Ready to go
    }
  }
}, [status, session, router, callbackUrl]);
```

### 5. Middleware Protection

In `frontend/src/middleware.ts`:

```typescript
// If user needs onboarding, force them there
if (token['isNewUser'] || token['needsPreferences']) {
  if (!pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }
}

// If user completed onboarding, don't let them back
if (pathname.startsWith("/onboarding") && 
    !token['isNewUser'] && 
    !token['needsPreferences']) {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
```

---

## Scenarios

### Scenario 1: Brand New User (First Time Sign In)

```
1. User signs in with Google
2. User Service creates new user in database
3. Returns: { isNewUser: true, needsPreferences: true }
4. Login page redirects to /onboarding
5. User completes 3-step wizard
6. Preferences saved to User Service
7. Session updated: { isNewUser: false, needsPreferences: false }
8. Redirected to /dashboard
```

### Scenario 2: Existing User (Has Preferences)

```
1. User signs in with Google
2. User Service finds existing user with preferences
3. Returns: { isNewUser: false, needsPreferences: false }
4. Login page redirects directly to /dashboard
5. ✅ User is in!
```

### Scenario 3: Existing User (No Preferences)

This can happen if:
- User was created by admin
- Preferences were deleted
- Database was reset but user record remained

```
1. User signs in with Google
2. User Service finds existing user WITHOUT preferences
3. Returns: { isNewUser: false, needsPreferences: true }
4. Login page redirects to /onboarding
5. User sets preferences
6. Session updated: { needsPreferences: false }
7. Redirected to /dashboard
```

---

## Key Points

### ✅ User Service is the Source of Truth

The User Service determines:
- Whether the user exists (`isNewUser`)
- Whether they have preferences (`needsPreferences`)

The frontend just follows these flags.

### ✅ No Duplicate Users

The User Service checks by email:
```typescript
const existingUser = await prisma.user.findUnique({
  where: { email: data.email }
});
```

If the email exists, it returns the existing user. No duplicates!

### ✅ Automatic Preference Check

The User Service includes preferences in the query:
```typescript
include: { preferences: true }
```

Then checks:
```typescript
needsPreferences: !existingUser.preferences
```

If `preferences` is null/undefined, user needs to set them up.

### ✅ Session Updates After Onboarding

When onboarding completes:
```typescript
await update({
  ...session,
  isNewUser: false,
  needsPreferences: false,
});
```

This updates the NextAuth session so middleware knows the user is ready.

---

## Testing the Flow

### Test 1: New User
```bash
# 1. Clear database
cd services/user-service
npx prisma studio
# Delete all users

# 2. Sign in with Google
# Expected: Redirect to /onboarding

# 3. Complete onboarding
# Expected: Redirect to /dashboard

# 4. Sign out and sign in again
# Expected: Redirect directly to /dashboard
```

### Test 2: Existing User
```bash
# 1. Sign in (user already exists from Test 1)
# Expected: Redirect directly to /dashboard
```

### Test 3: User Without Preferences
```bash
# 1. In Prisma Studio, delete user's preferences
cd services/user-service
npx prisma studio
# Find user → Delete their preferences record

# 2. Sign out and sign in again
# Expected: Redirect to /onboarding

# 3. Complete onboarding
# Expected: Redirect to /dashboard
```

---

## Summary

**The system already checks if the user exists!**

- ✅ User Service checks database for existing user by email
- ✅ Returns `isNewUser: false` for existing users
- ✅ Returns `needsPreferences: true/false` based on database state
- ✅ Frontend redirects based on these flags
- ✅ Middleware enforces the rules

**No changes needed** - the implementation is already correct! 🎉
