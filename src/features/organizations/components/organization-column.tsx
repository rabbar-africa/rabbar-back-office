import { Box, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { TruncatedText } from '@/components/common/TruncatedText';
import { RouteConstants } from '@/shared/constants/routes';
import type { IRecordOrganization } from '@/shared/interface/common';

type WithOrganization = {
  organizationId?: string;
  organization?: IRecordOrganization;
};

/**
 * "Organization" column for back-office lists that span every organization.
 * The name links to the organization, opening `tab` when given.
 */
export function organizationColumn<T extends WithOrganization>(
  tab?: string
): ColumnDef<T, any> {
  return {
    id: 'organization',
    header: 'Organization',
    // The link handles the click; don't also fire the row's own click.
    meta: { disableRowClick: true },
    cell: ({ row }) => {
      const id = row.original.organization?.id ?? row.original.organizationId;
      const name = row.original.organization?.name;
      if (!id)
        return (
          <Text fontSize="12px" color="gray.300">
            —
          </Text>
        );
      return (
        <Box w="12rem" whiteSpace="normal" wordBreak="break-word">
          <Link
            to={RouteConstants.organizations.detail.generate(
              { id },
              tab ? { tab } : undefined
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <TruncatedText
              lines={2}
              fontSize="13px"
              color="primary.300"
              fontWeight="500"
              _hover={{ textDecoration: 'underline' }}
            >
              {name || 'Unnamed organization'}
            </TruncatedText>
          </Link>
        </Box>
      );
    },
  };
}
