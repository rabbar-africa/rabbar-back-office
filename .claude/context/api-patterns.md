# API & React Query Patterns

Full reference for the two-layer API architecture used in `apps/user-dashboard` and `apps/back-office`.

---

## Layer 1: Raw API Functions (`api/*.ts`)

**Rules:**

- Plain async functions only — no React hooks, no component state
- Always use the configured axios instance from `@/lib/axios` (never import `axios` directly)
- All paths from `src/shared/constants/query-paths.ts`
- Type the response with `ApiResponse<T>` generic
- Return `response.data`, not the full axios response

```ts
import { axios } from "@/lib/axios";
import { apiPaths } from "@/shared/constants/query-paths";
import { ApiResponse } from "@/shared/interface/api";
import { IMyEntity } from "../interface";

// List (with optional filter)
export const getAllMyEntities = async (filter?: IMyFilter) => {
  const { data } = await axios.get<ApiResponse<IMyEntity[]>>(
    apiPaths.myEntity.getAll,
    { params: filter },
  );
  return data;
};

// Single by ID
export const getMyEntityById = async (id: string) => {
  const { data } = await axios.get<ApiResponse<IMyEntity>>(
    apiPaths.myEntity.getById(id),
  );
  return data;
};

// Create
export const createMyEntity = async (payload: CreateMyEntityDto) => {
  const { data } = await axios.post<ApiResponse<IMyEntity>>(
    apiPaths.myEntity.create,
    payload,
  );
  return data;
};

// Update
export const updateMyEntity = async ({
  id,
  ...payload
}: UpdateMyEntityDto & { id: string }) => {
  const { data } = await axios.patch<ApiResponse<IMyEntity>>(
    apiPaths.myEntity.update(id),
    payload,
  );
  return data;
};

// Delete
export const deleteMyEntity = async (id: string) => {
  const { data } = await axios.delete<ApiResponse<null>>(
    apiPaths.myEntity.delete(id),
  );
  return data;
};

// File upload
export const uploadMyEntityDocument = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axios.post<ApiResponse<IDocument>>(
    apiPaths.myEntity.uploadDocument(id),
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};
```

---

## Layer 2: React Query Hooks (`queries/*.ts`)

**Rules:**

- Wrap API functions with `useQuery` (GET) or `useMutation` (write operations)
- Query keys always from `customQueryKey` in `src/shared/constants/query-keys.ts`
- Mutations use `meta` fields for automatic toasts and invalidation
- Spread `config` to allow callers to override behaviour

```ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { UseQueryOptions } from "@tanstack/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import {
  getAllMyEntities,
  getMyEntityById,
  createMyEntity,
  updateMyEntity,
  deleteMyEntity,
} from "../api/my-entity";
import { ApiResponse } from "@/shared/interface/api";
import { IMyEntity } from "../interface";

// List query
export const useGetAllMyEntities = (
  filter?: IMyFilter,
  config?: Partial<UseQueryOptions<ApiResponse<IMyEntity[]>>>,
) =>
  useQuery({
    queryKey: [customQueryKey.myEntity.getAll, filter],
    queryFn: () => getAllMyEntities(filter),
    ...config,
  });

// Detail query — disabled until id is available
export const useGetMyEntityById = (
  id: string,
  config?: Partial<UseQueryOptions<ApiResponse<IMyEntity>>>,
) =>
  useQuery({
    queryKey: [customQueryKey.myEntity.getById, id],
    queryFn: () => getMyEntityById(id),
    enabled: !!id,
    ...config,
  });

// Create mutation
export const useCreateMyEntity = () =>
  useMutation({
    mutationFn: createMyEntity,
    meta: {
      successMessage: "Created successfully",
      invalidatesQuery: [[customQueryKey.myEntity.getAll]],
    },
  });

// Update mutation
export const useUpdateMyEntity = () =>
  useMutation({
    mutationFn: updateMyEntity,
    meta: {
      successMessage: "Updated successfully",
      invalidatesQuery: [
        [customQueryKey.myEntity.getAll],
        [customQueryKey.myEntity.getById],
      ],
    },
  });

// Delete mutation
export const useDeleteMyEntity = () =>
  useMutation({
    mutationFn: deleteMyEntity,
    meta: {
      successMessage: "Deleted successfully",
      invalidatesQuery: [[customQueryKey.myEntity.getAll]],
    },
  });
```

---

## Mutation Meta Fields (Global Behaviour)

The `queryClient` in `src/lib/react-query/` handles these automatically via the mutation cache:

| Field                   | Type           | Effect                                             |
| ----------------------- | -------------- | -------------------------------------------------- |
| `meta.successMessage`   | `string`       | Shows a success toast on `onSuccess`               |
| `meta.invalidatesQuery` | `QueryKey[][]` | Calls `queryClient.invalidateQueries` for each key |
| `meta.skipGlobalError`  | `boolean`      | Suppresses the automatic error toast               |

This means you **never** call `toaster.create(...)` directly inside a mutation's `onSuccess` callback — just set `meta.successMessage`.

---

## query-paths.ts Structure

```ts
// src/shared/constants/query-paths.ts
const BASE_URL = env.apiBaseUrl; // from src/shared/constants/env.ts

export const apiPaths = {
  myEntity: {
    getAll: `${BASE_URL}/my-entities`,
    getById: (id: string) => `${BASE_URL}/my-entities/${id}`,
    create: `${BASE_URL}/my-entities`,
    update: (id: string) => `${BASE_URL}/my-entities/${id}`,
    delete: (id: string) => `${BASE_URL}/my-entities/${id}`,
    // nested / action routes
    uploadDocument: (id: string) => `${BASE_URL}/my-entities/${id}/documents`,
    overview: `${BASE_URL}/my-entities/overview`,
  },
};
```

---

## query-keys.ts Structure

```ts
// src/shared/constants/query-keys.ts
export const customQueryKey = {
  myEntity: {
    getAll: "myEntity/getAll",
    getById: "myEntity/getById",
    overview: "myEntity/overview",
  },
  // ... all other entities
};
```

---

## Axios Setup

Located at `src/lib/axios/index.ts`. Interceptors in `src/lib/axios/interceptors.ts`:

- **`authRequestInterceptor`** — reads token from storage, attaches `Authorization: Bearer <token>` header
- **`refreshTokenInterceptor`** — on 401, attempts silent token refresh, retries original request
- **`rejectErrorInterceptor`** — normalises error shape, triggers global error toast unless `meta.skipGlobalError`

**Never** import from `"axios"` directly in feature code — always `import { axios } from "@/lib/axios"`.

---

## Error Handling

The global error toast fires automatically on mutation failure (unless `meta.skipGlobalError: true`). For query errors, use the `onError` callback or `isError` + `error` from `useQuery`.

For manual error display:

```ts
import { handleError } from "@dataulinzi/utils";
// handleError normalises unknown errors to a readable message string
const message = handleError(error);
```
