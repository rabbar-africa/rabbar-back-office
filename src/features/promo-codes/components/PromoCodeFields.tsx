import type { ReactNode } from 'react';
import {
  Box,
  Flex,
  RadioCard,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  CustomInput,
  CustomNumberInput,
  CustomSelect,
  CustomSwitch,
  CustomTextArea,
} from '@/components/input';
import type { IPlan } from '@/features/organizations/api/types';
import type {
  PlanTier,
  PromoDiscountType,
} from '@/shared/interface/promo-code';
import { formatAmount } from '@/utils/format-number';
import { PROMO_TYPE_OPTIONS, describePromo, type PlanNames } from '../data';
import type { PromoCodeFormik } from './usePromoCodeForm';

interface PromoCodeFieldsProps {
  formik: PromoCodeFormik;
  /** Code and type are read-only once a promo code exists. */
  isEdit?: boolean;
  /** Paid plans only — Starter is never offered. */
  plans: IPlan[];
  planNames?: PlanNames;
  plansLoading?: boolean;
  /** A 400 from the API, shown above the actions. */
  serverError?: string | null;
}

const onlyDigits = (value: string) => value.replace(/\D/g, '');

/**
 * Every field of the create and edit forms. The parent owns the formik
 * instance (see usePromoCodeForm) and the submit/cancel buttons.
 */
export function PromoCodeFields({
  formik,
  isEdit = false,
  plans,
  planNames,
  plansLoading,
  serverError,
}: PromoCodeFieldsProps) {
  const { values, errors, initialValues } = formik;
  const type = values.type;
  const typeOption = PROMO_TYPE_OPTIONS.find((o) => o.value === type);

  const planOptions = plans.map((plan) => ({
    label: `${plan.name} — ${formatAmount(Number(plan.monthlyPrice), plan.currency)}/month`,
    value: plan.tier,
  }));
  const planError =
    typeof errors.planTiers === 'string' ? errors.planTiers : undefined;

  const handleTypeChange = (next: PromoDiscountType) =>
    formik.setValues((prev) => ({
      ...prev,
      type: next,
      value: '',
      // A free-months code names exactly one plan.
      planTiers:
        next === 'FREE_MONTHS' ? prev.planTiers.slice(0, 1) : prev.planTiers,
    }));

  const canPreview =
    Number(values.durationMonths) > 0 &&
    (type === 'FREE_MONTHS'
      ? values.planTiers.length === 1
      : Number(values.value) > 0);

  const capLocked = isEdit && initialValues.maxRedemptions !== '';
  const startLocked = isEdit && initialValues.startsAt !== '';
  const expiryLocked = isEdit && initialValues.expiresAt !== '';

  return (
    <Stack gap="1.75rem">
      {/* ── Code ─────────────────────────────────────────────────────── */}
      <FieldGroup title="Code">
        <Stack gap="1rem">
          {isEdit ? (
            <ReadOnlyField
              label="Code"
              value={values.code}
              helper="Codes can't be renamed once created."
              mono
            />
          ) : (
            <CustomInput
              label="Code"
              required
              placeholder="e.g. WELCOME3"
              error={errors.code}
              helperText="3–32 letters, numbers, - or _. Saved in capitals."
              inputProps={{
                name: 'code',
                value: values.code,
                autoComplete: 'off',
                onChange: (e) =>
                  formik.setFieldValue('code', e.target.value.toUpperCase()),
              }}
            />
          )}
          <CustomTextArea
            label="Description"
            placeholder="e.g. 3 months free for new signups"
            name="description"
            rows={2}
            value={values.description}
            onChange={formik.handleChange}
            error={errors.description}
          />
        </Stack>
      </FieldGroup>

      {/* ── Discount ─────────────────────────────────────────────────── */}
      <FieldGroup title="Discount">
        <Stack gap="1rem">
          {isEdit ? (
            <ReadOnlyField
              label="Discount type"
              value={typeOption?.title ?? type}
              helper={`${typeOption?.description ?? ''} The type can't be changed once created.`}
            />
          ) : (
            <Box>
              <FieldLabel>Discount type</FieldLabel>
              <RadioCard.Root
                value={type}
                onValueChange={(e) =>
                  e.value && handleTypeChange(e.value as PromoDiscountType)
                }
                variant="outline"
              >
                <SimpleGrid columns={{ base: 1, md: 3 }} gap=".75rem">
                  {PROMO_TYPE_OPTIONS.map((option) => (
                    <RadioCard.Item
                      key={option.value}
                      value={option.value}
                      cursor="pointer"
                      rounded="10px"
                      borderWidth="1px"
                      borderColor="gray.50"
                      boxShadow="none"
                      _checked={{
                        borderColor: 'primary.300',
                        bg: 'primary.50',
                      }}
                    >
                      <RadioCard.ItemHiddenInput />
                      <RadioCard.ItemControl px="1rem" py=".75rem">
                        <Box flex="1">
                          <RadioCard.ItemText
                            textStyle="small-semibold"
                            color="gray.500"
                          >
                            {option.title}
                          </RadioCard.ItemText>
                          <RadioCard.ItemDescription
                            textStyle="tiny-regular"
                            color="gray.300"
                            mt=".25rem"
                          >
                            {option.description}
                          </RadioCard.ItemDescription>
                        </Box>
                        <RadioCard.ItemIndicator />
                      </RadioCard.ItemControl>
                    </RadioCard.Item>
                  ))}
                </SimpleGrid>
              </RadioCard.Root>
              {errors.type && (
                <Text fontSize=".625rem" color="error.300" mt=".25rem">
                  {errors.type}
                </Text>
              )}
            </Box>
          )}

          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
            {type === 'PERCENT' && (
              <CustomNumberInput
                label="% off"
                required
                placeholder="e.g. 50"
                min={0}
                max={100}
                allowNegative={false}
                value={values.value}
                onValueChange={(raw) => formik.setFieldValue('value', raw)}
                error={errors.value}
                helperText="Between 1 and 100. Taken off each discounted payment."
              />
            )}
            {type === 'FIXED' && (
              <CustomNumberInput
                label="₦ off each month"
                required
                placeholder="e.g. 5,000"
                allowNegative={false}
                value={values.value}
                onValueChange={(raw) => formik.setFieldValue('value', raw)}
                error={errors.value}
                helperText="If it's more than the plan price, that month is free."
              />
            )}
            <CustomInput
              label={
                type === 'FREE_MONTHS'
                  ? 'Months free'
                  : 'Number of monthly payments discounted'
              }
              required
              placeholder="e.g. 3"
              error={errors.durationMonths}
              helperText="1 to 36."
              inputProps={{
                name: 'durationMonths',
                value: values.durationMonths,
                inputMode: 'numeric',
                onChange: (e) =>
                  formik.setFieldValue(
                    'durationMonths',
                    onlyDigits(e.target.value)
                  ),
              }}
            />
          </SimpleGrid>

          {type === 'FREE_MONTHS' ? (
            <CustomSelect
              label="Plan given free"
              required
              placeholder="Select a plan"
              loading={plansLoading}
              options={planOptions}
              value={values.planTiers.length ? [values.planTiers[0]] : []}
              onChange={(d: { value?: string[] }) =>
                formik.setFieldValue(
                  'planTiers',
                  d?.value?.[0] ? [d.value[0] as PlanTier] : []
                )
              }
              error={planError}
              helperText="The organization is put on this plan for the free months."
            />
          ) : (
            <CustomSelect
              label="Plans"
              multiple
              placeholder="All paid plans"
              loading={plansLoading}
              options={planOptions}
              value={values.planTiers}
              onChange={(tiers?: string[]) =>
                formik.setFieldValue('planTiers', tiers ?? [])
              }
              error={planError}
              helperText="Leave empty to apply to every paid plan. Starter is free, so it's never offered."
            />
          )}

          {canPreview && (
            <Box bg="primary.50" rounded=".5rem" px=".875rem" py=".625rem">
              <Text textStyle="small-regular" color="primary.300">
                Organizations get:{' '}
                <Text as="span" fontWeight="600">
                  {describePromo(
                    {
                      type,
                      value: values.value || '0',
                      durationMonths: Number(values.durationMonths),
                      planTiers: values.planTiers,
                    },
                    planNames
                  )}
                </Text>
              </Text>
            </Box>
          )}
        </Stack>
      </FieldGroup>

      {/* ── Who can use it ───────────────────────────────────────────── */}
      <FieldGroup title="Who can use it">
        <Stack gap="1.25rem">
          <CustomInput
            label="Maximum uses"
            placeholder="Unlimited"
            error={errors.maxRedemptions}
            helperText={
              capLocked
                ? 'Total organizations that can use it. Can be changed but not removed.'
                : 'Total organizations that can use it. Leave blank for unlimited.'
            }
            inputProps={{
              name: 'maxRedemptions',
              value: values.maxRedemptions,
              inputMode: 'numeric',
              onChange: (e) =>
                formik.setFieldValue(
                  'maxRedemptions',
                  onlyDigits(e.target.value)
                ),
            }}
          />

          <ToggleField
            label="New organizations only"
            helper="Only organizations that have never paid for a subscription can use it."
            checked={values.newOrgsOnly}
            onChange={(checked) => formik.setFieldValue('newOrgsOnly', checked)}
          />

          <ToggleField
            label="Apply automatically to every new signup"
            helper="New organizations get this code at signup without typing anything. Only one code can have this on — turning it on here turns it off on any other code."
            checked={values.autoApplyOnSignup}
            onChange={(checked) =>
              formik.setFieldValue('autoApplyOnSignup', checked)
            }
          />
        </Stack>
      </FieldGroup>

      {/* ── When ─────────────────────────────────────────────────────── */}
      <FieldGroup title="When">
        <Stack gap="1.25rem">
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
            <CustomInput
              label="Starts on"
              type="date"
              error={errors.startsAt}
              helperText={
                startLocked
                  ? 'Can be moved but not removed.'
                  : 'Optional. Leave blank to start right away.'
              }
              inputProps={{
                name: 'startsAt',
                value: values.startsAt,
                max: values.expiresAt || undefined,
                onChange: formik.handleChange,
              }}
            />
            <CustomInput
              label="Expires on"
              type="date"
              error={errors.expiresAt}
              helperText={
                expiryLocked
                  ? 'Can be moved but not removed. Works until the end of this day.'
                  : 'Optional. Works until the end of this day. Blank = never expires.'
              }
              inputProps={{
                name: 'expiresAt',
                value: values.expiresAt,
                min: values.startsAt || undefined,
                onChange: formik.handleChange,
              }}
            />
          </SimpleGrid>

          <ToggleField
            label="Active"
            helper="Inactive codes can't be used and aren't applied to new signups."
            checked={values.isActive}
            onChange={(checked) => formik.setFieldValue('isActive', checked)}
          />

          {values.autoApplyOnSignup && !values.isActive && (
            <Notice tone="warning">
              This code is set to apply to new signups, but it's inactive — new
              organizations won't get it until it's turned back on.
            </Notice>
          )}
        </Stack>
      </FieldGroup>

      {serverError && <Notice tone="error">{serverError}</Notice>}
    </Stack>
  );
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Text
        textStyle="small-semibold"
        color="gray.500"
        pb=".5rem"
        mb="1rem"
        borderBottomWidth="1px"
        borderColor="gray.50"
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Text textStyle="tiny-semibold" color="gray.300" mb=".625rem">
      {children}
    </Text>
  );
}

function ReadOnlyField({
  label,
  value,
  helper,
  mono,
}: {
  label: string;
  value: string;
  helper?: string;
  mono?: boolean;
}) {
  return (
    <Box>
      <FieldLabel>{label}</FieldLabel>
      <Text
        textStyle="small-semibold"
        color="gray.500"
        letterSpacing={mono ? '0.5px' : undefined}
      >
        {value}
      </Text>
      {helper && (
        <Text fontSize=".625rem" color="gray.300" mt=".25rem">
          {helper}
        </Text>
      )}
    </Box>
  );
}

function ToggleField({
  label,
  helper,
  checked,
  onChange,
}: {
  label: string;
  helper: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Flex direction="column" gap=".25rem">
      <CustomSwitch
        checked={checked}
        onCheckedChange={(e: { checked: boolean }) => onChange(e.checked)}
      >
        <Text textStyle="small-regular" color="gray.500">
          {label}
        </Text>
      </CustomSwitch>
      <Text fontSize=".6875rem" color="gray.300" pl="2.75rem">
        {helper}
      </Text>
    </Flex>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: 'warning' | 'error';
  children: ReactNode;
}) {
  const palette =
    tone === 'error'
      ? { bg: 'error.50', color: 'error.300' }
      : { bg: 'warning.50', color: 'secondary.500' };
  return (
    <Box bg={palette.bg} rounded=".5rem" px=".875rem" py=".625rem">
      <Text textStyle="small-regular" color={palette.color}>
        {children}
      </Text>
    </Box>
  );
}
