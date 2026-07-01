import { Button, Flex, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { formatAmount } from '@/utils/format-number';
import { RouteConstants } from '@/shared/constants/routes';
import type { Invoice } from '@/shared/interface/invoice';
import { invoicesData } from '../data';

const columns: ColumnDef<Invoice, any>[] = [
  { accessorKey: 'invoiceNumber', header: 'Invoice #' },
  {
    id: 'customer',
    header: 'Customer',
    accessorFn: (row) => row.customer.name,
  },
  { accessorKey: 'issueDate', header: 'Issue Date' },
  { accessorKey: 'dueDate', header: 'Due Date' },
  {
    accessorKey: 'totalAmount',
    header: 'Total',
    cell: ({ getValue }) => formatAmount(getValue() as number),
  },
  {
    accessorKey: 'amountDue',
    header: 'Balance',
    cell: ({ getValue }) => formatAmount(getValue() as number),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <Status name={getValue() as string} />,
  },
];

export function InvoicesTemplate() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
        <Heading fontSize="1.5rem" fontWeight="600">
          Invoices
        </Heading>
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          onClick={() => navigate(RouteConstants.invoices.create.path)}
        >
          New Invoice
        </Button>
      </Flex>

      <CustomTable
        data={invoicesData}
        columns={columns}
        NoDataText="No invoices yet"
      />
    </Flex>
  );
}
