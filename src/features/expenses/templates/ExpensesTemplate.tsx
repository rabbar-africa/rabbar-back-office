import { Button, Flex, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { formatAmount } from '@/utils/format-number';
import { RouteConstants } from '@/shared/constants/routes';
import {
  EXPENSE_CATEGORY_LABELS,
  type Expense,
  type ExpenseCategory,
} from '@/shared/interface/expense';
import { expensesData } from '../data';

const columns: ColumnDef<Expense, any>[] = [
  { accessorKey: 'expenseNumber', header: 'Expense #' },
  { accessorKey: 'title', header: 'Title' },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ getValue }) =>
      EXPENSE_CATEGORY_LABELS[getValue() as ExpenseCategory],
  },
  { accessorKey: 'vendor', header: 'Vendor' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ getValue }) => formatAmount(getValue() as number),
  },
  { accessorKey: 'expenseDate', header: 'Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <Status name={getValue() as string} />,
  },
];

export function ExpensesTemplate() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
        <Heading fontSize="1.5rem" fontWeight="600">
          Expense Tracking
        </Heading>
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          onClick={() => navigate(RouteConstants.expenses.create.path)}
        >
          Add Expense
        </Button>
      </Flex>

      <CustomTable
        data={expensesData}
        columns={columns}
        NoDataText="No expenses yet"
      />
    </Flex>
  );
}
