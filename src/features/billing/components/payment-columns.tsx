import { Box, Text } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import { subscriptionPaymentMethodLabel } from '@/shared/constants/subscription';
import type { ISubscriptionPaymentRecord } from '@/shared/interface/billing';
import { formatAmount } from '@/utils/format-number';
import { describePeriod, formatDate, recordedByName } from '../data';

export const paymentColumns: ColumnDef<ISubscriptionPaymentRecord, any>[] = [
  {
    accessorKey: 'paidAt',
    header: 'Paid',
    cell: ({ getValue }) => (
      <Text fontSize="12px" color="gray.400" whiteSpace="nowrap">
        {formatDate(getValue() as string)}
      </Text>
    ),
  },
  {
    id: 'organization',
    header: 'Organization',
    cell: ({ row }) => (
      <Box>
        <Text textStyle="small-semibold" color="gray.500" whiteSpace="nowrap">
          {row.original.organization?.name ?? '—'}
        </Text>
        <Text fontSize="11px" color="gray.300">
          {row.original.organization?.companyEmail || ''}
        </Text>
      </Box>
    ),
  },
  {
    id: 'plan',
    header: 'Plan',
    cell: ({ row }) => (
      <Text fontSize="13px" color="gray.500">
        {row.original.plan?.name ?? '—'}
      </Text>
    ),
  },
  {
    id: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const { amount, discountAmount, currency } = row.original;
      const discount = Number(discountAmount ?? 0);
      return (
        <Box>
          <Text
            fontSize="13px"
            color="gray.500"
            fontWeight="600"
            whiteSpace="nowrap"
          >
            {formatAmount(Number(amount ?? 0), currency)}
          </Text>
          {discount > 0 && (
            <Text fontSize="11px" color="success.300" whiteSpace="nowrap">
              {formatAmount(discount, currency)} discount
            </Text>
          )}
        </Box>
      );
    },
  },
  {
    id: 'period',
    header: 'Covers',
    cell: ({ row }) => (
      <Text fontSize="12px" color="gray.400" whiteSpace="nowrap">
        {describePeriod(row.original.periodStart, row.original.periodEnd)}
      </Text>
    ),
  },
  {
    accessorKey: 'method',
    header: 'Method',
    cell: ({ getValue }) => (
      <Text fontSize="12px" color="gray.400" whiteSpace="nowrap">
        {subscriptionPaymentMethodLabel(getValue() as string | null)}
      </Text>
    ),
  },
  {
    accessorKey: 'reference',
    header: 'Reference',
    cell: ({ getValue }) => (
      <Text fontSize="12px" color="gray.400" maxW="12rem" truncate>
        {(getValue() as string) || '—'}
      </Text>
    ),
  },
  {
    id: 'recordedBy',
    header: 'Recorded by',
    cell: ({ row }) => (
      <Text fontSize="12px" color="gray.400" whiteSpace="nowrap">
        {recordedByName(row.original)}
      </Text>
    ),
  },
];
