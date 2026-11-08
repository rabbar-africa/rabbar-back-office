import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, Flex, Portal, Text } from '@chakra-ui/react';
import SectionLoader from '@/components/common/SectionLoader';
import type { IPlan } from '@/features/organizations/api/types';
import { useGetPlanCatalog, useUpdatePlanEntitlements } from '../api';
import { EntitlementsEditor } from './entitlements/EntitlementsEditor';
import {
  changesBetween,
  fromRows,
  parseDraft,
  toDraft,
  type EntitlementsDraft,
} from './entitlements/draft';

interface PlanEntitlementsModalProps {
  plan: IPlan | null;
  onClose: () => void;
}

/**
 * What a plan includes: its limits and features. Saved changes reach every
 * business on the plan within a minute, with no deploy.
 */
export function PlanEntitlementsModal({
  plan,
  onClose,
}: PlanEntitlementsModalProps) {
  const open = Boolean(plan);
  const { data: catalogData, isPending: catalogLoading } = useGetPlanCatalog({
    enabled: open,
  });
  const catalog = catalogData?.data;
  const update = useUpdatePlanEntitlements();

  const initial = useMemo(
    () =>
      plan?.features && plan.limits
        ? fromRows({ features: plan.features, limits: plan.limits })
        : undefined,
    [plan]
  );
  const base = plan && catalog?.defaults[plan.tier];

  const [draft, setDraft] = useState<EntitlementsDraft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setDraft(initial ? toDraft(initial) : null);
    setErrors({});
    setConfirming(false);
  }, [initial]);

  const parsed = draft ? parseDraft(draft) : undefined;
  const pending =
    parsed?.ok && initial && base
      ? changesBetween(initial, parsed.value, base)
      : undefined;

  const save = () => {
    if (!plan || !draft) return;
    const result = parseDraft(draft);
    if (!result.ok) {
      setErrors(result.errors);
      setConfirming(false);
      return;
    }
    if (!pending?.count) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    update.mutate(
      { id: plan.id, payload: pending.changes },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog.Root
      placement="center"
      size="lg"
      scrollBehavior="inside"
      open={open}
      onOpenChange={({ open: next }) => !next && onClose()}
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="44rem" p={{ base: '1.25rem', md: '2rem' }}>
            <Dialog.Header p={0} mb="1.25rem" display="block">
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                What {plan?.name ?? 'this plan'} includes
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.300" mt="1">
                Changes reach every business on {plan?.name ?? 'this plan'}{' '}
                within a minute. A business with its own agreed terms keeps
                them. Default is how the plan shipped.
              </Text>
            </Dialog.Header>

            <Dialog.Body p={0}>
              {catalogLoading || !draft ? (
                <SectionLoader />
              ) : !catalog || !base ? (
                <Text textStyle="small-regular" color="error.300">
                  Couldn't load the plan catalog. Close this and try again.
                </Text>
              ) : (
                <EntitlementsEditor
                  catalog={catalog}
                  base={base}
                  baseLabel="Default"
                  changedLabel="Changed"
                  draft={draft}
                  onChange={(next) => {
                    setDraft(next);
                    setErrors({});
                    setConfirming(false);
                  }}
                  errors={errors}
                />
              )}
            </Dialog.Body>

            <Dialog.Footer
              p={0}
              mt="1.5rem"
              gap=".75rem"
              flexDirection="column"
              alignItems="stretch"
            >
              {confirming && pending?.count ? (
                <Box bg="warning.50" rounded=".5rem" px=".75rem" py=".625rem">
                  <Text textStyle="tiny-regular" color="secondary.500">
                    {pending.count === 1
                      ? 'This change'
                      : `These ${pending.count} changes`}{' '}
                    will apply to every business on {plan?.name} within a
                    minute. Nothing they already have is deleted: a business
                    over a new limit just can't add more.
                  </Text>
                </Box>
              ) : null}
              <Flex gap=".75rem" justify="flex-end">
                <Button
                  type="button"
                  variant="outlineSecondary"
                  onClick={onClose}
                  disabled={update.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  bg="primary.500"
                  color="white"
                  _hover={{ bg: 'primary.600' }}
                  disabled={!pending?.count && parsed?.ok !== false}
                  loading={update.isPending}
                  loadingText="Saving…"
                  onClick={save}
                >
                  {confirming ? 'Yes, apply to everyone' : 'Save changes'}
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
