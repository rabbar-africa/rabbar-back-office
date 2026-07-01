# Routing — Complete Reference

React Router v6.23.1. All routing for `user-dashboard`.

---

## File Locations

| File                             | Purpose                                      |
| -------------------------------- | -------------------------------------------- |
| `src/routes/index.tsx`           | Root router setup                            |
| `src/routes/BaseApp.tsx`         | Base app wrapper                             |
| `src/routes/DashboardRoutes.tsx` | All protected dashboard routes composed here |
| `src/routes/ProtectedRoutes.tsx` | Auth guard — redirects to login if no token  |
| `src/routes/PublicRoutes.tsx`    | Public routes (login, invite, etc.)          |
| `src/routes/routeList.tsx`       | Sidebar/nav route list data                  |
| `src/shared/constants/routes.ts` | All route path constants                     |

---

## Route Constant Pattern

```ts
// src/shared/constants/routes.ts
import { defineRoute } from "@dataulinzi/utils";

export const NewRouteConstants = {
  auth: {
    login: defineRoute("/auth/login"),
  },
  overview: {
    base: defineRoute("/"),
    maturityReport: defineRoute("/maturity-report"),
  },
  myFeature: {
    base: defineRoute("/my-feature"),
    detail: defineRoute("/my-feature/:id"),
    tab: defineRoute("/my-feature/:id/:tab"),
  },
};
```

`defineRoute()` returns a function that accepts optional params and builds the path:

```ts
NewRouteConstants.myFeature.base(); // "/my-feature"
NewRouteConstants.myFeature.detail("abc123"); // "/my-feature/abc123"
NewRouteConstants.myFeature.tab("abc123", "settings"); // "/my-feature/abc123/settings"
```

---

## Feature Route File Pattern

```tsx
// src/feature/my-feature/routes/index.tsx
import { lazyImport } from "@dataulinzi/utils";
import { RouteObject } from "react-router-dom";
import { NewRouteConstants } from "@/shared/constants/routes";

// Lazy-load all page components
const { MyFeaturePage } = lazyImport(
  () => import("../pages/MyFeaturePage"),
  "MyFeaturePage",
);
const { MyFeatureDetailPage } = lazyImport(
  () => import("../pages/MyFeatureDetailPage"),
  "MyFeatureDetailPage",
);

export const myFeatureRoutes: RouteObject[] = [
  {
    path: NewRouteConstants.myFeature.base(),
    element: <MyFeaturePage />,
  },
  {
    path: NewRouteConstants.myFeature.detail(),
    element: <MyFeatureDetailPage />,
  },
];
```

---

## Composing Routes in DashboardRoutes

```tsx
// src/routes/DashboardRoutes.tsx (simplified)
import { myFeatureRoutes } from "@/feature/my-feature/routes";
// ... other feature imports

export function DashboardRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoutes />}>
        {/* Spread each feature's routes */}
        {myFeatureRoutes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
        {/* ... other feature routes */}
      </Route>
      {/* Public routes */}
    </Routes>
  );
}
```

---

## Navigating Programmatically

```tsx
import { useNavigate } from "react-router-dom";
import { NewRouteConstants } from "@/shared/constants/routes";

function MyComponent() {
  const navigate = useNavigate();

  const handleGoToDetail = (id: string) => {
    navigate(NewRouteConstants.myFeature.detail(id));
  };
}
```

---

## Reading Route Params

```tsx
import { useParams } from "react-router-dom";

function MyDetailTemplate() {
  const { id } = useParams<{ id: string }>();
  const { data } = useGetMyEntityById(id!);
}
```

---

## Tab Navigation via URL Hash

For tabbed pages, use the `useHashTab` hook from `src/shared/hooks/useHashTab.ts`:

```tsx
const { activeTab, setTab } = useHashTab("overview"); // "overview" is the default tab

// Tabs component from @repo/ui
<Tabs value={activeTab} onChange={setTab}>
  <Tab value="overview">Overview</Tab>
  <Tab value="settings">Settings</Tab>
</Tabs>;
```

---

## URL State for Filters

For filter/pagination state that should survive page refreshes and be shareable via URL, use `useUrlState`:

```tsx
import { useUrlState } from "@dataulinzi/utils";

const [filters, setFilters, resetFilters] = useUrlState(
  {
    page: { type: "number", defaultValue: 1 },
    pageSize: { type: "number", defaultValue: 20 },
    search: { type: "string", defaultValue: "" },
    status: { type: "array", defaultValue: [] },
  },
  { replace: true, removeDefaults: true },
);
```

---

## lazyImport Utility

```ts
// From @dataulinzi/utils
export function lazyImport<
  T extends Record<string, ComponentType<unknown>>,
  K extends keyof T,
>(factory: () => Promise<T>, name: K): Record<K, T[K]>;
```

Usage:

```tsx
// Import a named export lazily (compatible with React.lazy)
const { MyPage } = lazyImport(() => import("../pages/MyPage"), "MyPage");
```

This is the required pattern for all route page imports — never use `React.lazy` directly.
