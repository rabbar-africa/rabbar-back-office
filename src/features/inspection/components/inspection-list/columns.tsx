import { useMemo } from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import Status from '@/components/ui/Status';
import { RouteConstants } from '@/shared/constants/routes';
import { pascalToCapitalized } from '@/utils/string-formatter';
import {
  INSPECTION_STATUSES,
  type IInspectionListItem,
} from '@/shared/interface/inspection';

export const INSPECTION_STATUS_OPTIONS = [
  { label: 'All', value: '' },
  ...INSPECTION_STATUSES.map((status) => ({
    label: pascalToCapitalized(status),
    value: status,
  })),
];

/** "2019 Toyota Hiace" from the row's vehicle snapshot. */
const vehicleLabel = (row: IInspectionListItem) =>
  [row.vehicleYear, row.vehicleMake, row.vehicleModel]
    .filter(Boolean)
    .join(' ') || '—';

interface Options {
  /** Hide the Organization column when the list is already scoped to one. */
  showOrganization?: boolean;
}

export function useInspectionColumns({
  showOrganization = true,
}: Options = {}) {
  return useMemo<ColumnDef<IInspectionListItem, any>[]>(() => {
    const columns: ColumnDef<IInspectionListItem, any>[] = [
      {
        accessorKey: 'jobCode',
        header: 'Job Code',
        cell: ({ getValue, row }) => (
          <Link
            to={RouteConstants.inspection.detail.generate({
              id: row.original.id,
            })}
            onClick={(e) => e.stopPropagation()}
          >
            <Text
              fontSize="13px"
              color="primary.300"
              fontWeight="700"
              letterSpacing="0.3px"
              _hover={{ textDecoration: 'underline' }}
            >
              {(getValue() as string) || '—'}
            </Text>
          </Link>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ getValue, row }) => (
          <Flex direction="column">
            <Text fontSize="13px" color="gray.500" fontWeight="500">
              {(getValue() as string) || '—'}
            </Text>
            {row.original.customerPhone && (
              <Text fontSize="11px" color="gray.300">
                {row.original.customerPhone}
              </Text>
            )}
          </Flex>
        ),
      },
      {
        id: 'vehicle',
        header: 'Vehicle',
        cell: ({ row }) => (
          <Flex direction="column">
            <Text fontSize="13px" color="gray.500">
              {vehicleLabel(row.original)}
            </Text>
            {row.original.vehicleRegistrationNumber && (
              <Text fontSize="11px" color="gray.300">
                {row.original.vehicleRegistrationNumber}
              </Text>
            )}
          </Flex>
        ),
      },
      {
        accessorKey: 'technicianName',
        header: 'Technician',
        cell: ({ getValue }) => (
          <Text fontSize="13px" color="gray.400">
            {(getValue() as string) || '—'}
          </Text>
        ),
      },
      {
        id: 'date',
        header: 'Date',
        cell: ({ row }) => {
          // Inspections aren't always dated; fall back to when it was raised.
          const value =
            row.original.inspectionDate ?? row.original.createdAt ?? null;
          return (
            <Text fontSize="12px" color="gray.300">
              {value ? moment(value).format('DD MMM YYYY') : '—'}
            </Text>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <Status
            name={pascalToCapitalized(getValue() as string)}
            px=".5rem"
            w="auto"
            minW="6rem"
            whiteSpace="nowrap"
          />
        ),
      },
    ];

    if (showOrganization) {
      columns.splice(1, 0, {
        id: 'organization',
        header: 'Organization',
        cell: ({ row }) => {
          const org = row.original.organization;
          if (!org) {
            return (
              <Text fontSize="13px" color="gray.300">
                —
              </Text>
            );
          }
          return (
            <Link
              to={RouteConstants.organizations.detail.generate({ id: org.id })}
              onClick={(e) => e.stopPropagation()}
            >
              <Text
                fontSize="13px"
                color="gray.500"
                fontWeight="500"
                _hover={{ textDecoration: 'underline' }}
              >
                {org.name}
              </Text>
            </Link>
          );
        },
      });
    }

    return columns;
  }, [showOrganization]);
}
