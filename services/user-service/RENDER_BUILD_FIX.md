# Render Build Fix - User Service

## Issue Fixed ✅

The build was failing on Render with errors like:
```
error TS7016: Could not find a declaration file for module 'express'
error TS2580: Cannot find name 'process'
```

## Root Cause

Render's production build runs `npm install` which by default doesn't install `devDependencies`. TypeScript and type definitions were in `devDependencies`, causing the build to fail.

## Solution Applied

Moved build-time dependencies from `devDependencies` to `dependencies`:

- `typescript` - Required to compile TypeScript
- `prisma` - Required to generate Prisma client
- `@types/node` - Node.js type definitions
- `@types/express` - Express type definitions
- `@types/cors` - CORS type definitions
- `@types/morgan` - Morgan type definitions
- `@types/bcrypt` - Bcrypt type definitions
- `@types/jsonwebtoken` - JWT type definitions

## What Changed

**Before:**
```json
{
  "dependencies": {
    "express": "^5.1.0",
    // ... other runtime deps
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "prisma": "^6.15.0",
    "@types/node": "^24.0.7",
    "@types/express": "^5.0.3"
    // ... other type definitions
  }
}
```

**After:**
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "typescript": "^5.8.3",
    "prisma": "^6.15.0",
    "@types/node": "^24.0.7",
    "@types/express": "^5.0.3"
    // ... all build-time deps
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2"
    // ... only test-related deps
  }
}
```

## Verification

Build now works in production mode:
```bash
npm install --production
npm run build
# ✅ Success!
```

## Deploy to Render

1. **Commit the changes:**
   ```bash
   git add services/user-service/package.json
   git commit -m "fix: move build dependencies to production deps for Render"
   git push origin main
   ```

2. **Render will automatically:**
   - Detect the push
   - Start a new deployment
   - Install dependencies (now including TypeScript)
   - Build successfully
   - Start the service

3. **Monitor the deployment:**
   - Go to Render Dashboard
   - Click on your service
   - Watch the "Logs" tab
   - Look for "Build succeeded" message

## Expected Build Output

```
==> Running build command 'npm install && npm run build'...
✔ Generated Prisma Client
added 176 packages
✔ Generated Prisma Client
[TypeScript compilation succeeds]
==> Build succeeded 🎉
```

## If Build Still Fails

### Option 1: Clear Build Cache
1. Go to Render Dashboard
2. Click on your service
3. Settings → "Clear build cache & deploy"

### Option 2: Manual Redeploy
1. Go to "Manual Deploy"
2. Click "Deploy latest commit"

### Option 3: Check Environment Variables
Make sure these are set:
- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL` or `UPSTASH_REDIS_URL`
- `NODE_ENV=production`

## Cost Impact

Moving these packages to `dependencies` adds ~15MB to the deployment size, but this is necessary for the build to work. The runtime performance is not affected.

## Alternative Approach (Not Recommended)

If you want to keep dependencies in `devDependencies`, you can change the build command to:

```bash
npm install --include=dev && npm run build
```

However, this is not recommended because:
- It installs unnecessary test dependencies in production
- Increases deployment size unnecessarily
- The current solution is cleaner

## Summary

✅ Build dependencies moved to `dependencies`  
✅ Build works in production mode  
✅ Ready to deploy to Render  
✅ No code changes required  
✅ Only `package.json` modified  

The service should now deploy successfully on Render!
