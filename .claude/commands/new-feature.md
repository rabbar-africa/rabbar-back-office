# Scaffold a New Feature Module

You are scaffolding a new feature a module in the apps folder app following the established conventions.

## What to do

1. **Ask** (if not already specified): What is the module name, feature name (kebab-case)? What entity/entities does it manage?

2. **Create the full directory structure** at `src/feature/<feature-name>/`:
   - `api/service.ts` — raw axios functions
   - `api/query.ts` — React Query hooks
   - `interface/index.ts` — TypeScript interfaces
   - `components/` — empty directory placeholder
   - `templates/<FeatureName>Template.tsx` — main page template
   - `pages/<FeatureName>.tsx` — thin page wrapper
   - `routes/index.tsx` — RouteObject[] export

3. **Update shared constants:**
   - Add query keys to `src/shared/constants/query-keys.ts` with `getAll`, `getById` at minimum
   - Add route constants to `src/shared/constants/routes.ts` using `defineRoute()`

4. **Register the feature routes** in `src/routes/DashboardRoutes.tsx` by spreading the new route array

5. **Follow these patterns precisely:**

### Interface file

```ts
// interface/index.ts
export interface IMyEntity {
  id: string;
  // ... fields
  createdAt: string;
  updatedAt: string;
}

export interface CreateMyEntityDto {
  // ... create fields
}
```

### API file

```ts
// api/my-entity.ts
import { axios } from "@/lib/axios";
import { apiPaths } from "@/shared/constants/query-paths";
import { ApiResponse } from "@/shared/interface/api";
import { IMyEntity, CreateMyEntityDto } from "../interface";

export const getAllMyEntities = async (filter?: Partial<IBaseFilter>) => {
  const baseUrl = "/entity";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filter);
  const response = await axios.get<ApiResponse<Array<IMyEntity>>>(apiUrl);
  return response.data;
};

export const getMyEntityById = async (id: string) => {
  const { data } = await axios.get<ApiResponse<IMyEntity>>(`/myentity/${id}`);
  return data;
};

export const createMyEntity = async (payload: CreateMyEntityDto) => {
  const { data } = await axios.post<ApiResponse<IMyEntity>>(
    "/myentity",
    payload,
  );
  return data;
};
```

### Queries file

```ts
// queries/my-entity.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import {
  getAllMyEntities,
  getMyEntityById,
  createMyEntity,
} from "../api/my-entity";

export const useGetAllMyEntities = (config?) =>
  useQuery({
    queryKey: [customQueryKey.myEntity.getAll],
    queryFn: getAllMyEntities,
    ...config,
  });

export const useGetMyEntityById = (id: string, config?) =>
  useQuery({
    queryKey: [customQueryKey.myEntity.getById, id],
    queryFn: () => getMyEntityById(id),
    enabled: !!id,
    ...config,
  });

export const useCreateMyEntity = () =>
  useMutation({
    mutationFn: createMyEntity,
    meta: {
      successMessage: "Created successfully",
      invalidatesQueryKeys: [[customQueryKey.myEntity.getAll]],
    },
  });
```

### Template

```tsx
// templates/MyEntityTemplate.tsx
import { Box } from "@chakra-ui/react";
import { EmptyState, Loader } from "@repo/ui/elements";
import { useGetAllMyEntities } from "../queries/my-entity";

export function MyEntityTemplate() {
  const { data, isLoading } = useGetAllMyEntities();

  if (isLoading) return <Loader />;

  return <Box>{/* page content */}</Box>;
}
```

### Page (thin wrapper)

```tsx
// pages/MyEntity.tsx
import { UserDashboardContainer } from "@repo/ui/hoc";
import { MyEntityTemplate } from "../templates/MyEntityTemplate";

export function MyEntity() {
  return (
    <UserDashboardContainer>
      <MyEntityTemplate />
    </UserDashboardContainer>
  );
}
```

### Routes

```tsx
// routes/index.tsx
import { lazyImport } from "@dataulinzi/utils";
import { RouteObject } from "react-router-dom";
import { NewRouteConstants } from "@/shared/constants/routes";

const { MyEntity } = lazyImport(() => import("../pages/MyEntity"), "MyEntity");

export const myEntityRoutes: RouteObject[] = [
  {
    path: NewRouteConstants.myEntity.base(),
    element: <MyEntity />,
  },
];
```

After scaffolding, confirm all files created and remind the user to run `yarn workspace user-dashboard check-types` to verify correctness.
