import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  Text,
  chakra,
} from '@chakra-ui/react';
import { CustomSelect, CustomTextArea } from '@/components/input';
import { FREE_PLAN_TIER } from '@/shared/constants/subscription';
import { formatAmount } from '@/utils/format-number';
import { useChangeSubscriptionPlan, useGetPlans } from '../api/query';

interface ChangePlanModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  orgId: string;
  /** Tier the organization is on now, so it isn't offered as a choice. */
  currentTier?: string;
}

/**
 * Switch an organization's plan without recording a payment. The API keeps
 * the current paid period for paid-to-paid moves and clears it on a move to
 * the free plan.
 */
export function ChangePlanModal({
  open,
  onOpenChange,
  orgId,
  currentTier,
}: ChangePlanModalProps) {
  const { data: plansData, isPending: plansLoading } = useGetPlans({
    enabled: open,
  });
  const plans = (plansData?.data ?? []).filter((plan) => plan.isActive);
  const changePlan = useChangeSubscriptionPlan();

  const [planTier, setPlanTier] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPlanTier('');
      setNote('');
      setError(null);
    }
  }, [open]);

  const options = plans
    .filter((plan) => plan.tier !== currentTier)
    .map((plan) => ({
      label:
        plan.tier === FREE_PLAN_TIER || Number(plan.monthlyPrice) <= 0
          ? `${plan.name} — Free`
          : `${plan.name} — ${formatAmount(Number(plan.monthlyPrice), plan.currency)}/month`,
      value: plan.tier,
    }));

  const toFree = planTier === FREE_PLAN_TIER;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTier) {
      setError('Choose the plan to switch to');
      return;
    }
    changePlan.mutate(
      { id: orgId, payload: { planTier, note: note.trim() || undefined } },
      { onSuccess: () => onOpenChange({ open: false }) }
    );
  };

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
          <Dialog.Content maxW="30rem" p="2rem">
            <Dialog.Header p={0} mb="1.5rem" display="block">
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                Change plan
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.300" mt="1">
                No payment is recorded. To bill the organization for the new
                plan, record a payment instead.
              </Text>
            </Dialog.Header>

            <chakra.form onSubmit={handleSubmit}>
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
                      setError(null);
                    }}
                    error={error ?? undefined}
                  />

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
                          ? 'The current paid period is cleared and the organization moves to the free plan right away.'
                          : 'The subscription becomes active on the new plan and keeps its current period end date.'}
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
