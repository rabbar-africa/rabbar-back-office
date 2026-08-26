import { Box, Flex, Skeleton, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Small line under the value, e.g. "of 240 total". */
  helperText?: ReactNode;
  /** Right-aligned badge, e.g. a period delta. */
  badge?: ReactNode;
  /** Accent bar colour token, e.g. "success.300". */
  accent?: string;
}

/**
 * Chrome shared by the real tile and its skeleton, so the placeholder occupies
 * exactly the same box and nothing shifts when the figures arrive.
 */
function StatCardShell({
  accent,
  children,
}: {
  accent: string;
  children: ReactNode;
}) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded=".625rem"
      shadow="sm"
      p="1.25rem"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        w="3px"
        h="100%"
        bg={accent}
        aria-hidden
      />
      {children}
    </Box>
  );
}

/** Single KPI tile. Kept dumb — every figure is computed by the caller. */
export function StatCard({
  label,
  value,
  helperText,
  badge,
  accent = 'primary.300',
}: StatCardProps) {
  return (
    <StatCardShell accent={accent}>
      <Flex justify="space-between" align="flex-start" gap="2">
        <Text textStyle="small-regular" color="gray.300">
          {label}
        </Text>
        {badge}
      </Flex>
      <Text
        fontSize={{ base: '1.375rem', md: '1.75rem' }}
        fontWeight="700"
        color="gray.500"
        mt=".25rem"
        lineHeight="1.2"
      >
        {value}
      </Text>
      {helperText && (
        <Text textStyle="tiny-regular" color="gray.200" mt=".375rem">
          {helperText}
        </Text>
      )}
    </StatCardShell>
  );
}

/** Placeholder for {@link StatCard}, matching its footprint line for line. */
export function StatCardSkeleton() {
  return (
    <StatCardShell accent="gray.75">
      <Flex justify="space-between" align="flex-start" gap="2">
        <Skeleton h=".875rem" w="7rem" rounded="sm" />
        <Skeleton h=".75rem" w="3.25rem" rounded="sm" />
      </Flex>
      <Skeleton
        h={{ base: '1.65rem', md: '2.1rem' }}
        w="9rem"
        mt=".25rem"
        rounded="sm"
      />
      <Skeleton h=".75rem" w="11rem" mt=".5rem" rounded="sm" />
    </StatCardShell>
  );
}

/** Chrome shared by {@link MiniStat} and {@link MiniStatSkeleton}. */
function MiniStatShell({ children }: { children: ReactNode }) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded=".625rem"
      px="1rem"
      py=".875rem"
    >
      {children}
    </Box>
  );
}

/** Compact counter tile used for the denser "totals" rows. */
export function MiniStat({
  label,
  value,
  color = 'gray.500',
}: {
  label: string;
  value: ReactNode;
  color?: string;
}) {
  return (
    <MiniStatShell>
      <Text fontSize="1.25rem" fontWeight="700" color={color}>
        {value}
      </Text>
      <Text textStyle="tiny-regular" color="gray.300" mt=".125rem">
        {label}
      </Text>
    </MiniStatShell>
  );
}

/** Placeholder for {@link MiniStat}. */
export function MiniStatSkeleton() {
  return (
    <MiniStatShell>
      <Skeleton h="1.5rem" w="3.5rem" rounded="sm" />
      <Skeleton h=".75rem" w="5rem" mt=".375rem" rounded="sm" />
    </MiniStatShell>
  );
}
