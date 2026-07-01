import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { formatAmount } from '@/utils/format-number';
import {
  PAYMENT_METHOD_LABELS,
  type Payment,
  type PaymentMethod,
} from '@/shared/interface/payment';
import { paymentsData } from '@/features/payments/data';

const columns: ColumnDef<Payment, any>[] = [
  { accessorKey: 'paymentNumber', header: 'Payment #' },
  {
    id: 'customer',
    header: 'Customer',
    accessorFn: (row) => row.customer.name,
  },
  { accessorKey: 'invoiceNumber', header: 'Invoice #' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ getValue }) => formatAmount(getValue() as number),
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Method',
    cell: ({ getValue }) => PAYMENT_METHOD_LABELS[getValue() as PaymentMethod],
  },
  { accessorKey: 'paymentDate', header: 'Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <Status name={getValue() as string} />,
  },
];

export function OrgPaymentsTab() {
  return (
    <CustomTable
      data={paymentsData}
      columns={columns}
      NoDataText="No payments for this organization"
    />
  );
}
