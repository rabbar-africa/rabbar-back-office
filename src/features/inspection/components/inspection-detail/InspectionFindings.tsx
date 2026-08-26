import { Box, Flex, Image, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { pascalToCapitalized } from '@/utils/string-formatter';
import {
  findingSeverity,
  type IInspectionFinding,
  type FindingSeverity,
} from '@/shared/interface/inspection';

/** Colour per collapsed severity — the same three buckets the backend uses. */
const SEVERITY_STYLE: Record<
  FindingSeverity,
  { bg: string; text: string; bar: string }
> = {
  pass: { bg: 'success.50', text: 'success.300', bar: 'success.300' },
  warning: { bg: 'warning.50', text: 'warning.500', bar: 'warning.400' },
  fail: { bg: 'error.50', text: 'error.300', bar: 'error.300' },
};

interface InspectionFindingsProps {
  findings: IInspectionFinding[];
}

export function InspectionFindings({ findings }: InspectionFindingsProps) {
  if (!findings.length) {
    return (
      <Text textStyle="small-regular" color="gray.300">
        No findings recorded on this inspection.
      </Text>
    );
  }

  return (
    <Stack gap=".75rem">
      {findings.map((finding, index) => {
        const severity = findingSeverity(finding.status);
        const style = SEVERITY_STYLE[severity];

        return (
          <Flex
            key={`${finding.component}-${index}`}
            borderWidth="1px"
            borderColor="gray.50"
            rounded=".5rem"
            overflow="hidden"
          >
            <Box w="3px" bg={style.bar} flexShrink={0} aria-hidden />
            <Box p="1rem" flex="1" minW={0}>
              <Flex justify="space-between" align="flex-start" gap="3">
                <Text textStyle="small-semibold" color="gray.500">
                  {finding.component}
                </Text>
                <Text
                  textStyle="tiny-regular"
                  bg={style.bg}
                  color={style.text}
                  px=".5rem"
                  py=".125rem"
                  rounded="full"
                  fontWeight="600"
                  whiteSpace="nowrap"
                >
                  {pascalToCapitalized(finding.status)}
                </Text>
              </Flex>

              {finding.observation && (
                <Text textStyle="small-regular" color="gray.400" mt=".375rem">
                  {finding.observation}
                </Text>
              )}

              {finding.images && finding.images.length > 0 && (
                <SimpleGrid columns={{ base: 2, sm: 4 }} gap="2" mt=".75rem">
                  {finding.images.map((src) => (
                    <Image
                      key={src}
                      src={src}
                      alt={`${finding.component} photo`}
                      rounded=".375rem"
                      objectFit="cover"
                      h="5rem"
                      w="100%"
                      borderWidth="1px"
                      borderColor="gray.50"
                    />
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </Flex>
        );
      })}
    </Stack>
  );
}
