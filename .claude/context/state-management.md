# State Management — Complete Reference

Four layers of state in `user-dashboard`, each with a clear scope.

---

## 1. Server State — React Query

**Use for:** All data fetched from the API.

**Setup:** `src/lib/react-query/` — global `queryClient` with mutation cache behaviour.

```ts
// Reading data
const { data, isLoading, isError, error, refetch } =
  useGetAllMyEntities(filter);

// Derived states
const isEmpty = !isLoading && (!data?.data || data.data.length === 0);

// Mutations
const { mutate, mutateAsync, isPending } = useCreateMyEntity();

// Calling a mutation
mutate(payload, {
  onSuccess: () => {
    // runs AFTER global success toast and query invalidation
    onClose(); // e.g., close a modal
  },
  onError: (error) => {
    // global error toast already shown unless meta.skipGlobalError: true
  },
});

// Await pattern (for chained operations)
try {
  await mutateAsync(payload);
  onClose();
} catch {
  // error already handled globally
}
```

### Manual cache operations (rare — prefer meta.invalidatesQuery)

```ts
import { useQueryClient } from "@tanstack/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";

const queryClient = useQueryClient();

// Invalidate a query
queryClient.invalidateQueries({ queryKey: [customQueryKey.myEntity.getAll] });

// Set data directly (optimistic update)
queryClient.setQueryData([customQueryKey.myEntity.getById, id], newData);

// Prefetch
await queryClient.prefetchQuery({
  queryKey: [customQueryKey.myEntity.getAll],
  queryFn: getAllMyEntities,
});
```

---

## 2. App / Global State — React Context

**Use for:** Cross-feature state that persists across page navigations but doesn't come from the API. Currently: `currentOrganization`.

**Files:**

- `src/provider/AppContext.tsx` — context definition + reducer
- `src/provider/AppProvider.tsx` — provider component
- `src/shared/hooks/useCurrentOrganization.ts` — consumer hook

```ts
// Reading current org (most common usage)
import { useCurrentOrganization } from "@/shared/hooks/useCurrentOrganization";

function MyTemplate() {
  const { currentOrganization } = useCurrentOrganization();
  // currentOrganization: IOrganization | null

  // API calls often need the org ID
  const { data } = useGetAllMyEntities({
    organizationId: currentOrganization?.id,
  });
}
```

**Adding new global state:** Extend the `AppContext` reducer and add a dispatch action. Only add state here if it's truly cross-feature and not query-cacheable.

---

## 3. Local Component State — useState / useReducer

**Use for:** UI state within a single component or template. Form open/close, active step, selected item for a modal, etc.

```tsx
// Simple boolean state (modal open)
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const selectedItem = useRef<IMyEntity | null>(null);

// Or use useDisclosure from Chakra
const { open, onOpen, onClose } = useDisclosure();

// Complex local state
const [step, setStep] = useState<1 | 2 | 3>(1);

// useReducer for more complex local state
const [state, dispatch] = useReducer(myReducer, initialState);
```

---

## 4. URL State — useUrlState

**Use for:** Filter, pagination, search, and any UI state that should survive page reload or be shareable via URL. Typically in templates that have filterable lists.

```tsx
import { useUrlState } from "@dataulinzi/utils";

// In a list template
const [filters, setFilters, resetFilters] = useUrlState({
  page: { type: "number", defaultValue: 1 },
  pageSize: { type: "number", defaultValue: 20 },
  search: { type: "string", defaultValue: "" },
  status: { type: "array", defaultValue: [] as string[] },
  sortBy: { type: "string", defaultValue: "createdAt" },
  sortOrder: { type: "string", defaultValue: "desc" },
}, { replace: true, removeDefaults: true });

// Pass to query hook
const { data, isLoading } = useGetAllMyEntities(filters);

// Update on search input
<SearchInput
  value={filters.search}
  onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
/>

// Pagination
<Pagination
  page={filters.page}
  pageSize={filters.pageSize}
  total={data?.meta?.total}
  onChange={(page) => setFilters({ page })}
/>

// Reset all filters
<Button variant="ghost" onClick={resetFilters}>Reset</Button>
```

---

## 5. Form State — React Hook Form + Zod

**Use for:** All form data. Never use uncontrolled inputs or manually track form field state.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof schema>;

function MyForm({ onSubmit }: { onSubmit: (values: FormValues) => void }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", status: "active" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CustomInput
        label="Name"
        {...register("name")}
        errorText={errors.name?.message}
      />
      <Button type="submit" loading={isSubmitting}>
        Save
      </Button>
    </form>
  );
}
```

### With mutation

```tsx
const { mutate, isPending } = useCreateMyEntity();

const onSubmit = (values: FormValues) => {
  mutate(values, {
    onSuccess: () => {
      reset();
      onClose();
    },
  });
};

<Button type="submit" loading={isPending}>
  Create
</Button>;
```

---

## Decision Guide

| Data type                          | Where it lives                           |
| ---------------------------------- | ---------------------------------------- |
| API data (lists, details)          | React Query cache                        |
| Loading / error state of API calls | React Query (`isLoading`, `isError`)     |
| Current organization               | AppContext                               |
| Filter / pagination / search       | useUrlState (URL)                        |
| Form field values                  | React Hook Form                          |
| Modal open/closed                  | useState or useDisclosure                |
| Active tab                         | useHashTab (URL hash) or useState        |
| Selected row in a table for modal  | useRef or useState in template           |
| Draft/unsaved data across steps    | useState (local) or React Query mutation |
