import { Box, Text } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import Status from '@/components/ui/Status';
import { formatAmount } from '@/utils/format-number';
import type { IPaymentReceived } from '@/shared/interface/payment';

const MODE_LABELS: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Card',
  MOBILE_MONEY: 'Mobile Money',
  CHEQUE: 'Cheque',
  ONLINE: 'Online',
  OTHER: 'Other',
};

const money = (value: string | number, currency?: string) =>
  formatAmount(Number(value ?? 0) || 0, currency);

const invoiceNumbersOf = (payment: IPaymentReceived): string[] =>
  (payment.allocations ?? [])
    .map((allocation) => allocation.invoice?.invoiceNumber)
    .filter(Boolean) as string[];

export const paymentListColumns: ColumnDef<IPaymentReceived, any>[] = [
  {
    accessorKey: 'paymentNumber',
    header: 'Payment #',
    cell: ({ getValue }) => (
      <Text
        fontSize="13px"
        color="primary.300"
        fontWeight="700"
        letterSpacing="0.3px"
      >
        {(getValue() as string) || '—'}
      </Text>
    ),
  },
  {
    id: 'invoiceNumbers',
    header: 'Invoice #',
    cell: ({ row }) => {
      const numbers = invoiceNumbersOf(row.original);
      if (!numbers.length)
        return (
          <Text fontSize="12px" color="gray.300">
            —
          </Text>
        );
      const [first, ...rest] = numbers;
      return (
        <Text fontSize="12px" color="gray.400" fontWeight="500">
          {first}
          {rest.length ? ` +${rest.length}` : ''}
        </Text>
      );
    },
  },
  {
    accessorKey: 'customerName',
    header: 'Customer',
    cell: ({ row }) => (
      <Text fontSize="13px" color="gray.500" fontWeight="500">
        {row.original.customerName || row.original.client?.displayName || '—'}
      </Text>
    ),
  },
  {
    accessorKey: 'mode',
    header: 'Mode',
    cell: ({ getValue }) => {
      const mode = getValue() as string;
      return (
        <Box display="inline-flex" bg="gray.50" px="8px" py="3px" rounded="md">
          <Text fontSize="11px" fontWeight="500" color="gray.400">
            {MODE_LABELS[mode] ?? mode}
          </Text>
        </Box>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <Text fontSize="13px" color="gray.500" fontWeight="700">
        {money(row.original.amount, row.original.currencyCode)}
      </Text>
    ),
  },
  {
    accessorKey: 'amountApplied',
    header: 'Applied',
    cell: ({ row }) => (
      <Text fontSize="13px" color="success.300" fontWeight="500">
        {money(row.original.amountApplied, row.original.currencyCode)}
      </Text>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Text fontSize="12px" color="gray.300">
          {value ? moment(value).format('DD MMM YYYY') : '—'}
        </Text>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (props) => {
      const status = props.row.original.status;
      return <Status name={status} />;
    },
  },
];
