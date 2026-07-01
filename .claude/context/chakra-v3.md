# Chakra UI v3 — Patterns & Gotchas

This project uses **Chakra UI v3.17.0**. The API is meaningfully different from v2.

---

## Theme Setup

```tsx
// AppProvider.tsx
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@dataulinzi/theme"; // v3 system object, not a theme object

<ChakraProvider value={system}>{children}</ChakraProvider>;
```

After modifying `packages/theme`, run `yarn gen:theme-typings` from the app:

```bash
yarn workspace user-dashboard gen:theme-typings
# Which runs: chakra typegen ../../packages/theme/src/index.ts
```

---

## Toaster (Notifications)

```ts
// Import from @repo/ui/elements — NOT from @chakra-ui/react
import { toaster } from "@repo/ui/elements";

// Usage
toaster.create({
  title: "Success",
  description: "Item created.",
  type: "success", // "success" | "error" | "warning" | "info"
});

toaster.error({ title: "Something went wrong" });
toaster.success({ title: "Done!" });
```

**Never** use `useToast` from chakra — that's v2.

---

## Prop Name Changes (v2 → v3)

| v2                | v3             |
| ----------------- | -------------- |
| `isDisabled`      | `disabled`     |
| `isLoading`       | `loading`      |
| `isInvalid`       | `invalid`      |
| `isReadOnly`      | `readOnly`     |
| `isRequired`      | `required`     |
| `isChecked`       | `checked`      |
| `spacing` (Stack) | `gap`          |
| `colorScheme`     | `colorPalette` |

---

## Form Fields (FormControl → Field)

```tsx
// v3 pattern
import { Field } from "@chakra-ui/react";

<Field label="Email" invalid errorText="Invalid email" required>
  <Input />
</Field>;
```

No separate `FormControl`, `FormLabel`, `FormErrorMessage` — all unified in `Field`.

---

## Disclosure (Modals, Drawers)

```tsx
import { useDisclosure } from "@chakra-ui/react";

function MyComponent() {
  const { open, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>Open</Button>
      <CustomModal open={open} onClose={onClose}>
        {/* content */}
      </CustomModal>
    </>
  );
}
```

`useDisclosure` is still from `@chakra-ui/react` in v3 but the returned values changed:

- v2: `isOpen` → v3: `open`

---

## CustomModal (from @repo/ui)

```tsx
import { CustomModal } from "@repo/ui/elements";

<CustomModal
  open={open}
  onClose={onClose}
  title="Confirm Action"
  size="md" // "sm" | "md" | "lg" | "xl" | "full"
>
  <Box>Modal content</Box>
  <HStack justify="flex-end" mt={4}>
    <Button variant="ghost" onClick={onClose}>
      Cancel
    </Button>
    <Button colorPalette="blue" onClick={handleConfirm}>
      Confirm
    </Button>
  </HStack>
</CustomModal>;
```

---

## Stack / HStack / VStack

```tsx
// v3 uses gap, not spacing
<VStack gap={4} align="stretch">
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</VStack>

<HStack gap={3}>
  <Button>A</Button>
  <Button>B</Button>
</HStack>
```

---

## Color System

Colors come from `@dataulinzi/theme` custom tokens. Use semantic token names, not raw hex values:

```tsx
// Use semantic tokens
<Box bg="brand.500" color="white">

// Or colorPalette on components
<Button colorPalette="brand">Click</Button>
```

---

## Responsive Values

```tsx
// Still uses the breakpoint object syntax
<Box
  display={{ base: "block", md: "flex" }}
  px={{ base: 4, lg: 8 }}
  gap={{ base: 2, md: 4 }}
/>

// SimpleGrid
<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
```

---

## Icon Usage

Icons come from `@dataulinzi/assets`, not from `@chakra-ui/icons` (v2 package):

```tsx
import { ReactComponent as MyIcon } from "@dataulinzi/assets/custom/my-icon.svg";

// In JSX
<MyIcon width="20px" height="20px" />

// Or wrap in Chakra Box for sizing
<Box as={MyIcon} boxSize="20px" color="brand.500" />
```

---

## Skeleton / Loading States

```tsx
import { Skeleton, SkeletonText } from "@chakra-ui/react";
// Or use the shared Loader and SectionLoader from @repo/ui/elements
import { Loader, SectionLoader } from "@repo/ui/elements";

// Full page loading
if (isLoading) return <Loader />;

// Section loading
if (isLoading) return <SectionLoader />;
```

---

## Recipe-Based Component Variants

Theme recipes are in `packages/theme/src/recipe/`. To add a variant, edit the recipe file and regenerate typings.

```ts
// packages/theme/src/recipe/button.recipe.ts (example)
import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
  variants: {
    visual: {
      solid: { bg: "brand.500", color: "white" },
      outline: { border: "1px solid", borderColor: "brand.500" },
    },
  },
});
```

After editing recipes: `yarn gen:theme-typings`.
