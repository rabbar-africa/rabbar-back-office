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
import {
  subscriptionPaymentMethodLabel,
  subscriptionStatusLabel,
} from '@/shared/constants/subscription';
import type { ISubscriptionPayment } from '../../api/types';
import {
  useGetOrganizationSubscription,
  useCancelSubscription,
  useReactivateSubscription,
  useGetPlans,
} from '../../api/query';
import { AddSubscriptionPaymentModal } from '../AddSubscriptionPaymentModal';
import { ChangePlanModal } from '../ChangePlanModal';

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
    cell: ({ row }) => {
      const { amount, discountAmount, currency } = row.original;
      const discount = Number(discountAmount ?? 0);
      return (
        <Box>
          <Text>{formatAmount(Number(amount ?? 0), currency)}</Text>
          {discount > 0 && (
            <Text fontSize=".75rem" color="success.300">
              {formatAmount(discount, currency)} discount
            </Text>
          )}
        </Box>
      );
    },
  },
  {
    id: 'period',
    header: 'Period',
    cell: ({ row }) =>
      `${moment(row.original.periodStart).format('DD MMM YYYY')} – ${moment(
        row.original.periodEnd
      ).format('DD MMM YYYY')}`,
  },
  {
    accessorKey: 'method',
    header: 'Method',
    cell: ({ getValue }) => subscriptionPaymentMethodLabel(getValue()),
  },
  {
    accessorKey: 'reference',
    header: 'Reference',
    cell: ({ getValue }) => (getValue() as string) || '—',
  },
];

export function OrgSubscriptionTab() {
  const { id } = useParams<{ id: string }>();
  const [payOpen, setPayOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data, isPending } = useGetOrganizationSubscription(id!);
  const subscription = data?.data;
  // Only needed to name a pending (scheduled) plan; cached across the app.
  const { data: plansData } = useGetPlans({
    enabled: Boolean(subscription?.pendingPlanId),
  });
  const pendingPlan = plansData?.data?.find(
    (plan) => plan.id === subscription?.pendingPlanId
  );

  const cancelMutation = useCancelSubscription();
  const reactivateMutation = useReactivateSubscription();

  if (isPending) return <SectionLoader />;

  const status = subscription?.status?.toLowerCase() ?? '';
  const isCancelled = CANCELLED_STATES.includes(status);
  const plan = subscription?.plan;
  const isPaidPlan = Number(plan?.monthlyPrice ?? 0) > 0;

  const atPeriodEnd = !subscription
    ? '—'
    : subscription.cancelAtPeriodEnd
      ? 'Cancels — drops to Starter'
      : subscription.pendingPlanId
        ? `Switches to ${pendingPlan?.name ?? 'another plan'}`
        : !isPaidPlan
          ? '—'
          : subscription.autoRenew
            ? 'Renews automatically (saved card)'
            : 'Renews when paid';

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
        ...(subscription.status === 'PAST_DUE' && subscription.pastDueSince
          ? [
              {
                label: 'Payment Due Since',
                value: moment(subscription.pastDueSince).format('DD MMM YYYY'),
              },
            ]
          : []),
        { label: 'At Period End', value: atPeriodEnd },
        {
          label: 'Auto-renew',
          value: !isPaidPlan ? '—' : subscription.autoRenew ? 'On' : 'Off',
        },
        ...((subscription.failedChargeAttempts ?? 0) > 0
          ? [
              {
                label: 'Failed Card Charges',
                value: subscription.nextChargeAttemptAt
                  ? `${subscription.failedChargeAttempts} — next try ${moment(
                      subscription.nextChargeAttemptAt
                    ).format('DD MMM YYYY')}`
                  : String(subscription.failedChargeAttempts),
              },
            ]
          : []),
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
            {subscription && (
              <Status name={subscriptionStatusLabel(subscription.status)} />
            )}
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

            {subscription && (
              <Button variant="outline" onClick={() => setPlanOpen(true)}>
                Change Plan
              </Button>
            )}

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

      <ChangePlanModal
        open={planOpen}
        onOpenChange={({ open }) => setPlanOpen(open)}
        orgId={id!}
        currentTier={plan?.tier}
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
        note="The subscription is marked cancelled right away and the organization drops to the free Starter plan until it's reactivated or a new payment is recorded."
        confirmText="Yes, Cancel"
        cancelText="Keep Subscription"
        variant="danger"
      />
    </Flex>
  );
}
