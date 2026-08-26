import { Box, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Removes the body padding for edge-to-edge lists. */
  flush?: boolean;
}

/** White panel with a titled header — the shell every dashboard section uses. */
export function SectionCard({
  title,
  subtitle,
  action,
  children,
  flush,
}: SectionCardProps) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded=".625rem"
      shadow="sm"
      overflow="hidden"
      h="100%"
    >
      <Flex
        justify="space-between"
        align="center"
        gap="3"
        px={{ base: '1rem', md: '1.25rem' }}
        py=".875rem"
        borderBottomWidth="1px"
        borderColor="gray.75"
      >
        <Box>
          <Text textStyle="default-bold" color="gray.500">
            {title}
          </Text>
          {subtitle && (
            <Text textStyle="tiny-regular" color="gray.300" mt=".125rem">
              {subtitle}
            </Text>
          )}
        </Box>
        {action}
      </Flex>
      <Box
        px={flush ? '0' : { base: '1rem', md: '1.25rem' }}
        py={flush ? '0' : '1rem'}
      >
        {children}
      </Box>
    </Box>
  );
}
