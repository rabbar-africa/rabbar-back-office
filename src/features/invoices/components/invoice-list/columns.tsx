import { useMemo } from 'react';
import { Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import Status from '@/components/ui/Status';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { RouteConstants } from '@/shared/constants/routes';
import type { IInvoiceResponse } from '@/shared/interface/invoice';
import { InvoiceStatusDto } from '@/shared/interface/invoice';

const toNum = (v: unknown) => Number(v ?? 0) || 0;

// The API returns the backend enum name (e.g. PARTIALLY_PAID); Status renders
// its label uppercased, so only the underscores need smoothing out.
const statusLabel = (status?: string) => (status ?? '').replace(/_/g, ' ');

// Status arrives from the API as the backend enum name (e.g. PARTIALLY_PAID);
// compare case-insensitively so both casings behave the same.
const isOverdueRow = (status?: string) => status?.toLowerCase() === 'overdue';

// Values are sent verbatim to the API, so they must be the backend enum names.
// DELETED is omitted — soft-deleted invoices aren't part of the browsable list.
export const STATUS_OPTIONS: { label: string; value: InvoiceStatusDto | '' }[] =
  [
    { label: 'All', value: '' },
    { label: 'Draft', value: InvoiceStatusDto.DRAFT },
    { label: 'Sent', value: InvoiceStatusDto.SENT },
    { label: 'Partially Paid', value: InvoiceStatusDto.PARTIALLY_PAID },
    { label: 'Paid', value: InvoiceStatusDto.PAID },
    { label: 'Overdue', value: InvoiceStatusDto.OVERDUE },
    { label: 'Void', value: InvoiceStatusDto.VOID },
    { label: 'Written Off', value: InvoiceStatusDto.WRITTEN_OFF },
    { label: 'Closed', value: InvoiceStatusDto.CLOSED },
  ];

export function useInvoiceListColumns(): ColumnDef<IInvoiceResponse, any>[] {
  const { formatMoney } = useFormatMoney();

  return useMemo<ColumnDef<IInvoiceResponse, any>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
        cell: ({ getValue, row }) => (
          // Rendered as a link so the number is clickable wherever the table
          // is embedded (invoice list, organization detail tab, …).
          <Link
            to={RouteConstants.invoices.detail.generate({
              id: row.original.id,
            })}
            onClick={(e) => e.stopPropagation()}
          >
            <Text
              fontSize="13px"
              color="primary.300"
              fontWeight="700"
              letterSpacing="0.3px"
              _hover={{ textDecoration: 'underline' }}
            >
              {(getValue() as string) || '—'}
            </Text>
          </Link>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ getValue, row }) => (
          <Text fontSize="13px" color="gray.500" fontWeight="500">
            {(getValue() as string) || row.original.client?.displayName || '—'}
          </Text>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Issue Date',
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
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ getValue, row }) => {
          const value = getValue() as string;
          const isOverdue = isOverdueRow(row.original.status);
          return (
            <Text
              fontSize="12px"
              color={isOverdue ? 'error.300' : 'gray.300'}
              fontWeight={isOverdue ? '600' : '400'}
            >
              {value ? moment(value).format('DD MMM YYYY') : '—'}
            </Text>
          );
        },
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ getValue, row }) => (
          <Text fontSize="13px" color="gray.400">
            {formatMoney(getValue() as number | string, {
              currencyCode: row.original.currencyCode,
            })}
          </Text>
        ),
      },
      {
        accessorKey: 'balance',
        header: 'Amount Due',
        cell: ({ getValue, row }) => {
          const balance = toNum(getValue());
          const isPaid = balance <= 0;
          const isOverdue = isOverdueRow(row.original.status);
          return (
            <Text
              fontSize="13px"
              fontWeight="700"
              color={
                isPaid ? 'success.300' : isOverdue ? 'error.300' : 'gray.500'
              }
            >
              {isPaid
                ? 'Paid'
                : formatMoney(getValue() as number | string, {
                    currencyCode: row.original.currencyCode,
                  })}
            </Text>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <Status
            name={statusLabel(getValue() as string)}
            px={'.5rem'}
            w="auto"
            minW="5.625rem"
            whiteSpace="nowrap"
          />
        ),
      },
    ],
    [formatMoney]
  );
}

export const INVOICE_CSV_HEADERS = {
  invoiceNumber: 'Invoice #',
  customerName: 'Customer',
  issueDate: 'Issue Date',
  dueDate: 'Due Date',
  currency: 'Currency',
  total: 'Total',
  amountDue: 'Amount Due',
  status: 'Status',
} as const;

export function toCsvRow(inv: IInvoiceResponse) {
  return {
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customerName ?? inv.client?.displayName ?? '',
    issueDate: inv.date,
    dueDate: inv.dueDate,
    currency: inv.currencyCode ?? '',
    total: inv.total,
    amountDue: inv.balance,
    status: inv.status,
  };
}
