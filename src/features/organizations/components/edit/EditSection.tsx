import { Box, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface EditSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function EditSection({
  title,
  subtitle,
  action,
  children,
}: EditSectionProps) {
  return (
    <Box
      bg="white"
      border="1px solid #EBEBEB"
      rounded="lg"
      p="1.5rem"
      maxW="56rem"
    >
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        gap="1rem"
        direction={{ base: 'column', sm: 'row' }}
        mb="1.5rem"
      >
        <Box>
          <Text fontSize="1.125rem" fontWeight="600" color="gray.500">
            {title}
          </Text>
          {subtitle && (
            <Text fontSize=".8125rem" color="gray.400" mt=".25rem">
              {subtitle}
            </Text>
          )}
        </Box>
        {action}
      </Flex>

      {children}
    </Box>
  );
}
