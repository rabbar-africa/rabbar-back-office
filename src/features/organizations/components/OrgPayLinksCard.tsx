import { useState } from 'react';
import { Badge, Box, Button, Flex, Text } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import ConsentDialog from '@/components/common/ConsentDialog';
import { CustomTable } from '@/components/table';
import { toaster } from '@/components/ui';
import { useClipboard } from '@/hooks/useClipboard';
import { formatAmount } from '@/utils/format-number';
import {
  useCancelPayLink,
  useCheckPayLink,
  useGetPayLinks,
} from '../api/query';
import type { IPayLink, IPayLinkCheckout, PayLinkState } from '../api/types';

const STATE_BADGE: Record<PayLinkState, { label: string; palette: string }> = {
  OPEN: { label: 'Open', palette: 'blue' },
  PAID: { label: 'Paid', palette: 'green' },
  EXPIRED: { label: 'Expired', palette: 'gray' },
  CANCELLED: { label: 'Cancelled', palette: 'gray' },
};

/** A Paystack attempt in words: most never get past opening the page. */
function attemptLabel(checkout: IPayLinkCheckout): string {
  switch (checkout.status) {
    case 'SUCCESS':
      return `Paid${checkout.channel ? ` by ${checkout.channel.replace(/_/g, ' ')}` : ''}`;
    case 'PENDING':
      return 'Opened, not paid yet';
    case 'FAILED':
      return 'Payment failed';
    case 'ABANDONED':
      return 'Left without paying';
    default:
      return checkout.status;
  }
}

interface OrgPayLinksCardProps {
  orgId: string;
}

/**
 * Payment links made for this business, newest first. Shown once there is
 * one; the button that makes them is with the subscription's actions.
 */
export function OrgPayLinksCard({ orgId }: OrgPayLinksCardProps) {
  const { data } = useGetPayLinks(orgId);
  const links = data?.data ?? [];
  const { copy } = useClipboard();
  const check = useCheckPayLink();
  const cancel = useCancelPayLink();
  const [cancelling, setCancelling] = useState<IPayLink | null>(null);

  if (!links.length) return null;

  const copyLink = (link: IPayLink) =>
    copy(link.url).then((result) =>
      toaster.create(
        result === false
          ? { description: "Couldn't copy the link", type: 'error' }
          : { description: 'Link copied', type: 'success' }
      )
    );

  const checkPayment = (link: IPayLink) =>
    check.mutate(
      { id: orgId, linkId: link.id },
      {
        onSuccess: ({ data: result }) =>
          toaster.create(
            result.confirmed > 0
              ? {
                  description: `Payment confirmed: the business is on ${link.plan.name}`,
                  type: 'success',
                }
              : {
                  description:
                    'Paystack has no completed payment for this link yet. A bank transfer can take a few minutes.',
                  type: 'info',
                }
          ),
      }
    );

  const columns: ColumnDef<IPayLink, any>[] = [
    {
      id: 'plan',
      header: 'Plan',
      cell: ({ row }) => (
        <Box>
          <Text>{row.original.plan.name}</Text>
          <Text fontSize=".75rem" color="gray.400">
            {row.original.billingInterval === 'ANNUAL' ? '1 year' : '1 month'}
            {row.original.promoCode ? ` · ${row.original.promoCode}` : ''}
            {` · then ${row.original.returnTo === 'WEB' ? 'web app' : 'WhatsApp'}`}
          </Text>
        </Box>
      ),
    },
    {
      accessorKey: 'state',
      header: 'Status',
      cell: ({ row }) => {
        const badge = STATE_BADGE[row.original.state];
        return (
          <Badge size="sm" variant="subtle" colorPalette={badge.palette}>
            {badge.label}
          </Badge>
        );
      },
    },
    {
      id: 'dates',
      header: 'Made / works until',
      cell: ({ row }) => (
        <Box>
          <Text>{moment(row.original.createdAt).format('DD MMM YYYY')}</Text>
          <Text fontSize=".75rem" color="gray.400">
            {row.original.paidAt
              ? `Paid ${moment(row.original.paidAt).format('DD MMM YYYY')}`
              : row.original.cancelledAt
                ? `Cancelled ${moment(row.original.cancelledAt).format('DD MMM YYYY')}`
                : `Until ${moment(row.original.expiresAt).format('DD MMM YYYY')}`}
          </Text>
        </Box>
      ),
    },
    {
      id: 'attempts',
      header: 'What happened',
      cell: ({ row }) => {
        const attempts = row.original.checkouts ?? [];
        if (!attempts.length) return 'Not opened yet';
        const [last] = attempts;
        return (
          <Box>
            <Text>{attemptLabel(last)}</Text>
            <Text fontSize=".75rem" color="gray.400">
              {formatAmount(last.amount)} ·{' '}
              {attempts.length === 1
                ? 'opened once'
                : `opened ${attempts.length} times`}
            </Text>
          </Box>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        row.original.state === 'OPEN' ? (
          <Flex gap=".5rem" justify="flex-end" wrap="wrap">
            <Button
              size="xs"
              variant="outline"
              onClick={() => copyLink(row.original)}
            >
              Copy link
            </Button>
            {(row.original.checkouts ?? []).length > 0 && (
              <Button
                size="xs"
                variant="outline"
                loading={
                  check.isPending && check.variables?.linkId === row.original.id
                }
                onClick={() => checkPayment(row.original)}
              >
                Check payment
              </Button>
            )}
            <Button
              size="xs"
              variant="outline"
              color="error.300"
              borderColor="error.300"
              _hover={{ bg: 'error.50' }}
              onClick={() => setCancelling(row.original)}
            >
              Cancel
            </Button>
          </Flex>
        ) : null,
    },
  ];

  return (
    <Box>
      <Text fontSize="1rem" fontWeight="600">
        Payment Links
      </Text>
      <Text textStyle="small-regular" color="gray.400" mb=".75rem">
        Each link opens a fresh Paystack payment. Use Check payment when they
        say they have paid but the plan has not changed.
      </Text>
      <CustomTable
        data={links}
        columns={columns}
        NoDataText="No payment links yet"
      />

      <ConsentDialog
        open={Boolean(cancelling)}
        onOpenChange={({ open }) => !open && setCancelling(null)}
        handleSubmit={() =>
          cancelling &&
          cancel.mutate(
            { id: orgId, linkId: cancelling.id },
            { onSuccess: () => setCancelling(null) }
          )
        }
        isLoading={cancel.isPending}
        heading="Cancel this payment link?"
        note={`The ${cancelling?.plan.name ?? ''} link stops working: anyone who opens it is told to ask for a new one. A payment already started on Paystack can still go through.`}
        confirmText="Yes, Cancel Link"
        cancelText="Keep Link"
        variant="danger"
      />
    </Box>
  );
}
