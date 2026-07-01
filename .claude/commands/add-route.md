# Register a New Route

Use this to add a new page route to the user-dashboard app.

## What to do

1. **Ask** (if not specified): What feature does this route belong to? What is the URL path? What is the page component name?

2. **Add the route constant** to `src/shared/constants/routes.ts`:

```ts
// In NewRouteConstants object, under the feature key
myFeature: {
  base: defineRoute("/my-feature"),
  detail: defineRoute("/my-feature/:id"),
  // add as many as needed
},
```

3. **Create the page component** if it doesn't exist at `src/feature/<name>/pages/MyPage.tsx`:

```tsx
import { UserDashboardContainer } from "@repo/ui/hoc";
import { MyPageTemplate } from "../templates/MyPageTemplate";

export function MyPage() {
  return (
    <UserDashboardContainer>
      <MyPageTemplate />
    </UserDashboardContainer>
  );
}
```

4. **Create a stub template** if it doesn't exist at `src/feature/<name>/templates/MyPageTemplate.tsx`:

```tsx
import { Box } from "@chakra-ui/react";

export function MyPageTemplate() {
  return <Box>{/* TODO: implement */}</Box>;
}
```

5. **Add the lazy import and route** to `src/feature/<name>/routes/index.tsx`:

```tsx
import { lazyImport } from "@dataulinzi/utils";
import { RouteObject } from "react-router-dom";
import { NewRouteConstants } from "@/shared/constants/routes";

const { MyPage } = lazyImport(() => import("../pages/MyPage"), "MyPage");

export const myFeatureRoutes: RouteObject[] = [
  // existing routes...
  {
    path: NewRouteConstants.myFeature.detail(),
    element: <MyPage />,
  },
];
```

6. **Verify** the feature's route array is spread in `src/routes/DashboardRoutes.tsx`. If this is a brand new feature, add it:

```tsx
// In DashboardRoutes.tsx
import { myFeatureRoutes } from "@/feature/my-feature/routes";

// Inside the routes array
...myFeatureRoutes,
```

7. **Check** that `ProtectedRoutes.tsx` or `PublicRoutes.tsx` wraps the route correctly based on whether it needs authentication.

After adding, confirm the route structure and remind the user to navigate to the new path to verify it renders.
