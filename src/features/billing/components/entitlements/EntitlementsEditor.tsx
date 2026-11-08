import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  NativeSelect,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react';
import type {
  IPlanCatalog,
  LimitPeriod,
  PlanEntitlements,
} from '@/shared/interface/plan-entitlements';
import {
  limitPhrase,
  PERIOD_LABELS,
  sameRule,
  toLimitDraft,
  type EntitlementsDraft,
  type LimitDraft,
} from './draft';

interface EntitlementsEditorProps {
  catalog: IPlanCatalog;
  /** What "reset" goes back to, shown beside each value. */
  base: PlanEntitlements;
  /** Names the base: "Default" for a plan, "Standard plan" for a business. */
  baseLabel: string;
  /** Tag on a value that differs from the base. */
  changedLabel: string;
  draft: EntitlementsDraft;
  onChange: (next: EntitlementsDraft) => void;
  /** Problems with a limit, by key. */
  errors?: Record<string, string>;
}

/**
 * Every feature (on/off) and limit (a number, or no cap; in total or a
 * month) a plan can have, with the base value beside each and a reset.
 * Controlled: the parent holds the draft and decides what to save.
 */
export function EntitlementsEditor({
  catalog,
  base,
  baseLabel,
  changedLabel,
  draft,
  onChange,
  errors = {},
}: EntitlementsEditorProps) {
  const setFeature = (key: string, on: boolean) =>
    onChange({ ...draft, features: { ...draft.features, [key]: on } });
  const setLimit = (key: string, next: Partial<LimitDraft>) =>
    onChange({
      ...draft,
      limits: { ...draft.limits, [key]: { ...draft.limits[key], ...next } },
    });

  return (
    <Stack gap="1.5rem">
      <Box>
        <SectionTitle
          title="Limits"
          hint="How many of each. A monthly limit counts what was made this calendar month (Lagos time)."
        />
        <Stack gap="0" borderWidth="1px" borderColor="gray.75" rounded=".5rem">
          {Object.entries(catalog.limits).map(([key, meta], index) => {
            const limit = draft.limits[key];
            const baseRule = base.limits[key];
            if (!limit || !baseRule) return null;
            const typed = /^\d+$/.test(limit.max.trim())
              ? Number(limit.max.trim())
              : undefined;
            const current = limit.unlimited
              ? { max: null, per: limit.per }
              : typed === undefined
                ? undefined
                : { max: typed, per: limit.per };
            const changed = !sameRule(current, baseRule);
            return (
              <Row
                key={key}
                divider={index > 0}
                label={meta.label}
                comingSoon={meta.status === 'planned'}
                changed={changed}
                changedLabel={changedLabel}
                baseText={`${baseLabel}: ${limitPhrase(baseRule, meta)}`}
                onReset={() => setLimit(key, toLimitDraft(baseRule))}
                error={errors[key]}
              >
                <Flex gap=".5rem" align="center" wrap="wrap">
                  <Input
                    size="sm"
                    w="5.5rem"
                    inputMode="numeric"
                    aria-label={`${meta.label}: maximum`}
                    value={limit.unlimited ? '' : limit.max}
                    placeholder={limit.unlimited ? '—' : '0'}
                    disabled={limit.unlimited}
                    onChange={(e) =>
                      setLimit(key, { max: e.target.value.replace(/\D/g, '') })
                    }
                  />
                  <Checkbox.Root
                    size="sm"
                    checked={limit.unlimited}
                    onCheckedChange={({ checked }) =>
                      setLimit(key, {
                        unlimited: checked === true,
                        // Unticking starts from the base's number, if it has one.
                        ...(checked !== true &&
                        !limit.max &&
                        baseRule.max !== null
                          ? { max: String(baseRule.max) }
                          : {}),
                      })
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label textStyle="tiny-regular">
                      No cap
                    </Checkbox.Label>
                  </Checkbox.Root>
                  {!meta.perDocumentType && (
                    <NativeSelect.Root
                      size="sm"
                      w="7.5rem"
                      disabled={limit.unlimited}
                    >
                      <NativeSelect.Field
                        aria-label={`${meta.label}: counted`}
                        value={limit.per}
                        onChange={(e) =>
                          setLimit(key, { per: e.target.value as LimitPeriod })
                        }
                      >
                        {catalog.periods.map((period) => (
                          <option key={period} value={period}>
                            {PERIOD_LABELS[period] ?? period}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  )}
                </Flex>
              </Row>
            );
          })}
        </Stack>
      </Box>

      <Box>
        <SectionTitle
          title="Features"
          hint="What is switched on. Coming soon means it is on the price list but not built, so nothing checks it yet."
        />
        <Stack gap="0" borderWidth="1px" borderColor="gray.75" rounded=".5rem">
          {Object.entries(catalog.features).map(([key, meta], index) => {
            const on = draft.features[key];
            const baseOn = base.features[key];
            if (on === undefined || baseOn === undefined) return null;
            return (
              <Row
                key={key}
                divider={index > 0}
                label={meta.label}
                comingSoon={meta.status === 'planned'}
                changed={on !== baseOn}
                changedLabel={changedLabel}
                baseText={`${baseLabel}: ${baseOn ? 'On' : 'Off'}`}
                onReset={() => setFeature(key, baseOn)}
              >
                <Switch.Root
                  size="sm"
                  checked={on}
                  onCheckedChange={({ checked }) => setFeature(key, checked)}
                  aria-label={meta.label}
                >
                  <Switch.HiddenInput />
                  <Switch.Control _checked={{ bg: 'primary.300' }}>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Label textStyle="tiny-regular" minW="1.75rem">
                    {on ? 'On' : 'Off'}
                  </Switch.Label>
                </Switch.Root>
              </Row>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <Box mb=".625rem">
      <Text textStyle="small-semibold" color="gray.500">
        {title}
      </Text>
      <Text textStyle="tiny-regular" color="gray.300">
        {hint}
      </Text>
    </Box>
  );
}

function Row({
  label,
  comingSoon,
  changed,
  changedLabel,
  baseText,
  onReset,
  error,
  divider,
  children,
}: {
  label: string;
  comingSoon: boolean;
  changed: boolean;
  changedLabel: string;
  baseText: string;
  onReset: () => void;
  error?: string;
  divider: boolean;
  children: React.ReactNode;
}) {
  return (
    <Flex
      px=".875rem"
      py=".625rem"
      gap=".75rem"
      justify="space-between"
      align={{ base: 'flex-start', md: 'center' }}
      direction={{ base: 'column', md: 'row' }}
      borderTopWidth={divider ? '1px' : 0}
      borderColor="gray.75"
      bg={changed ? 'primary.50' : undefined}
    >
      <Box minW="0">
        <Flex gap=".375rem" align="center" wrap="wrap">
          <Text
            textStyle="small-regular"
            color={comingSoon ? 'gray.300' : 'gray.500'}
          >
            {label}
          </Text>
          {comingSoon && (
            <Badge size="xs" variant="subtle" colorPalette="gray">
              Coming soon
            </Badge>
          )}
          {changed && (
            <Badge size="xs" variant="subtle" colorPalette="orange">
              {changedLabel}
            </Badge>
          )}
        </Flex>
        <Flex gap=".5rem" align="center">
          <Text textStyle="tiny-regular" color="gray.300">
            {baseText}
          </Text>
          {changed && (
            <Button
              size="2xs"
              variant="plain"
              color="primary.300"
              px="0"
              h="auto"
              onClick={onReset}
            >
              Reset
            </Button>
          )}
        </Flex>
        {error && (
          <Text textStyle="tiny-regular" color="error.300">
            {error}
          </Text>
        )}
      </Box>
      <Box flexShrink={0}>{children}</Box>
    </Flex>
  );
}
