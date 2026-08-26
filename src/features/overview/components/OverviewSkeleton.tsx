import type { ReactElement } from 'react';
import { Box, Flex, SimpleGrid, Skeleton, Stack } from '@chakra-ui/react';
import { SectionCard } from './SectionCard';
import { MiniStatSkeleton, StatCardSkeleton } from './StatCard';

const repeat = (n: number, render: (i: number) => ReactElement) =>
  Array.from({ length: n }, (_, i) => render(i));

/** Bar heights for the fake chart — fixed so the placeholder doesn't jitter. */
const CHART_BARS = [
  40, 62, 48, 76, 58, 88, 70, 94, 66, 82, 55, 78, 60, 90, 72, 84,
];

/** A label + value pair, as used inside the money panel. */
function FigureSkeleton() {
  return (
    <Box>
      <Skeleton h=".7rem" w="5.5rem" rounded="sm" />
      <Skeleton h="1.1rem" w="7.5rem" mt=".375rem" rounded="sm" />
    </Box>
  );
}

/** A labelled row above a progress bar — the shape both list panels share. */
function BarRowSkeleton({
  labelWidth = '8rem',
  valueWidth = '2.5rem',
}: {
  labelWidth?: string;
  valueWidth?: string;
}) {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb=".375rem">
        <Skeleton h=".8rem" w={labelWidth} rounded="sm" />
        <Skeleton h=".8rem" w={valueWidth} rounded="sm" />
      </Flex>
      <Skeleton h="6px" w="100%" rounded="full" />
    </Box>
  );
}

/**
 * Loading state for the dashboard body. Deliberately mirrors
 * OverviewContent section for section — same grids, same card chrome, same
 * section titles — so the page settles into place instead of reflowing when
 * the data lands. The page header and period filters stay live above it.
 */
export function OverviewSkeleton() {
  return (
    <Stack gap="1.5rem">
      {/* Headline KPIs */}
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="1rem">
        {repeat(4, (i) => (
          <StatCardSkeleton key={i} />
        ))}
      </SimpleGrid>

      {/* Engagement */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="1rem">
        {repeat(3, (i) => (
          <StatCardSkeleton key={i} />
        ))}
      </SimpleGrid>

      <SectionCard
        title="Activity in period"
        subtitle="New records created between the selected dates"
      >
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap="1rem">
          {repeat(5, (i) => (
            <MiniStatSkeleton key={i} />
          ))}
        </SimpleGrid>
      </SectionCard>

      <SectionCard
        title="Platform totals"
        subtitle="All-time record counts across every organization"
      >
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap="1rem">
          {repeat(5, (i) => (
            <MiniStatSkeleton key={i} />
          ))}
        </SimpleGrid>
      </SectionCard>

      {/* Growth trend — fake bars read as a chart far better than one grey slab */}
      <SectionCard title="Growth trend" subtitle="New records per month">
        <Box minH="320px">
          <Flex justify="flex-end" gap="3" mb="1.25rem">
            {repeat(4, (i) => (
              <Skeleton key={i} h=".75rem" w="5.5rem" rounded="sm" />
            ))}
          </Flex>
          <Flex align="flex-end" gap={{ base: '1', md: '2' }} h="15rem">
            {CHART_BARS.map((height, i) => (
              <Skeleton
                key={i}
                h={`${height}%`}
                flex="1"
                minW="0.5rem"
                rounded="sm"
              />
            ))}
          </Flex>
        </Box>
      </SectionCard>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="1.5rem">
        {/* Money moved */}
        <SectionCard
          title="Money moved"
          subtitle="Invoiced vs collected in the selected period, per currency"
        >
          <Stack gap="1.25rem">
            {repeat(2, (i) => (
              <Box key={i}>
                <Flex justify="space-between" align="center" mb=".5rem">
                  <Skeleton h=".85rem" w="3rem" rounded="sm" />
                  <Skeleton h=".7rem" w="6rem" rounded="sm" />
                </Flex>
                <SimpleGrid columns={2} gap="3" mb=".625rem">
                  <FigureSkeleton />
                  <FigureSkeleton />
                </SimpleGrid>
                <Skeleton h="6px" w="100%" rounded="full" />
              </Box>
            ))}
          </Stack>
        </SectionCard>

        {/* Subscriptions */}
        <SectionCard title="Subscriptions" subtitle="Across all organizations">
          <Stack gap="1.25rem">
            <Box>
              <Skeleton h=".7rem" w="4rem" mb=".5rem" rounded="sm" />
              <Flex gap="2" wrap="wrap">
                {repeat(3, (i) => (
                  <Skeleton key={i} h="1.75rem" w="6.5rem" rounded="full" />
                ))}
              </Flex>
            </Box>
            <Box>
              <Skeleton h=".7rem" w="3.5rem" mb=".5rem" rounded="sm" />
              <Stack gap=".625rem">
                {repeat(3, (i) => (
                  <BarRowSkeleton key={i} labelWidth="7rem" />
                ))}
              </Stack>
            </Box>
          </Stack>
        </SectionCard>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="1.5rem">
        {/* Most active organizations */}
        <SectionCard
          title="Most active organizations"
          subtitle="Records created in the selected period"
        >
          <Stack gap="1rem">
            {repeat(5, (i) => (
              <Box key={i}>
                <Flex justify="space-between" align="center" gap="3" mb=".5rem">
                  <Flex align="center" gap=".625rem" flex="1" minW={0}>
                    <Skeleton boxSize="1.5rem" rounded="full" flexShrink={0} />
                    <Skeleton h=".85rem" w="55%" rounded="sm" />
                  </Flex>
                  <Skeleton h=".85rem" w="2.5rem" rounded="sm" flexShrink={0} />
                </Flex>
                <Skeleton h="6px" w="100%" rounded="full" />
                <Flex gap="1" mt=".5rem">
                  {repeat(3, (j) => (
                    <Skeleton key={j} h="1rem" w="4.5rem" rounded="sm" />
                  ))}
                </Flex>
              </Box>
            ))}
          </Stack>
        </SectionCard>

        {/* Recently onboarded */}
        <SectionCard
          title="Recently onboarded"
          subtitle="The five newest organizations on the platform"
          flush
        >
          <Stack gap="0">
            {repeat(5, (i) => (
              <Flex
                key={i}
                justify="space-between"
                align="center"
                gap="3"
                px={{ base: '1rem', md: '1.25rem' }}
                py=".875rem"
                borderBottomWidth="1px"
                borderColor="gray.50"
                _last={{ borderBottomWidth: 0 }}
              >
                <Box flex="1" minW={0}>
                  <Skeleton h=".85rem" w="60%" rounded="sm" />
                  <Skeleton h=".7rem" w="40%" mt=".375rem" rounded="sm" />
                </Box>
                <Skeleton
                  h="1.75rem"
                  w="4.5rem"
                  rounded="full"
                  flexShrink={0}
                />
              </Flex>
            ))}
          </Stack>
        </SectionCard>
      </SimpleGrid>
    </Stack>
  );
}
