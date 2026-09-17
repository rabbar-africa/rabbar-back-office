import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import ConsentDialog from '@/components/common/ConsentDialog';
import type { IBillingRunSummary } from '@/shared/interface/billing';
import { useRunBilling } from '../api';

const SUMMARY_ROWS: Array<{ key: keyof IBillingRunSummary; label: string }> = [
  { key: 'reminders', label: 'Renewal reminders sent' },
  { key: 'renewed', label: 'Subscriptions renewed' },
  { key: 'retried', label: 'Saved-card charges retried' },
  { key: 'pastDue', label: 'Moved to payment due' },
  { key: 'expired', label: 'Expired (grace period over)' },
  {
    key: 'movedToStarter',
    label: 'Moved to Starter (cancelled or downgraded)',
  },
  { key: 'abandoned', label: 'Unfinished checkouts closed' },
  { key: 'errors', label: 'Errors' },
];

/**
 * Runs the daily billing job on demand (POST /back-office/subscriptions/run-billing)
 * and shows what it did.
 */
export function RunBillingButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [summary, setSummary] = useState<IBillingRunSummary | null>(null);
  const runBilling = useRunBilling();

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        flexShrink={0}
        loading={runBilling.isPending}
        onClick={() => setConfirmOpen(true)}
      >
        Run billing now
      </Button>

      <ConsentDialog
        open={confirmOpen}
        onOpenChange={({ open }) => setConfirmOpen(open)}
        variant="warning"
        heading="Run billing now?"
        note="This runs the daily billing job immediately: it sends renewal reminders, charges saved cards that are due, marks unpaid subscriptions as payment due, and expires subscriptions whose grace period has ended. It's safe to run more than once a day."
        confirmText="Yes, Run Billing"
        cancelText="Cancel"
        isLoading={runBilling.isPending}
        handleSubmit={() =>
          runBilling.mutate(undefined, {
            onSuccess: (response) => {
              setConfirmOpen(false);
              setSummary(response.data);
            },
          })
        }
      />

      <Dialog.Root
        placement="center"
        motionPreset="slide-in-bottom"
        open={Boolean(summary)}
        onOpenChange={({ open }) => !open && setSummary(null)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="26rem" p="2rem">
              <Dialog.Header p={0} mb="1.25rem">
                <Dialog.Title fontSize="1.125rem" fontWeight="600">
                  Billing run complete
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body p={0}>
                <Stack gap=".5rem">
                  {SUMMARY_ROWS.map(({ key, label }) => {
                    const value = summary?.[key] ?? 0;
                    const isError = key === 'errors' && value > 0;
                    return (
                      <Flex key={key} justify="space-between" gap="1rem">
                        <Text
                          textStyle="small-regular"
                          color={isError ? 'error.300' : 'gray.400'}
                        >
                          {label}
                        </Text>
                        <Text
                          textStyle="small-semibold"
                          color={isError ? 'error.300' : 'gray.500'}
                        >
                          {value}
                        </Text>
                      </Flex>
                    );
                  })}
                </Stack>
                {(summary?.errors ?? 0) > 0 && (
                  <Box
                    bg="error.50"
                    rounded=".5rem"
                    px=".75rem"
                    py=".5rem"
                    mt="1rem"
                  >
                    <Text textStyle="tiny-regular" color="error.300">
                      Some subscriptions couldn't be processed. Check the server
                      logs; the rest of the run completed.
                    </Text>
                  </Box>
                )}
              </Dialog.Body>
              <Dialog.Footer p={0} mt="1.5rem">
                <Button onClick={() => setSummary(null)}>Close</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
