import { Button, Flex, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { formatAmount } from '@/utils/format-number';
import { RouteConstants } from '@/shared/constants/routes';
import {
  PAYMENT_METHOD_LABELS,
  type Payment,
  type PaymentMethod,
} from '@/shared/interface/payment';
import { paymentsData } from '../data';

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

export function PaymentsTemplate() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
        <Heading fontSize="1.5rem" fontWeight="600">
          Payments Received
        </Heading>
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          onClick={() => navigate(RouteConstants.payments.create.path)}
        >
          Record Payment
        </Button>
      </Flex>

      <CustomTable
        data={paymentsData}
        columns={columns}
        NoDataText="No payments yet"
      />
    </Flex>
  );
}
