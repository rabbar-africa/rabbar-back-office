import { useState } from 'react';
import { Box, Button, Flex, SimpleGrid, Text } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import Status from '@/components/common/Status';
import SectionLoader from '@/components/common/SectionLoader';
import ConsentDialog from '@/components/common/ConsentDialog';
import { CustomTable } from '@/components/table';
import { formatAmount } from '@/utils/format-number';
import type { ISubscriptionPayment } from '../../api/types';
import {
  useGetOrganizationSubscription,
  useCancelSubscription,
  useReactivateSubscription,
} from '../../api/query';
import { AddSubscriptionPaymentModal } from '../AddSubscriptionPaymentModal';

const CANCELLED_STATES = ['cancelled', 'canceled', 'expired', 'inactive'];

const paymentColumns: ColumnDef<ISubscriptionPayment, any>[] = [
  {
    accessorKey: 'paidAt',
    header: 'Paid At',
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? moment(value).format('DD MMM YYYY') : '—';
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) =>
      formatAmount(Number(row.original.amount ?? 0), row.original.currency),
  },
  {
    id: 'period',
    header: 'Period',
    cell: ({ row }) =>
      `${moment(row.original.periodStart).format('DD MMM YYYY')} – ${moment(
        row.original.periodEnd
      ).format('DD MMM YYYY')}`,
  },
  { accessorKey: 'method', header: 'Method' },
  {
    accessorKey: 'reference',
    header: 'Reference',
    cell: ({ getValue }) => (getValue() as string) || '—',
  },
];

export function OrgSubscriptionTab() {
  const { id } = useParams<{ id: string }>();
  const [payOpen, setPayOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data, isPending } = useGetOrganizationSubscription(id!);
  const subscription = data?.data;

  const cancelMutation = useCancelSubscription();
  const reactivateMutation = useReactivateSubscription();

  if (isPending) return <SectionLoader />;

  const status = subscription?.status?.toLowerCase() ?? '';
  const isCancelled = CANCELLED_STATES.includes(status);
  const plan = subscription?.plan;

  const rows = subscription
    ? [
        { label: 'Plan', value: plan?.name || plan?.tier || '—' },
        {
          label: 'Amount',
          value: formatAmount(Number(plan?.monthlyPrice ?? 0), plan?.currency),
        },
        {
          label: 'Current Period',
          value: subscription.currentPeriodStart
            ? `${moment(subscription.currentPeriodStart).format(
                'DD MMM YYYY'
              )} – ${moment(subscription.currentPeriodEnd).format(
                'DD MMM YYYY'
              )}`
            : '—',
        },
        {
          label: 'Started',
          value: subscription.startedAt
            ? moment(subscription.startedAt).format('DD MMM YYYY')
            : '—',
        },
        {
          label: 'Renews / Ends',
          value: subscription.currentPeriodEnd
            ? moment(subscription.currentPeriodEnd).format('DD MMM YYYY')
            : '—',
        },
        {
          label: 'Cancelled At',
          value: subscription.cancelledAt
            ? moment(subscription.cancelledAt).format('DD MMM YYYY')
            : '—',
        },
      ]
    : [];

  return (
    <Flex direction="column" gap="1.5rem">
      <Box bg="white" border="1px solid #EBEBEB" rounded="lg" p="1.5rem">
        <Flex
          justify="space-between"
          align="center"
          mb="1.5rem"
          wrap="wrap"
          gap="1rem"
        >
          <Flex align="center" gap=".75rem">
            <Text fontSize="1.125rem" fontWeight="600">
              Subscription
            </Text>
            {subscription && <Status name={subscription.status} />}
          </Flex>

          <Flex gap=".75rem" wrap="wrap">
            <Button
              bg="primary.500"
              color="white"
              _hover={{ bg: 'primary.600' }}
              onClick={() => setPayOpen(true)}
            >
              Add Payment
            </Button>

            {subscription && !isCancelled && (
              <Button
                variant="outline"
                color="error.300"
                borderColor="error.300"
                _hover={{ bg: 'error.50' }}
                onClick={() => setCancelOpen(true)}
              >
                Cancel Subscription
              </Button>
            )}

            {subscription && isCancelled && (
              <Button
                variant="outline"
                color="success.300"
                borderColor="success.300"
                _hover={{ bg: 'success.50' }}
                loading={reactivateMutation.isPending}
                onClick={() => reactivateMutation.mutate(id!)}
              >
                Reactivate
              </Button>
            )}
          </Flex>
        </Flex>

        {subscription ? (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="1.25rem">
            {rows.map((row) => (
              <Box key={row.label}>
                <Text fontSize=".8125rem" color="gray.500">
                  {row.label}
                </Text>
                <Text fontSize=".9375rem" fontWeight="500" mt=".25rem">
                  {row.value}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Flex direction="column" align="center" gap=".5rem" py="2.5rem">
            <Text color="gray.500">
              This organization has no subscription yet.
            </Text>
            <Text fontSize=".875rem" color="gray.400">
              Record a manual payment to start one.
            </Text>
          </Flex>
        )}
      </Box>

      {subscription && (
        <Box>
          <Text fontSize="1rem" fontWeight="600" mb=".75rem">
            Payment History
          </Text>
          <CustomTable
            data={subscription.payments ?? []}
            columns={paymentColumns}
            NoDataText="No payments recorded yet"
          />
        </Box>
      )}

      <AddSubscriptionPaymentModal
        open={payOpen}
        onOpenChange={({ open }) => setPayOpen(open)}
        orgId={id!}
      />

      <ConsentDialog
        open={cancelOpen}
        onOpenChange={({ open }) => setCancelOpen(open)}
        handleSubmit={() =>
          cancelMutation.mutate(id!, {
            onSuccess: () => setCancelOpen(false),
          })
        }
        isLoading={cancelMutation.isPending}
        heading="Cancel subscription?"
        note="This organization will lose access to paid features at the end of the current billing period."
        confirmText="Yes, Cancel"
        cancelText="Keep Subscription"
        variant="danger"
      />
    </Flex>
  );
}
