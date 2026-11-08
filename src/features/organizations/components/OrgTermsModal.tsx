import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, Flex, Portal, Text } from '@chakra-ui/react';
import SectionLoader from '@/components/common/SectionLoader';
import { CustomTextArea } from '@/components/input';
import { useGetPlanCatalog } from '@/features/billing/api';
import { EntitlementsEditor } from '@/features/billing/components/entitlements/EntitlementsEditor';
import {
  changesBetween,
  fromRows,
  parseDraft,
  toDraft,
  withOverrides,
  type EntitlementsDraft,
} from '@/features/billing/components/entitlements/draft';
import type { IOrgEntitlements } from '@/shared/interface/plan-entitlements';
import { useUpdateOrganizationEntitlements } from '../api/query';

interface OrgTermsModalProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  data?: IOrgEntitlements;
  planName: (tier?: string | null) => string;
}

const NOTE_MAX = 2000;

/**
 * Terms agreed with one business, laid over its plan. Each value starts at
 * what it has now; Reset puts it back to the plan's.
 */
export function OrgTermsModal({
  open,
  onClose,
  orgId,
  data,
  planName,
}: OrgTermsModalProps) {
  const { data: catalogData, isPending: catalogLoading } = useGetPlanCatalog({
    enabled: open,
  });
  const catalog = catalogData?.data;
  const update = useUpdateOrganizationEntitlements();

  const plan = data ? planName(data.planOnFile) : 'its plan';
  const { base, initial } = useMemo(() => {
    if (!data) return {};
    const fromPlan = fromRows(data.plan);
    // Terms agreed for another plan are not carried over: saving starts afresh.
    const current =
      data.terms.agreedFor && !data.terms.stale
        ? withOverrides(fromPlan, data.terms.overrides)
        : fromPlan;
    return { base: fromPlan, initial: current };
  }, [data]);
  const savedNote = data?.terms.note ?? '';

  const [draft, setDraft] = useState<EntitlementsDraft | null>(null);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setDraft(initial ? toDraft(initial) : null);
    setNote(savedNote);
    setErrors({});
  }, [open, initial, savedNote]);

  const parsed = draft ? parseDraft(draft) : undefined;
  const pending =
    parsed?.ok && initial && base
      ? changesBetween(initial, parsed.value, base)
      : undefined;
  const noteChanged = note.trim() !== savedNote.trim();
  const canSave = Boolean(pending?.count) || noteChanged;

  const save = () => {
    if (!draft) return;
    const result = parseDraft(draft);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    if (!canSave || !pending) return;
    update.mutate(
      {
        id: orgId,
        payload: {
          ...pending.changes,
          ...(noteChanged ? { note: note.trim() || null } : {}),
        },
      },
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
                Terms for this business
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.300" mt="1">
                Laid over {plan} for this business only. They apply while it is
                on {plan}: if it lapses or changes plan, they stop.
              </Text>
            </Dialog.Header>

            <Dialog.Body p={0}>
              {data?.terms.stale && (
                <Box
                  bg="warning.50"
                  rounded=".5rem"
                  px=".75rem"
                  py=".625rem"
                  mb="1rem"
                >
                  <Text textStyle="tiny-regular" color="secondary.500">
                    The terms on file were agreed for{' '}
                    {planName(data.terms.agreedFor)}. Saving sets new terms for{' '}
                    {plan}, starting from the plan; the old ones are replaced.
                  </Text>
                </Box>
              )}

              {catalogLoading || !draft ? (
                <SectionLoader />
              ) : !catalog || !base ? (
                <Text textStyle="small-regular" color="error.300">
                  Couldn't load the plan catalog. Close this and try again.
                </Text>
              ) : (
                <Flex direction="column" gap="1.5rem">
                  <CustomTextArea
                    label="What was agreed (back office only)"
                    placeholder="e.g. ₦80,000 a month, billed quarterly; 50 users"
                    name="note"
                    rows={2}
                    value={note}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNote(e.target.value.slice(0, NOTE_MAX))
                    }
                    helperText="The business never sees this."
                  />
                  <EntitlementsEditor
                    catalog={catalog}
                    base={base}
                    baseLabel={plan}
                    changedLabel="Agreed"
                    draft={draft}
                    onChange={(next) => {
                      setDraft(next);
                      setErrors({});
                    }}
                    errors={errors}
                  />
                </Flex>
              )}
            </Dialog.Body>

            <Dialog.Footer p={0} mt="1.5rem" gap=".75rem">
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
                disabled={!canSave && parsed?.ok !== false}
                loading={update.isPending}
                loadingText="Saving…"
                onClick={save}
              >
                Save terms
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
