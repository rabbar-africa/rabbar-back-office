import { Box, Text } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import { formatAmount } from '@/utils/format-number';
import type { ApiItem } from '@/features/items/api/types';

const formatCurrency = (n: number) => formatAmount(Number.isFinite(n) ? n : 0);

const PRODUCT_TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  PRODUCT: { bg: 'primary.50', color: 'primary.300' },
  SERVICE: { bg: 'success.50', color: 'success.300' },
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: 'success.50', color: 'success.300' },
  INACTIVE: { bg: 'error.50', color: 'error.300' },
};

export const itemListColumns: ColumnDef<ApiItem, any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: 'productType',
    header: 'Type',
    cell: ({ getValue }) => {
      const type = getValue() as string;
      const styles = PRODUCT_TYPE_STYLES[type] ?? {
        bg: 'gray.100',
        color: 'gray.500',
      };
      return (
        <Box
          display="inline-flex"
          bg={styles.bg}
          px="10px"
          py="4px"
          rounded="md"
          alignItems="center"
        >
          <Text
            fontSize="12px"
            fontWeight="500"
            color={styles.color}
            textTransform="capitalize"
          >
            {type?.toLowerCase()}
          </Text>
        </Box>
      );
    },
  },
  {
    accessorKey: 'unit',
    header: 'Unit',
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) ?? '—'}
      </Text>
    ),
  },
  {
    accessorKey: 'rate',
    header: 'Rate',
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(Number(getValue() as string))}
      </Text>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const styles = STATUS_STYLES[status] ?? {
        bg: 'gray.100',
        color: 'gray.500',
      };
      return (
        <Box
          display="inline-flex"
          bg={styles.bg}
          px="10px"
          py="4px"
          rounded="md"
          alignItems="center"
        >
          <Text
            fontSize="12px"
            fontWeight="500"
            color={styles.color}
            textTransform="capitalize"
          >
            {status?.toLowerCase()}
          </Text>
        </Box>
      );
    },
  },
];
