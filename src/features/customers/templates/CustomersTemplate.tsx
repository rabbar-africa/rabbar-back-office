import { Button, Flex, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { RouteConstants } from '@/shared/constants/routes';
import type { ICustomer } from '@/shared/interface/customer';
import { customersData } from '../data';

const columns: ColumnDef<ICustomer, any>[] = [
  { accessorKey: 'displayName', header: 'Name' },
  { accessorKey: 'company', header: 'Company' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'stage', header: 'Stage' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <Status name={getValue() as string} />,
  },
];

export function CustomersTemplate() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
        <Heading fontSize="1.5rem" fontWeight="600">
          Customers
        </Heading>
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          onClick={() => navigate(RouteConstants.customers.create.path)}
        >
          Add Customer
        </Button>
      </Flex>

      <CustomTable
        data={customersData}
        columns={columns}
        NoDataText="No customers yet"
      />
    </Flex>
  );
}
