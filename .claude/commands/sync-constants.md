# Audit and Sync Shared Constants

Use this to find inconsistencies between the three shared constant files that must stay in sync:

- `src/shared/constants/query-paths.ts` — API endpoint strings
- `src/shared/constants/query-keys.ts` — React Query cache keys
- `src/shared/constants/routes.ts` — Frontend route paths

## What to do

1. **Read all three constant files** in full.

2. **Read all feature directories** — scan `api/`, `queries/`, and `routes/` files across all features in `src/feature/`.

3. **Find mismatches:**

### Orphaned query keys

Keys in `customQueryKey` that are never referenced in any `queries/*.ts` file.

### Orphaned API paths

Paths in `apiPaths` that are never referenced in any `api/*.ts` file.

### Missing keys

`queries/*.ts` files that use string literals as query keys instead of `customQueryKey.*`.

### Missing paths

`api/*.ts` files that hardcode URL strings instead of using `apiPaths.*`.

### Missing route constants

Route files that hardcode path strings instead of using `NewRouteConstants.*`.

### Orphaned route constants

Route constants that are defined but not used in any `routes/index.tsx` or navigation code.

4. **Report findings** as a table:

```
ORPHANED QUERY KEYS (defined but never used):
  customQueryKey.myEntity.getSomething

MISSING QUERY KEYS (used as string literals):
  queries/my-entity.ts:14 — "my-entity/getAll" should be customQueryKey.myEntity.getAll

ORPHANED API PATHS (defined but never used):
  apiPaths.myEntity.doSomething

HARDCODED API PATHS:
  api/my-entity.ts:8 — "${BASE_URL}/my-entities" should be apiPaths.myEntity.getAll

MISSING ROUTE CONSTANTS:
  routes/index.tsx:12 — "/my-feature" should be NewRouteConstants.myFeature.base()
```

5. **Offer to fix** any issues found — adding missing entries, removing orphans (after confirming with the user), or replacing hardcoded strings with constants.
