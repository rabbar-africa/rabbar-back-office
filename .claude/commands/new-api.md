# Add API + React Query Hook for a New Endpoint

Use this when adding a new API call to an existing feature (not scaffolding a whole new feature).

## What to do

1. **Ask** (if not specified): Which feature? What entity/endpoint? What HTTP method and path? What does it return?

2. **Add the API function** to the existing `src/feature/<feature>/api/<entity>.ts`:
   - Use the axios instance from `@/lib/axios`
   - Use path from `src/shared/constants/query-paths.ts` (add it there first if missing)
   - Return `response.data` (unwrapped from axios response)
   - Proper TypeScript generics with `ApiResponse<T>`

3. **Add the React Query hook** to `src/feature/<feature>/queries/<entity>.ts`:
   - `useQuery` for GET requests
   - `useMutation` for POST/PUT/PATCH/DELETE
   - Use key from `src/shared/constants/query-keys.ts` (add if missing)
   - For mutations: set `meta.successMessage` and `meta.invalidatesQuery`

4. **Update constants if needed:**
   - `src/shared/constants/query-paths.ts` — add the endpoint path
   - `src/shared/constants/query-keys.ts` — add query key(s)

## Patterns

### GET (list)

```ts
// In api file
export const getMyList = async (filter?: IFilter) => {
  const baseUrl = "/entity";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filter);
  const response = await axios.get<ApiResponse<IMyEntity[]>>(apiUrl);
  return response.data;
};

// In queries file
export const useGetMyList = (filter?: IFilter, config?) =>
  useQuery({
    queryKey: [customQueryKey.myEntity.getAll, filter],
    queryFn: () => getMyList(filter),
    ...config,
  });
```

### GET (by ID)

```ts
export const getMyEntityById = async (id: string) => {
  const { data } = await axios.get<ApiResponse<IMyEntity>>(
    apiPaths.myEntity.getById(id),
  );
  return data;
};

export const useGetMyEntityById = (id: string, config?) =>
  useQuery({
    queryKey: [customQueryKey.myEntity.getById, id],
    queryFn: () => getMyEntityById(id),
    enabled: !!id,
    ...config,
  });
```

### POST (create)

```ts
export const createMyEntity = async (payload: CreateMyEntityDto) => {
  const { data } = await axios.post(apiPaths.myEntity.create, payload);
  return data;
};

export const useCreateMyEntity = () =>
  useMutation({
    mutationFn: createMyEntity,
    meta: {
      successMessage: "Created successfully",
      invalidatesQuery: [[customQueryKey.myEntity.getAll]],
    },
  });
```

### PUT/PATCH (update)

```ts
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
```

### DELETE

```ts
export const deleteMyEntity = async (id: string) => {
  const { data } = await axios.delete<ApiResponse<null>>(
    apiPaths.myEntity.delete(id),
  );
  return data;
};

export const useDeleteMyEntity = () =>
  useMutation({
    mutationFn: deleteMyEntity,
    meta: {
      successMessage: "Deleted successfully",
      invalidatesQuery: [[customQueryKey.myEntity.getAll]],
    },
  });
```

### query-paths.ts pattern

```ts
myEntity: {
  getAll: `${BASE_URL}/my-entities`,
  getById: (id: string) => `${BASE_URL}/my-entities/${id}`,
  create: `${BASE_URL}/my-entities`,
  update: (id: string) => `${BASE_URL}/my-entities/${id}`,
  delete: (id: string) => `${BASE_URL}/my-entities/${id}`,
},
```

### query-keys.ts pattern

```ts
myEntity: {
  getAll: "myEntity/getAll",
  getById: "myEntity/getById",
},
```
