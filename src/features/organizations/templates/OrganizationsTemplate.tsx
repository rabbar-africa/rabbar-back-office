import { Button, Flex, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { RouteConstants } from '@/shared/constants/routes';
import type { IOrganization } from '@/shared/interface/common';
import { organizationsData } from '../data';

const columns: ColumnDef<IOrganization, any>[] = [
  { accessorKey: 'name', header: 'Organization' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'industry', header: 'Industry' },
  { accessorKey: 'currency', header: 'Currency' },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ getValue }) => (
      <Status name={getValue() ? 'active' : 'inactive'} />
    ),
  },
];

export function OrganizationsTemplate() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
        <Heading fontSize="1.5rem" fontWeight="600">
          Organizations
        </Heading>
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          onClick={() => navigate(RouteConstants.organizations.create.path)}
        >
          Add Organization
        </Button>
      </Flex>

      <CustomTable
        data={organizationsData}
        columns={columns}
        NoDataText="No organizations yet"
      />
    </Flex>
  );
}
