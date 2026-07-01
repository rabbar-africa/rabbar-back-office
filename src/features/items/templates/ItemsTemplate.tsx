import { Button, Flex, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { formatAmount } from '@/utils/format-number';
import { RouteConstants } from '@/shared/constants/routes';
import type { Item } from '@/shared/interface/item';
import { itemsData } from '../data';

const columns: ColumnDef<Item, any>[] = [
  { accessorKey: 'code', header: 'Code' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'unit', header: 'Unit' },
  {
    accessorKey: 'unitPrice',
    header: 'Rate',
    cell: ({ getValue }) => formatAmount(getValue() as number),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <Status name={getValue() as string} />,
  },
];

export function ItemsTemplate() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
        <Heading fontSize="1.5rem" fontWeight="600">
          Items / Services
        </Heading>
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          onClick={() => navigate(RouteConstants.items.create.path)}
        >
          Add Item
        </Button>
      </Flex>

      <CustomTable
        data={itemsData}
        columns={columns}
        NoDataText="No items yet"
      />
    </Flex>
  );
}
