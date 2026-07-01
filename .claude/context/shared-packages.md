# Shared Packages — Complete Export Reference

---

## @repo/ui

Source: `packages/ui/src/`

### Root import (`@repo/ui`)

```ts
import {
  CustomTable,
  ActionButton,
  EmptyState,
  // ... see elements below
} from "@repo/ui";
```

### Elements (`@repo/ui/elements`)

```ts
import {
  CustomModal, // Modal dialog wrapper
  CustomBadge, // Status/category badge
  CustomBreadcrumb, // Breadcrumb navigation
  Tabs, // Tab navigation component
  Card, // Generic card container
  Loader, // Full-page loading spinner
  SectionLoader, // Section-level loading state
  Code, // Code block display
  toaster, // Toast notification system (v3)
  EmptyState, // Empty data state with icon + message
  ActionButton, // Action button with icon support
  CustomCircularProgress, // Circular progress indicator
  Tooltip, // Tooltip wrapper
  CardSkeleton, // Skeleton card for loading states
  HighlightText, // Text with highlight/search highlight
  FloatItem, // Floating action item
  Logo, // DataUlinzi logo component
  Status, // Status indicator dot/badge
  FilterItem, // Filter chip/tag
  ProgressBar, // Linear progress bar
  Button, // Custom button component
} from "@repo/ui/elements";
```

### HOC (`@repo/ui/hoc`)

```ts
import {
  UserDashboardContainer, // Main layout container for user-dashboard pages
  BackOfficeContainer, // Main layout container for back-office pages
  CustomContainer, // Generic container wrapper
} from "@repo/ui/hoc";
```

### Input (`@repo/ui/input`)

```ts
import {
  CustomInput, // Text input with label and error handling
  CustomTextArea, // Multi-line text input
  CustomNumberInput, // Numeric input with increment/decrement
  CustomRadioGroup, // Radio button group
  CustomRadio, // Individual radio button
  CustomRadioWithChildren, // Radio with child content
  CustomRadioCard, // Card-style radio option
  CustomCheckBox, // Checkbox input
  CustomCheckboxCard, // Card-style checkbox option
  CustomSwitch, // Toggle switch
  CustomSelect, // Dropdown select
  CustomTagInput, // Tag/chip input field
  SearchInput, // Search input with icon
  MultiValueInput, // Multi-value text input
} from "@repo/ui/input";
```

### Cards (`@repo/ui`)

```ts
// Template and top-stat cards
import { TemplateCard } from "@repo/ui"; // Content template card
// TopCard1, TopCard2, TopCard3 — KPI/stat display cards
```

---

## @dataulinzi/utils

Source: `packages/utils/src/`

```ts
import {
  // Routing
  lazyImport, // Lazy-load named exports for routes
  defineRoute, // Type-safe route builder factory

  // Data formatting
  formatDate, // Date → string formatting
  string, // String utilities
  buildUrlWithQueryParams, // Build URL with query string

  // Files
  fileHelper, // File type checking, size formatting

  // State / Storage
  storage, // localStorage wrapper (get/set/remove)
  persistToken, // Auth token persistence helpers

  // URL State
  useUrlState, // Multi-param URL query state hook
  useUrlParam, // Single-param URL query state hook

  // Errors
  handleError, // Normalise unknown errors to string message

  // Risk
  riskAssesmentsCalculator, // Risk score calculation utilities

  // Misc
  navigation, // Navigation helper functions
  objectFormatter, // Object transformation utilities
  permissionsMapper, // Permission mapping helpers
  validations, // Zod-compatible validators
  getColor, // Color utility functions
} from "@dataulinzi/utils";
```

### useUrlState Hook Details

```ts
import { useUrlState, useUrlParam } from "@dataulinzi/utils";

// Multi-param: returns [state, setState, resetState]
const [filters, setFilters, resetFilters] = useUrlState(
  {
    page: { type: "number", defaultValue: 1 },
    search: { type: "string", defaultValue: "" },
    status: { type: "array", defaultValue: [] as string[] },
    config: { type: "object", defaultValue: {} },
    active: { type: "boolean", defaultValue: false },
    // Custom serializer
    dateRange: {
      type: "string",
      defaultValue: "",
      serialize: (v) => v.toISOString(),
      deserialize: (s) => new Date(s),
    },
  },
  {
    replace: true, // Use replaceState (no back-button history entry)
    removeDefaults: true, // Don't show default values in URL
    prefix: "f_", // Prefix all param names (e.g. "f_page")
  },
);

// Single-param: returns [value, setValue]
const [id, setId] = useUrlParam("id", { type: "string", defaultValue: "" });
```

### lazyImport

```ts
// Lazy-load a named export (NOT default export) for use in routes
const { MyPage } = lazyImport(() => import("../pages/MyPage"), "MyPage");

// Works with React.Suspense
<Suspense fallback={<Loader />}>
  <MyPage />
</Suspense>
```

### defineRoute

```ts
import { defineRoute } from "@dataulinzi/utils";

const myRoute = defineRoute("/feature/:id/:tab");

myRoute(); // "/feature/:id/:tab" (template)
myRoute("abc", "settings"); // "/feature/abc/settings"
```

---

## @dataulinzi/theme

Source: `packages/theme/src/`

```ts
import { system } from "@dataulinzi/theme";
// Use as: <ChakraProvider value={system}>

// Internal theme structure (don't import these directly in apps):
// theme.config.ts   — Chakra createSystem configuration
// custom/color.ts   — Color palette tokens
// custom/font.ts    — Font configuration (Poppins)
// text-styles.ts    — Text style tokens
// recipe/           — Component recipe overrides
```

---

## @dataulinzi/types

Source: `packages/types/src/`

```ts
import type {
  // Time
  ITimeRange,
  // Cards
  ICardProps,
  // Assessment templates
  IAssessmentTemplate,
  IAssessmentTemplateItem,
} from "@dataulinzi/types";
```

---

## @dataulinzi/assets

Source: `packages/assets/src/`

```ts
// Custom SVGs (134+ files in src/custom/)
import { ReactComponent as DocumentIcon } from "@dataulinzi/assets/custom/document.svg";

// Icons (104+ files in src/icons/)
import { ReactComponent as ArrowIcon } from "@dataulinzi/assets/icons/arrow-right.svg";

// Images (31+ files in src/images/)
import logoImage from "@dataulinzi/assets/images/logo.png";
```

Note: SVG imports use `vite-plugin-svgr` — they must be imported as `{ ReactComponent as Name }`.

---

## @repo/eslint-config

Internal only — not imported in application code. Used in `eslint.config.mjs` files:

```js
import { base } from "@repo/eslint-config/base";
import { reactInternal } from "@repo/eslint-config/react-internal";
import { next } from "@repo/eslint-config/next";
```
