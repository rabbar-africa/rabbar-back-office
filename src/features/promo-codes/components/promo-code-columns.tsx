import { Badge, Box, Button, Flex, Text } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import Status from '@/components/common/Status';
import type { IPromoCode } from '@/shared/interface/promo-code';
import {
  createdByName,
  describePromo,
  describeUses,
  describeValidity,
  promoWindowState,
  type PlanNames,
} from '../data';

export function AutoApplyBadge() {
  return (
    <Badge
      bg="primary.50"
      color="primary.300"
      rounded="full"
      px=".625rem"
      whiteSpace="nowrap"
      fontSize=".625rem"
    >
      Auto-applied to new signups
    </Badge>
  );
}

interface PromoCodeColumnOptions {
  planNames?: PlanNames;
  onToggleActive: (promo: IPromoCode) => void;
  togglingId?: string;
}

export function buildPromoCodeColumns({
  planNames,
  onToggleActive,
  togglingId,
}: PromoCodeColumnOptions): ColumnDef<IPromoCode, any>[] {
  return [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ getValue }) => (
        <Text
          fontSize="13px"
          color="primary.300"
          fontWeight="700"
          letterSpacing="0.3px"
          whiteSpace="nowrap"
        >
          {getValue() as string}
        </Text>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => (
        <Text fontSize="12px" color="gray.400" maxW="14rem" truncate>
          {(getValue() as string) || '—'}
        </Text>
      ),
    },
    {
      id: 'discount',
      header: 'Discount',
      cell: ({ row }) => (
        <Text fontSize="13px" color="gray.500" fontWeight="500">
          {describePromo(row.original, planNames)}
        </Text>
      ),
    },
    {
      id: 'uses',
      header: 'Uses',
      cell: ({ row }) => (
        <Text fontSize="13px" color="gray.500" whiteSpace="nowrap">
          {describeUses(row.original)}
        </Text>
      ),
    },
    {
      id: 'validity',
      header: 'Valid',
      cell: ({ row }) => {
        const state = promoWindowState(row.original);
        return (
          <Box>
            <Text fontSize="12px" color="gray.400" whiteSpace="nowrap">
              {describeValidity(row.original)}
            </Text>
            {state !== 'open' && (
              <Text
                fontSize="11px"
                color={state === 'expired' ? 'error.300' : 'secondary.500'}
              >
                {state === 'expired' ? 'Expired' : 'Not started yet'}
              </Text>
            )}
          </Box>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Flex gap=".375rem" align="center" wrap="wrap">
          <Status name={row.original.isActive ? 'Active' : 'Inactive'} />
          {row.original.autoApplyOnSignup && <AutoApplyBadge />}
        </Flex>
      ),
    },
    {
      id: 'createdBy',
      header: 'Created by',
      cell: ({ row }) => (
        <Box>
          <Text fontSize="12px" color="gray.500" whiteSpace="nowrap">
            {createdByName(row.original)}
          </Text>
          <Text fontSize="11px" color="gray.300">
            {moment(row.original.createdAt).format('DD MMM YYYY')}
          </Text>
        </Box>
      ),
    },
    {
      id: 'quickToggle',
      header: '',
      meta: { disableRowClick: true },
      cell: ({ row }) => {
        const promo = row.original;
        return (
          <Button
            size="xs"
            variant="outline"
            color={promo.isActive ? 'error.300' : 'success.300'}
            borderColor={promo.isActive ? 'error.300' : 'success.300'}
            _hover={{ bg: promo.isActive ? 'error.50' : 'success.50' }}
            loading={togglingId === promo.id}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(promo);
            }}
          >
            {promo.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        );
      },
    },
  ];
}
