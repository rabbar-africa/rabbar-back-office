# Find Existing Pattern Examples

Use this when you need to see how something is already done in the codebase before implementing something new.

## What to do

1. **Ask** (if not specified): What pattern, component, or behaviour are you looking for?

2. **Search the codebase** for the best existing examples of the requested pattern.

3. **Return 2–3 concrete examples** with file paths, line numbers, and the relevant code snippet.

---

## Common things to look for

### How a feature is structured

Look at a complete, well-formed feature: `src/feature/risk-management/` or `src/feature/vendor-management/`

### How a mutation with invalidation works

Search `queries/` files for `invalidatesQuery` usage

### How forms are built (React Hook Form + Zod)

Search for `useForm`, `zodResolver`, `handleSubmit` in feature `components/` or `templates/`

### How a modal is opened and confirmed

Search for `useDisclosure`, `CustomModal` usage

### How filters are applied via URL state

Search for `useUrlState` usage in templates

### How a table is built

Search for `CustomTable` or `@tanstack/react-table` usage

### How data subject / audit flows work

Read `src/feature/data-subject/` or `src/feature/audit/` as reference for complex multi-step flows

### How lazyImport is used

Search for `lazyImport` in `routes/` files

### How a route with a dynamic segment works

Search for `:id` in route files

---

## Output Format

For each example:

```
📁 path/to/file.ts (lines X–Y)

[relevant code block]

Why this is a good example: [1-2 sentence explanation]
```

Always point to real files. Do not invent examples.
