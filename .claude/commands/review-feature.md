# Review a Feature for Pattern Compliance

Use this to audit an existing feature module for correctness, consistency, and adherence to project conventions.

## What to do

1. **Ask** (if not specified): Which feature to review? (`src/feature/<name>/`)

2. **Read all files** in the feature directory and perform the checks below.

3. **Report findings** grouped by category, with file paths and line numbers for each issue.

---

## Checklist

### API Layer (`api/`)

- [ ] Functions are plain async — no React hooks, no state
- [ ] Uses `@/lib/axios` instance (not bare `axios`)
- [ ] All paths come from `src/shared/constants/query-paths.ts`
- [ ] Returns `response.data` (unwrapped from Axios response object)
- [ ] Typed with `ApiResponse<T>` generic

### Queries Layer (`queries/`)

- [ ] All query keys use `customQueryKey` from `src/shared/constants/query-keys.ts`
- [ ] No hardcoded string query keys
- [ ] Mutations have `meta.successMessage` for user-facing actions
- [ ] Mutations have `meta.invalidatesQuery` pointing to the right keys
- [ ] `useQuery` has `enabled` guard when the param could be undefined (e.g., `enabled: !!id`)
- [ ] Config spread (`...config`) to allow callers to override options

### Pages (`pages/`)

- [ ] Page is a thin wrapper — no data fetching, no business logic
- [ ] Wraps with `UserDashboardContainer` from `@repo/ui/hoc`
- [ ] Renders a single template component, nothing more

### Templates (`templates/`)

- [ ] All logic, data fetching, and state lives here (not in the page)
- [ ] Uses query hooks from `queries/`
- [ ] Does not import from other features' internals (only shared constants, shared hooks, `@repo/ui`)

### Routes (`routes/`)

- [ ] Exports a `RouteObject[]`
- [ ] Uses `lazyImport()` from `@dataulinzi/utils` for all page imports
- [ ] Uses path from `NewRouteConstants` in `src/shared/constants/routes.ts`
- [ ] Route array is spread in `src/routes/DashboardRoutes.tsx`

### Interfaces (`interface/`)

- [ ] All entity interfaces prefixed with `I` (e.g., `IMyEntity`)
- [ ] DTO types suffixed with `Dto`
- [ ] No duplicate types that already exist in `src/shared/interface/` or `@dataulinzi/types`

### General

- [ ] No `console.log` calls (ESLint `no-console` rule)
- [ ] No direct `import.meta.env` access — use `src/shared/constants/env.ts`
- [ ] No direct `axios` import — use `@/lib/axios`
- [ ] No `any` types in new code (even though the rule is off, avoid it)
- [ ] Components and files use consistent naming (PascalCase for components, camelCase/kebab-case for utilities)

---

## Output Format

For each issue found:

```
[CATEGORY] file/path.ts:line — description of issue
```

For example:

```
[API] feature/risk/api/risk-catalog.ts:14 — imports from 'axios' directly, should use '@/lib/axios'
[QUERY] feature/risk/queries/risk-catalog.ts:22 — hardcoded query key "risk/getAll", should use customQueryKey
[PAGE] feature/risk/pages/RiskCatalog.tsx:8 — fetches data in page component, move to template
```

End with a summary: number of issues per category, and overall assessment (clean / needs minor fixes / needs significant rework).
