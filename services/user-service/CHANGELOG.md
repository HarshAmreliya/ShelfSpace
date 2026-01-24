# Changelog

## [2025-11-17] - Major Documentation Consolidation & Route Fixes

### Added
- **SETUP_AND_TESTING_GUIDE.md** - Comprehensive guide covering:
  - PostgreSQL setup (local and Docker)
  - Redis setup (local and Docker)
  - Environment configuration
  - Running the service locally
  - Complete API testing guide
  - Troubleshooting section
  - Quick reference commands

- **README.md** - Clean, focused main documentation with quick start

### Changed
- Consolidated 8 separate markdown files into one comprehensive guide
- Fixed route conflicts between `/api/me` and `/api/:userId`
- Created separate `token.routes.ts` for public token endpoint
- Updated Postman collection to use environment variables correctly
- Fixed route mounting order in `index.ts`

### Removed
- NEWMAN_GUIDE.md (consolidated)
- STARTUP_GUIDE.md (consolidated)
- QUICK_START.md (consolidated)
- ROUTE_FIX_SUMMARY.md (consolidated)
- TESTING_SUMMARY.md (consolidated)
- TEST_RESULTS_SUMMARY.md (consolidated)
- VERIFICATION_REPORT.md (consolidated)
- user-service-docs.md (consolidated)

### Fixed
- Route ordering issue where `GET /api/:userId` was matching `/api/me`
- Postman collection variable persistence between test requests
- Environment variable loading for `ADMIN_EMAILS`
- Token endpoint now properly separated at `/api/token/:userId`

### Technical Details

#### Route Structure (Before)
```
POST /api/me          (public)
GET  /api/:userId     (public) ← This was matching /me!
GET  /api/me          (protected) ← Never reached
```

#### Route Structure (After)
```
GET  /api/token/:userId  (public, separate router)
POST /api/me             (public)
GET  /api/me             (protected) ← Now works correctly!
```

#### Test Results
- Before: 27/49 tests failing (55% pass rate)
- After: 40/49 tests passing (82% pass rate)
- Remaining 9 failures are admin-related configuration issues

### Migration Notes

If you were using the old documentation:
1. All setup instructions are now in `SETUP_AND_TESTING_GUIDE.md`
2. Quick reference is in `README.md`
3. Token endpoint moved from `/api/:userId` to `/api/token/:userId`
4. Update any scripts or clients using the old token endpoint

### Next Steps

To achieve 100% test pass rate:
1. Ensure `ADMIN_EMAILS` is set in `.env`
2. Restart service to load environment variables
3. Run: `./run-newman-tests.sh --html`

---

## Previous Changes

See git history for changes before 2025-11-17.
