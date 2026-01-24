# NextAuth + User Service Integration

## Overview
Complete integration between NextAuth authentication and the User Service microservice with automatic user creation, token management, and smart routing.

## Implementation Summary

### ✅ What's Been Implemented

1. **User Creation on Sign In** (`frontend/src/app/api/auth/[...nextauth]/route.ts`)
   - When a user signs in with Google, their details are automatically saved to the User Service
   - Returns JWT token, user data, and flags (`isNewUser`, `needsPreferences`)
   - Token and user data stored in NextAuth session

2. **Smart Redirect Logic** (`frontend/src/app/login/page.tsx`)
   - New users → redirected to `/onboarding`
   - Users without preferences → redirected to `/onboarding`
   - Existing users with preferences → redirected to `/dashboard`

3. **Route Protection** (`frontend/src/middleware.ts`)
   - Unauthenticated users → redirected to `/login`
   - New users trying to access dashboard → redirected to `/onboarding`
   - Completed users trying to access onboarding → redirected to `/dashboard`

4. **User Context Management** (`frontend/src/contexts/AppContext.tsx`)
   - Automatically syncs user from NextAuth session
   - Sets User Service token for API calls
   - Updates user state when session changes

5. **Onboarding Flow** (`frontend/src/app/onboarding/page.tsx`)
   - 3-step wizard: Profile → Preferences → Interests
   - Updates user profile and preferences in User Service
   - Marks onboarding as complete in session
   - Redirects to dashboard

## Authentication Flow

```
User clicks "Sign in with Google"
  ↓
NextAuth handles Google OAuth
  ↓
JWT callback creates/finds user in User Service
  ↓
Session includes: token, userId, isNewUser, needsPreferences
  ↓
Login page checks session flags
  ↓
├─ isNewUser or needsPreferences? → /onboarding
└─ else → /dashboard
```

## Files Modified/Created

- ✅ `frontend/src/app/api/auth/[...nextauth]/route.ts` - User Service integration
- ✅ `frontend/src/app/login/page.tsx` - Smart redirect logic
- ✅ `frontend/src/middleware.ts` - Route protection (NEW)
- ✅ `frontend/src/contexts/AppContext.tsx` - User sync from session
- ✅ `frontend/src/app/onboarding/page.tsx` - Onboarding wizard (NEW)
- ✅ `frontend/types/next-auth.d.ts` - Extended session types
- ✅ `frontend/src/lib/user-service.ts` - Token management (already had methods)

## Testing the Flow

1. **New User Sign In:**
   ```
   Visit /login → Sign in with Google → Redirected to /onboarding
   Complete onboarding → Redirected to /dashboard
   ```

2. **Existing User Sign In:**
   ```
   Visit /login → Sign in with Google → Redirected to /dashboard
   ```

3. **Protected Routes:**
   ```
   Try to access /dashboard without auth → Redirected to /login
   Try to access /onboarding after completion → Redirected to /dashboard
   ```

## Environment Variables Required

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Next Steps

- Test the complete flow with both new and existing users
- Verify User Service API endpoints are working
- Ensure Google OAuth credentials are configured
- Test route protection and redirects
