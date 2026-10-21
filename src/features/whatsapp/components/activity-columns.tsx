import { Box, Text } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import Status from '@/components/common/Status';
import { TruncatedText } from '@/components/common/TruncatedText';
import type { IWhatsappEvent } from '@/shared/interface/whatsapp';
import {
  formatDuration,
  formatNaira,
  formatRelative,
  formatWhen,
  whatTheySent,
  whatsappOutcomeLabel,
  whoName,
  whoSubtitle,
} from '../data';

/**
 * Text cells that would otherwise stretch the table: a fixed width, wrapping
 * onto at most two lines, with the full text in a tooltip when it's cut off.
 */
const CLAMPED_CELL = {
  maxW: '100%',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
} as const;

interface ActivityColumnOptions {
  /** Show which organization each event belongs to (platform-wide views). */
  showOrganization?: boolean;
}

export function buildActivityColumns({
  showOrganization = false,
}: ActivityColumnOptions = {}): ColumnDef<IWhatsappEvent, any>[] {
  const columns: ColumnDef<IWhatsappEvent, any>[] = [
    {
      // Sortable ids match the API's sortBy values: at, durationMs, aiCalls.
      id: 'at',
      accessorKey: 'at',
      header: 'When',
      sortDescFirst: true,
      cell: ({ getValue }) => (
        <Box>
          <Text fontSize="12px" color="gray.500" whiteSpace="nowrap">
            {formatRelative(getValue() as string)}
          </Text>
          <Text fontSize="11px" color="gray.300" whiteSpace="nowrap">
            {formatWhen(getValue() as string)}
          </Text>
        </Box>
      ),
    },
    {
      id: 'who',
      header: 'Who',
      enableSorting: false,
      cell: ({ row }) => {
        const { who, phone } = row.original;
        return (
          <Box>
            <Text
              textStyle="small-semibold"
              color="gray.500"
              whiteSpace="nowrap"
            >
              {whoName(who, phone)}
            </Text>
            <Text fontSize="11px" color="gray.300" whiteSpace="nowrap">
              {whoSubtitle(who, phone)}
            </Text>
          </Box>
        );
      },
    },
    {
      id: 'summary',
      header: 'What happened',
      enableSorting: false,
      cell: ({ row }) => {
        const event = row.original;
        const sent = whatTheySent(event);
        const didSomething = event.actions.length > 0;
        return (
          <Box {...CLAMPED_CELL} w="22rem">
            <TruncatedText
              lines={2}
              fontSize="13px"
              color={
                event.outcome === 'failed'
                  ? 'error.300'
                  : didSomething
                    ? 'success.300'
                    : 'gray.500'
              }
              fontWeight={didSomething ? '500' : '400'}
            >
              {event.summary}
            </TruncatedText>
            {sent && (
              <TruncatedText
                lines={1}
                fontSize="11px"
                color="gray.300"
                mt="2px"
              >
                {`“${sent}”`}
              </TruncatedText>
            )}
          </Box>
        );
      },
    },
    {
      accessorKey: 'outcome',
      header: 'Outcome',
      enableSorting: false,
      cell: ({ getValue }) => (
        <Status name={whatsappOutcomeLabel(getValue() as string)} />
      ),
    },
    {
      id: 'durationMs',
      accessorKey: 'durationMs',
      header: 'Reply time',
      sortDescFirst: true,
      cell: ({ getValue }) => (
        <Text fontSize="12px" color="gray.400" whiteSpace="nowrap">
          {formatDuration(getValue() as number | null)}
        </Text>
      ),
    },
    {
      id: 'aiCalls',
      accessorFn: (row) => row.ai?.calls ?? 0,
      header: 'AI calls',
      sortDescFirst: true,
      cell: ({ row }) => {
        const ai = row.original.ai;
        const tokens = (ai?.inputTokens ?? 0) + (ai?.outputTokens ?? 0);
        return (
          <Box>
            <Text fontSize="12px" color="gray.400">
              {ai?.calls ?? 0}
            </Text>
            {tokens > 0 && (
              <Text fontSize="11px" color="gray.300" whiteSpace="nowrap">
                {tokens.toLocaleString()} tokens
              </Text>
            )}
          </Box>
        );
      },
    },
    {
      id: 'aiCost',
      header: 'AI cost',
      // The API can't order by cost yet; AI calls is the closest sort.
      enableSorting: false,
      cell: ({ row }) => {
        const cost = row.original.ai?.costNgn ?? 0;
        return (
          <Text
            fontSize="12px"
            color={cost > 0 ? 'gray.500' : 'gray.300'}
            fontWeight={cost > 0 ? '500' : '400'}
            whiteSpace="nowrap"
          >
            {cost > 0 ? formatNaira(cost) : '—'}
          </Text>
        );
      },
    },
  ];

  if (showOrganization) {
    columns.splice(2, 0, {
      id: 'organization',
      header: 'Organization',
      enableSorting: false,
      cell: ({ row }) => (
        <Box {...CLAMPED_CELL} w="14rem">
          <TruncatedText lines={2} fontSize="13px" color="gray.500">
            {row.original.organization?.name || '—'}
          </TruncatedText>
        </Box>
      ),
    });
  }

  return columns;
}
