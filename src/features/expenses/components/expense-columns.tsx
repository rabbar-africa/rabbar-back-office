import { Box, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import { TruncatedText } from '@/components/common/TruncatedText';
import { RouteConstants } from '@/shared/constants/routes';
import { formatAccountLabel } from '@/shared/interface/banking';
import {
  expenseCategoryLabel,
  expensePaymentModeLabel,
  type IExpense,
} from '@/shared/interface/expense';
import { formatCurrency } from '@/utils/calculations';
import { organizationColumn } from '@/features/organizations/components/organization-column';

const muted = (text: string) => (
  <Text fontSize="12px" color="gray.300">
    {text}
  </Text>
);

export function buildExpenseColumns({
  showOrganization,
}: {
  showOrganization: boolean;
}): ColumnDef<IExpense, any>[] {
  const columns: ColumnDef<IExpense, any>[] = [
    {
      accessorKey: 'expenseNumber',
      header: 'Expense #',
      cell: ({ row }) => (
        <Box>
          <Text
            fontSize="13px"
            color="primary.300"
            fontWeight="700"
            whiteSpace="nowrap"
          >
            {row.original.expenseNumber || '—'}
          </Text>
          <Text fontSize="11px" color="gray.300" whiteSpace="nowrap">
            {moment(row.original.date).format('DD MMM YYYY')}
          </Text>
        </Box>
      ),
    },
    {
      id: 'expense',
      header: 'Expense',
      cell: ({ row }) => {
        const e = row.original;
        const title = e.name || e.item?.name || e.description || '—';
        return (
          <Box w="16rem" whiteSpace="normal" wordBreak="break-word">
            <TruncatedText lines={1} fontSize="13px" color="gray.500">
              {title}
            </TruncatedText>
            <Text fontSize="11px" color="gray.300">
              {expenseCategoryLabel(e.category)}
              {e.vendorName ? ` · ${e.vendorName}` : ''}
            </Text>
          </Box>
        );
      },
    },
    {
      id: 'for',
      header: 'For',
      meta: { disableRowClick: true },
      cell: ({ row }) => {
        const { invoice, invoiceLineItem, jobCard } = row.original;
        if (!invoice && !jobCard) return muted('—');
        return (
          <Box whiteSpace="nowrap">
            {invoice ? (
              <Link
                to={RouteConstants.invoices.detail.generate({ id: invoice.id })}
              >
                <Text
                  fontSize="12px"
                  color="primary.300"
                  fontWeight="600"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {invoice.invoiceNumber}
                  {invoiceLineItem ? ` · ${invoiceLineItem.name}` : ''}
                </Text>
              </Link>
            ) : null}
            {jobCard ? (
              <Text fontSize="11px" color="gray.300">
                Job {jobCard.jobNumber}
              </Text>
            ) : null}
          </Box>
        );
      },
    },
    {
      id: 'paidFrom',
      header: 'Paid from',
      cell: ({ row }) => {
        const e = row.original;
        return (
          <Box whiteSpace="nowrap">
            <Text fontSize="12px" color="gray.400">
              {e.paidThroughAccount
                ? formatAccountLabel(e.paidThroughAccount)
                : '—'}
            </Text>
            <Text fontSize="11px" color="gray.300">
              {expensePaymentModeLabel(e.paymentMode)}
            </Text>
          </Box>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }) => (
        <Text
          fontSize="13px"
          color="gray.500"
          fontWeight="700"
          whiteSpace="nowrap"
          textAlign="right"
        >
          {formatCurrency(Number(getValue() ?? 0))}
        </Text>
      ),
    },
  ];
  if (showOrganization)
    columns.splice(1, 0, organizationColumn<IExpense>('expenses'));
  return columns;
}
