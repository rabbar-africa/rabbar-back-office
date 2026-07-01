# Find Chakra UI v2 Patterns That Need v3 Migration

This project uses Chakra UI v3. Chakra v2 patterns are incompatible and will cause runtime errors or silent style failures.

## What to do

1. **Scan the codebase** for the v2 patterns listed below.
2. **Report each occurrence** with file path, line number, and the correct v3 replacement.
3. **Offer to fix** each issue.

---

## Common v2 → v3 Migrations

### Theme extension

```ts
// v2 (WRONG)
import { extendTheme } from "@chakra-ui/react";
const theme = extendTheme({ ... });

// v3 (CORRECT) — use @dataulinzi/theme package
import { system } from "@dataulinzi/theme";
<ChakraProvider value={system}>
```

### Toast / Toaster

```ts
// v2 (WRONG)
import { useToast } from "@chakra-ui/react";
const toast = useToast();
toast({ title: "...", status: "success" });

// v3 (CORRECT)
import { toaster } from "@repo/ui/elements";
toaster.create({ title: "...", type: "success" });
```

### Color mode

```ts
// v2 (WRONG)
import { useColorMode, ColorModeProvider } from "@chakra-ui/react";

// v3 — color mode works differently; check @dataulinzi/theme for setup
```

### Stack spacing prop

```tsx
// v2 (WRONG)
<Stack spacing={4}>

// v3 (CORRECT)
<Stack gap={4}>
```

### SimpleGrid columns as responsive object

```tsx
// v2 (WRONG)
<SimpleGrid columns={{ base: 1, md: 2 }}>

// v3 (CORRECT) — same syntax works, but verify rendering
```

### `as` prop on Chakra components

```tsx
// v2 — `as` prop is supported
// v3 — check if the specific component still supports `as`; use native HTML elements where possible
```

### `isDisabled`, `isLoading`, `isInvalid`

```tsx
// v2 (WRONG in v3 context)
<Button isDisabled>
<Input isInvalid>

// v3 (CORRECT)
<Button disabled>
<Input invalid>  // or via Field component
```

### FormControl / FormLabel

```tsx
// v2 (WRONG)
import { FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";

// v3 (CORRECT)
import { Field } from "@chakra-ui/react"; // Field replaces FormControl
```

### Drawer/Modal placement and size props

```tsx
// Verify that size and placement values are still valid in v3
// Some values changed between v2 and v3
```

---

## Search Terms to Grep

- `extendTheme`
- `useToast`
- `isDisabled` (on Chakra components)
- `isLoading` (on Chakra components)
- `isInvalid`
- `FormControl` from chakra
- `FormErrorMessage`
- `spacing={` on Stack/HStack/VStack
- `colorMode`
- `useColorMode`

Report all findings with full context so they can be properly migrated.
