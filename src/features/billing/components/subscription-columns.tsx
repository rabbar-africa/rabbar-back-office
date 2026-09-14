import { Box, Text } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import Status from '@/components/common/Status';
import { subscriptionStatusLabel } from '@/shared/constants/subscription';
import type { ISubscriptionListItem } from '@/shared/interface/billing';
import { formatAmount } from '@/utils/format-number';
import {
  RENEWAL_TONE_COLOR,
  describePeriod,
  describeRenewal,
  formatDate,
  isFreePlan,
  type PlanNamesById,
} from '../data';

export function buildSubscriptionColumns(
  planNames?: PlanNamesById
): ColumnDef<ISubscriptionListItem, any>[] {
  return [
    {
      id: 'organization',
      header: 'Organization',
      cell: ({ row }) => (
        <Box>
          <Text textStyle="small-semibold" color="gray.500" whiteSpace="nowrap">
            {row.original.organization?.name ?? '—'}
          </Text>
          <Text fontSize="11px" color="gray.300">
            {row.original.organization?.companyEmail || ''}
          </Text>
        </Box>
      ),
    },
    {
      id: 'plan',
      header: 'Plan',
      cell: ({ row }) => {
        const plan = row.original.plan;
        return (
          <Box>
            <Text fontSize="13px" color="gray.500" fontWeight="500">
              {plan?.name ?? '—'}
            </Text>
            <Text fontSize="11px" color="gray.300" whiteSpace="nowrap">
              {plan && !isFreePlan(plan)
                ? `${formatAmount(Number(plan.monthlyPrice), plan.currency)}/month`
                : 'Free'}
            </Text>
          </Box>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <Status name={subscriptionStatusLabel(getValue() as string)} />
      ),
    },
    {
      id: 'period',
      header: 'Current period',
      cell: ({ row }) => (
        <Text fontSize="12px" color="gray.400" whiteSpace="nowrap">
          {describePeriod(
            row.original.currentPeriodStart,
            row.original.currentPeriodEnd
          )}
        </Text>
      ),
    },
    {
      id: 'renewal',
      header: 'What happens next',
      cell: ({ row }) => {
        const { label, tone } = describeRenewal(row.original, planNames);
        return (
          <Text
            fontSize="12px"
            color={RENEWAL_TONE_COLOR[tone]}
            fontWeight={tone === 'danger' || tone === 'warning' ? '500' : '400'}
            whiteSpace="nowrap"
          >
            {label}
          </Text>
        );
      },
    },
    {
      accessorKey: 'startedAt',
      header: 'Since',
      cell: ({ getValue }) => (
        <Text fontSize="12px" color="gray.400" whiteSpace="nowrap">
          {formatDate(getValue() as string)}
        </Text>
      ),
    },
  ];
}
