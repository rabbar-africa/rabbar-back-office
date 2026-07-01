import { Box, Text } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import Status from '@/components/ui/Status';
import type { ICustomer } from '@/shared/interface/customer';

const STAGE_BADGE: Record<string, { bg: string; color: string }> = {
  lead: { bg: 'warning.50', color: 'secondary.500' },
  prospect: { bg: 'primary.50', color: 'primary.300' },
  customer: { bg: 'success.50', color: 'success.300' },
};

export const customerListColumns: ColumnDef<ICustomer, any>[] = [
  {
    accessorKey: 'displayName',
    header: 'Name',
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) ?? '—'}
      </Text>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) ?? '—'}
      </Text>
    ),
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ getValue }) => {
      const stage = getValue() as string;
      const styles = STAGE_BADGE[stage?.toLowerCase()] ?? {
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
            {stage?.toLowerCase()}
          </Text>
        </Box>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return <Status name={status} />;
    },
  },
];
