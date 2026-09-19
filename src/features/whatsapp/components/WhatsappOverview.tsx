import { useMemo } from 'react';
import { Box, Flex, Grid, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import Status from '@/components/common/Status';
import { SectionCard } from '@/features/overview/components/SectionCard';
import {
  StatCard,
  StatCardSkeleton,
} from '@/features/overview/components/StatCard';
import { useUrlState } from '@/hooks/useUrlState';
import { useGetWhatsappUsage } from '../api';
import {
  DEFAULT_WHATSAPP_PERIOD,
  WHATSAPP_OUTCOME_LABELS,
  fillDays,
  formatDuration,
  formatPercent,
  formatUsd,
  formatWhen,
  resolvePeriod,
  whatsappFlowLabel,
  whatsappOutcomeLabel,
} from '../data';
import { MessagesPerDayChart } from './MessagesPerDayChart';
import { PeriodFilter } from './PeriodFilter';

const FILTER_SCHEMA = {
  ovPeriod: { defaultValue: DEFAULT_WHATSAPP_PERIOD },
  ovFrom: { defaultValue: '' },
  ovTo: { defaultValue: '' },
};

/** A slice of the overview to open in the activity feed. */
export interface WhatsappDrillDown {
  outcome?: string;
  flow?: string;
  organization?: { id: string; name: string };
  /** ISO start of the overview period, so the feed covers the same window. */
  from?: string;
  to?: string;
}

interface WhatsappOverviewProps {
  onDrillDown: (target: WhatsappDrillDown) => void;
}

/** The bot at a glance: volume, reach, what breaks, what it costs. */
export function WhatsappOverview({ onDrillDown }: WhatsappOverviewProps) {
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: 'wa_',
  });

  const period = useMemo(
    () =>
      resolvePeriod({
        period: filters.ovPeriod,
        from: filters.ovFrom,
        to: filters.ovTo,
      }),
    [filters.ovPeriod, filters.ovFrom, filters.ovTo]
  );

  const { data, isPending, isError } = useGetWhatsappUsage(period);
  const usage = data?.data;

  const days = useMemo(
    () =>
      usage ? fillDays(usage.perDay, usage.period.from, usage.period.to) : [],
    [usage]
  );

  const drill = (target: WhatsappDrillDown) =>
    onDrillDown({
      ...target,
      from: usage?.period.from,
      to: filters.ovPeriod === 'custom' ? usage?.period.to : undefined,
    });

  const total = usage?.messages ?? 0;
  const failed = usage?.byOutcome.failed ?? 0;
  const unlinked = usage?.byOutcome.unlinked ?? 0;
  const queue = usage?.queue;
  const queueStuck = (queue?.failed ?? 0) > 0;

  const outcomes = usage
    ? Object.keys({ ...WHATSAPP_OUTCOME_LABELS, ...usage.byOutcome })
        .map((outcome) => ({ outcome, count: usage.byOutcome[outcome] ?? 0 }))
        .filter((row) => row.count > 0)
        .sort((a, b) => b.count - a.count)
    : [];
  const topFlowCount = usage?.byFlow[0]?.count ?? 0;
  const topOrgCount = usage?.topOrganizations[0]?.messages ?? 0;

  return (
    <Stack gap="5">
      <Flex
        alignItems={{ base: 'stretch', md: 'center' }}
        gap="3"
        direction={{ base: 'column', md: 'row' }}
        wrap="wrap"
      >
        <PeriodFilter
          value={{
            period: filters.ovPeriod,
            from: filters.ovFrom,
            to: filters.ovTo,
          }}
          onChange={(next) =>
            setFilters({
              ...(next.period !== undefined && { ovPeriod: next.period }),
              ...(next.from !== undefined && { ovFrom: next.from }),
              ...(next.to !== undefined && { ovTo: next.to }),
            })
          }
        />
        {usage && (
          <Text textStyle="small-regular" color="gray.300">
            {formatWhen(usage.period.from)} – {formatWhen(usage.period.to)}
          </Text>
        )}
      </Flex>

      {isError ? (
        <Text color="error.300" py="3rem" textAlign="center">
          Couldn't load WhatsApp usage for this period.
        </Text>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4">
            {isPending || !usage ? (
              Array.from({ length: 8 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            ) : (
              <>
                <StatCard
                  label="Messages"
                  value={total.toLocaleString()}
                  helperText={`${(usage.byOutcome.handled ?? 0).toLocaleString()} handled by the bot`}
                />
                <StatCard
                  label="People using the bot"
                  value={usage.activeSenders.toLocaleString()}
                  helperText="Distinct numbers that sent a message"
                  accent="success.300"
                />
                <StatCard
                  label="Organizations"
                  value={usage.activeOrganizations.toLocaleString()}
                  helperText="With at least one linked user active"
                  accent="success.300"
                />
                <StatCard
                  label="Not linked"
                  value={unlinked.toLocaleString()}
                  helperText="Messages from numbers with no account — leads to follow up"
                  accent="secondary.500"
                />
                <StatCard
                  label="Failed"
                  value={failed.toLocaleString()}
                  helperText={`${formatPercent(failed, total)} of messages hit an error on our side`}
                  accent={failed > 0 ? 'error.300' : 'success.300'}
                />
                <StatCard
                  label="Average reply time"
                  value={formatDuration(usage.avgDurationMs)}
                  helperText="From message received to bot finished"
                />
                <StatCard
                  label="AI cost (estimate)"
                  value={formatUsd(usage.ai.estimatedCostUsd)}
                  helperText={`${usage.ai.calls.toLocaleString()} calls · ${(usage.ai.inputTokens + usage.ai.outputTokens).toLocaleString()} tokens`}
                />
                <StatCard
                  label="Queue right now"
                  value={`${queue?.pending ?? 0} waiting`}
                  helperText={`${queue?.processing ?? 0} processing · ${queue?.failed ?? 0} failed`}
                  accent={queueStuck ? 'error.300' : 'success.300'}
                />
              </>
            )}
          </SimpleGrid>

          {usage && (
            <>
              <SectionCard
                title="Messages per day"
                subtitle="Every inbound message, including ones the bot couldn't act on"
              >
                {total === 0 ? (
                  <EmptyNote>No messages in this period.</EmptyNote>
                ) : (
                  <MessagesPerDayChart days={days} />
                )}
              </SectionCard>

              <Grid
                templateColumns={{ base: '1fr', xl: 'repeat(3, 1fr)' }}
                gap="4"
              >
                <SectionCard
                  title="Outcomes"
                  subtitle="What happened to each message. Click to see them."
                >
                  {outcomes.length === 0 ? (
                    <EmptyNote>Nothing yet.</EmptyNote>
                  ) : (
                    <Stack gap=".5rem">
                      {outcomes.map(({ outcome, count }) => (
                        <MeterRow
                          key={outcome}
                          label={
                            <Status
                              name={whatsappOutcomeLabel(outcome)}
                              px=".5rem"
                              py="2px"
                            />
                          }
                          count={count}
                          share={formatPercent(count, total)}
                          fraction={total ? count / total : 0}
                          onClick={() => drill({ outcome })}
                        />
                      ))}
                    </Stack>
                  )}
                </SectionCard>

                <SectionCard
                  title="What people use it for"
                  subtitle="Flows people ended up in, most used first"
                >
                  {usage.byFlow.length === 0 ? (
                    <EmptyNote>No flows started yet.</EmptyNote>
                  ) : (
                    <Stack gap=".5rem">
                      {usage.byFlow.map(({ flow, count }) => (
                        <MeterRow
                          key={flow}
                          label={whatsappFlowLabel(flow)}
                          count={count}
                          fraction={topFlowCount ? count / topFlowCount : 0}
                          onClick={() => drill({ flow })}
                        />
                      ))}
                    </Stack>
                  )}
                </SectionCard>

                <SectionCard
                  title="Most active organizations"
                  subtitle="By messages sent. Click to see their activity."
                >
                  {usage.topOrganizations.length === 0 ? (
                    <EmptyNote>
                      No linked organization has used the bot.
                    </EmptyNote>
                  ) : (
                    <Stack gap=".5rem">
                      {usage.topOrganizations.map((org) => (
                        <MeterRow
                          key={org.organizationId}
                          label={org.name ?? 'Deleted organization'}
                          hint={`${org.senders} ${org.senders === 1 ? 'person' : 'people'}`}
                          count={org.messages}
                          fraction={
                            topOrgCount ? org.messages / topOrgCount : 0
                          }
                          onClick={() =>
                            drill({
                              organization: {
                                id: org.organizationId,
                                name: org.name ?? '',
                              },
                            })
                          }
                        />
                      ))}
                    </Stack>
                  )}
                </SectionCard>
              </Grid>
            </>
          )}
        </>
      )}
    </Stack>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <Text textStyle="small-regular" color="gray.300" py="2">
      {children}
    </Text>
  );
}

/**
 * Label, count, and a one-hue bar for magnitude. Identity is carried by the
 * text, never by the bar's colour.
 */
function MeterRow({
  label,
  hint,
  count,
  share,
  fraction,
  onClick,
}: {
  label: React.ReactNode;
  hint?: string;
  count: number;
  share?: string;
  fraction: number;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      textAlign="left"
      w="100%"
      rounded=".375rem"
      px=".5rem"
      py=".375rem"
      mx="-.5rem"
      cursor="pointer"
      _hover={{ bg: 'gray.50' }}
      onClick={onClick}
    >
      <Flex justify="space-between" align="center" gap="3" mb=".25rem">
        <Flex align="center" gap=".5rem" minW={0}>
          {typeof label === 'string' ? (
            <Text textStyle="small-regular" color="gray.500" truncate>
              {label}
            </Text>
          ) : (
            label
          )}
          {hint && (
            <Text fontSize="11px" color="gray.300" whiteSpace="nowrap">
              {hint}
            </Text>
          )}
        </Flex>
        <Text textStyle="small-semibold" color="gray.500" whiteSpace="nowrap">
          {count.toLocaleString()}
          {share && (
            <Text as="span" fontWeight="400" color="gray.300" ml=".375rem">
              {share}
            </Text>
          )}
        </Text>
      </Flex>
      <Box h="4px" bg="gray.50" rounded="full" overflow="hidden">
        <Box
          h="100%"
          w={`${Math.max(fraction * 100, count > 0 ? 2 : 0)}%`}
          bg="primary.300"
          rounded="full"
        />
      </Box>
    </Box>
  );
}
