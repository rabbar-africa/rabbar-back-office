# Scaffold a New Shared UI Component

Use this to add a new reusable component to `packages/ui` (`@repo/ui`).

## What to do

1. **Ask** (if not specified): What is the component name? Which sub-package should it live in (`elements`, `input`, `hoc`)? What does it do?

2. **Decide the location:**
   - `packages/ui/src/elements/` — UI display elements (badges, modals, cards, loaders, etc.)
   - `packages/ui/src/input/` — Form input components
   - `packages/ui/src/hoc/` — Layout wrappers / higher-order components

3. **Create the component file:**

```tsx
// packages/ui/src/elements/my-component.tsx
"use client"; // Required — ui package is shared with Next.js

import { Box, type BoxProps } from "@chakra-ui/react";

export interface MyComponentProps extends BoxProps {
  // component-specific props
  label: string;
  variant?: "solid" | "outline";
}

export function MyComponent({
  label,
  variant = "solid",
  ...rest
}: MyComponentProps) {
  return <Box {...rest}>{label}</Box>;
}
```

4. **Export the component** from the sub-package's index file:

```ts
// packages/ui/src/elements/index.ts
export { MyComponent } from "./my-component";
export type { MyComponentProps } from "./my-component";
```

5. **Verify the main index re-exports** from `packages/ui/src/index.ts` if the component should be available at the root `@repo/ui` import path. Elements, inputs, and hocs each have their own export path (`@repo/ui/elements`, `@repo/ui/input`, `@repo/ui/hoc`).

6. **Rebuild the package** after adding:

```bash
yarn workspace @repo/ui build
# or from root:
yarn build --filter=@repo/ui
```

## Key Rules for ui package components

- Always add `"use client"` at the top — the package is shared with Next.js App Router
- Use Chakra UI v3 components and props (not v2 API)
- Use `@dataulinzi/theme` semantic tokens for colors when possible
- For icons, import from `@dataulinzi/assets/custom`
- Extend native Chakra prop types where appropriate (e.g., `extends BoxProps`)
- Export both the component and its props interface

## Example: Adding a new input component

```tsx
// packages/ui/src/input/custom-date-input.tsx
"use client";

import { Input, type InputProps } from "@chakra-ui/react";

export interface CustomDateInputProps extends Omit<InputProps, "type"> {
  label?: string;
}

export function CustomDateInput({ label, ...rest }: CustomDateInputProps) {
  return <Input type="date" placeholder={label} {...rest} />;
}
```
