import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  SimpleGrid,
  Text,
  chakra,
} from '@chakra-ui/react';
import moment from 'moment';
import { CustomInput, CustomSelect, CustomTextArea } from '@/components/input';
import {
  FREE_PLAN_TIER,
  isContactSalesTier,
} from '@/shared/constants/subscription';
import { planPriceLabel } from '@/features/billing/data';
import { useChangeSubscriptionPlan, useGetPlans } from '../api/query';
import type { ChangePlanPayload, PlanGrantEnd } from '../api/types';

interface ChangePlanModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  orgId: string;
  /** Tier the organization is on now, so it isn't offered as a choice. */
  currentTier?: string;
  /** Name of the plan this business's agreed terms are for, if in force. */
  termsFor?: string;
}

/** How long a paid plan is given for. Every paid change has an end date. */
const LENGTHS = [
  { value: '14d', label: '2 weeks', days: 14 },
  { value: '1m', label: '1 month', months: 1 },
  { value: '3m', label: '3 months', months: 3 },
  { value: '6m', label: '6 months', months: 6 },
  { value: '12m', label: '12 months', months: 12 },
  { value: 'date', label: 'Until a date…' },
] as const;
type LengthValue = (typeof LENGTHS)[number]['value'];

const WHEN_ENDS_OPTIONS: Array<{ value: PlanGrantEnd; label: string }> = [
  { value: 'starter', label: 'Move back to Starter' },
  { value: 'renew', label: 'Ask them to pay to renew' },
];

/** The API caps a plan given this way at two years (731 days). */
const MAX_DAYS = 731;

/**
 * Switch an organization's plan without taking a payment. A paid plan is
 * always given until an end date: the API records a ₦0 complimentary row in
 * the payments ledger, and when the time runs out the org either drops back
 * to Starter or is asked to pay. Starter is free and has no end date.
 */
export function ChangePlanModal({
  open,
  onOpenChange,
  orgId,
  currentTier,
  termsFor,
}: ChangePlanModalProps) {
  const { data: plansData, isPending: plansLoading } = useGetPlans({
    enabled: open,
  });
  // Enterprise is never on sale, but it is put on a business from here.
  const plans = (plansData?.data ?? []).filter(
    (plan) => plan.isActive || isContactSalesTier(plan.tier)
  );
  const changePlan = useChangeSubscriptionPlan();

  const [planTier, setPlanTier] = useState('');
  const [length, setLength] = useState<LengthValue>('1m');
  const [endsAt, setEndsAt] = useState('');
  const [whenEnds, setWhenEnds] = useState<PlanGrantEnd>('starter');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ plan?: string; endsAt?: string }>({});

  useEffect(() => {
    if (!open) {
      setPlanTier('');
      setLength('1m');
      setEndsAt('');
      setWhenEnds('starter');
      setNote('');
      setErrors({});
    }
  }, [open]);

  const options = plans
    .filter((plan) => plan.tier !== currentTier)
    .map((plan) => ({
      label: `${plan.name} — ${planPriceLabel(plan)}`,
      value: plan.tier,
    }));

  const selectedPlan = plans.find((plan) => plan.tier === planTier);
  const toFree = planTier === FREE_PLAN_TIER;
  const toContactSales = isContactSalesTier(planTier);
  // A plan priced 0 (Enterprise) has nothing to renew at, so it can only
  // fall back to Starter.
  const canRenew = Boolean(
    selectedPlan && Number(selectedPlan.monthlyPrice) > 0 && !toContactSales
  );
  const effectiveWhenEnds: PlanGrantEnd = canRenew ? whenEnds : 'starter';

  const minDate = moment().add(1, 'day').format('YYYY-MM-DD');
  const maxDate = moment().add(MAX_DAYS, 'days').format('YYYY-MM-DD');
  const endDate = previewEnd(length, endsAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTier) {
      setErrors({ plan: 'Choose the plan to switch to' });
      return;
    }

    const payload: ChangePlanPayload = {
      planTier,
      note: note.trim() || undefined,
    };

    if (!toFree) {
      if (length === 'date') {
        if (!endsAt) {
          setErrors({ endsAt: 'Choose the date the plan ends' });
          return;
        }
        if (endsAt < minDate || endsAt > maxDate) {
          setErrors({
            endsAt: 'Pick a date from tomorrow up to two years from now',
          });
          return;
        }
        payload.endsAt = endsAt;
      } else {
        const choice = LENGTHS.find((item) => item.value === length);
        if (choice && 'days' in choice) payload.durationDays = choice.days;
        if (choice && 'months' in choice)
          payload.durationMonths = choice.months;
      }
      payload.whenEnds = effectiveWhenEnds;
    }

    changePlan.mutate(
      { id: orgId, payload },
      { onSuccess: () => onOpenChange({ open: false }) }
    );
  };

  const endLabel = endDate?.format('ddd, DD MMM YYYY');
  const afterEnd =
    effectiveWhenEnds === 'renew'
      ? `they're asked to pay to renew ${selectedPlan?.name ?? 'the plan'}`
      : 'it moves back to Starter on its own, with no payment asked for';

  return (
    <Dialog.Root
      placement="center"
      open={open}
      onOpenChange={onOpenChange}
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="32rem" p="2rem">
            <Dialog.Header p={0} mb="1.5rem" display="block">
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                Change plan
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.300" mt="1">
                No payment is taken. To bill the organization for the new plan,
                record a payment instead.
              </Text>
            </Dialog.Header>

            <chakra.form onSubmit={handleSubmit} noValidate>
              <Dialog.Body p={0}>
                <Flex direction="column" gap="1rem">
                  <CustomSelect
                    label="New plan"
                    placeholder="Select a plan"
                    loading={plansLoading}
                    options={options}
                    value={planTier ? [planTier] : []}
                    onChange={(d: { value?: string[] }) => {
                      setPlanTier(d?.value?.[0] ?? '');
                      setErrors({});
                    }}
                    error={errors.plan}
                  />

                  {planTier && !toFree && (
                    <>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
                        <CustomSelect
                          label="For how long"
                          required
                          options={LENGTHS.map(({ value, label }) => ({
                            value,
                            label,
                          }))}
                          value={[length]}
                          onChange={(d: { value?: string[] }) => {
                            setLength((d?.value?.[0] as LengthValue) ?? '1m');
                            setErrors({});
                          }}
                        />
                        {length === 'date' ? (
                          <CustomInput
                            label="Ends on"
                            type="date"
                            required
                            error={errors.endsAt}
                            inputProps={{
                              name: 'endsAt',
                              value: endsAt,
                              min: minDate,
                              max: maxDate,
                              onChange: (
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                setEndsAt(e.target.value);
                                setErrors({});
                              },
                            }}
                          />
                        ) : (
                          <CustomInput
                            label="Ends on"
                            disabled
                            inputProps={{
                              name: 'endsOnPreview',
                              value: endLabel ?? '',
                              readOnly: true,
                            }}
                          />
                        )}
                      </SimpleGrid>

                      {canRenew && (
                        <CustomSelect
                          label="When it ends"
                          options={WHEN_ENDS_OPTIONS}
                          value={[whenEnds]}
                          onChange={(d: { value?: string[] }) =>
                            setWhenEnds(
                              (d?.value?.[0] as PlanGrantEnd) ?? 'starter'
                            )
                          }
                        />
                      )}
                    </>
                  )}

                  {planTier && (
                    <Box
                      bg={toFree ? 'warning.50' : 'primary.50'}
                      rounded=".5rem"
                      px=".75rem"
                      py=".625rem"
                    >
                      <Text
                        textStyle="tiny-regular"
                        color={toFree ? 'secondary.500' : 'primary.300'}
                      >
                        {toFree
                          ? 'Starter is free and has no end date. The current paid period is cleared and the organization moves to Starter right away.'
                          : `${selectedPlan?.name ?? 'The new plan'} starts now and runs ${
                              endLabel
                                ? `until ${endLabel}`
                                : 'until the date you pick'
                            }; then ${afterEnd}. A ₦0 complimentary entry is added to the payments ledger.${
                              toContactSales
                                ? ' To charge what was agreed, record it as a payment, then set its own terms under Plan & terms.'
                                : ''
                            }`}
                      </Text>
                    </Box>
                  )}

                  {planTier && termsFor && (
                    <Box
                      bg="warning.50"
                      rounded=".5rem"
                      px=".75rem"
                      py=".625rem"
                    >
                      <Text textStyle="tiny-regular" color="secondary.500">
                        The terms agreed for {termsFor} stop applying. They are
                        kept, and apply again only if the business goes back to{' '}
                        {termsFor} before new terms are set.
                      </Text>
                    </Box>
                  )}

                  <CustomTextArea
                    label="Note"
                    placeholder="Why the plan is changing (optional)"
                    name="note"
                    rows={3}
                    value={note}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNote(e.target.value)
                    }
                  />
                </Flex>
              </Dialog.Body>

              <Dialog.Footer p={0} mt="2rem" gap=".75rem">
                <Button
                  type="button"
                  variant="outlineSecondary"
                  onClick={() => onOpenChange({ open: false })}
                  disabled={changePlan.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="primary.500"
                  color="white"
                  _hover={{ bg: 'primary.600' }}
                  loading={changePlan.isPending}
                  loadingText="Changing…"
                >
                  Change plan
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

/**
 * The end date to show for a length. The current plan is never offered, so
 * time is never added on to what's left: it always counts from now.
 */
function previewEnd(length: LengthValue, endsAt: string) {
  if (length === 'date') {
    return endsAt ? moment(endsAt, 'YYYY-MM-DD') : null;
  }
  const choice = LENGTHS.find((item) => item.value === length);
  if (choice && 'days' in choice) return moment().add(choice.days, 'days');
  if (choice && 'months' in choice)
    return moment().add(choice.months, 'months');
  return null;
}
