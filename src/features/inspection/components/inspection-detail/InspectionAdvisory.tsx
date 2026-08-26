import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import type {
  IAdvisoryFinding,
  IInspectionAdvisory,
} from '@/shared/interface/inspection';

/**
 * Advisory groups in the order a customer should read them: what can't wait
 * first, what's already handled last.
 */
const GROUPS: Array<{
  key: string;
  label: string;
  bg: string;
  text: string;
}> = [
  { key: 'fix_now', label: 'Fix now', bg: 'error.50', text: 'error.300' },
  { key: 'due_soon', label: 'Due soon', bg: 'warning.50', text: 'warning.500' },
  { key: 'optional', label: 'Optional', bg: 'primary.50', text: 'primary.300' },
  {
    key: 'completed',
    label: 'Completed',
    bg: 'success.50',
    text: 'success.300',
  },
];

/** "Do not drive" reads better than "0 days left". */
const deadlineLabel = (days?: number) => {
  if (days == null) return null;
  if (days <= 0) return 'Do not drive until fixed';
  return `${days} day${days === 1 ? '' : 's'} left`;
};

export function InspectionAdvisory({
  advisory,
}: {
  advisory: IInspectionAdvisory;
}) {
  const byGroup = GROUPS.map((group) => ({
    ...group,
    findings: (advisory.findings ?? []).filter((f) => f.group === group.key),
  })).filter((group) => group.findings.length > 0);

  return (
    <Stack gap="1.25rem">
      {advisory.verdict && (
        <Box bg="gray.50" rounded=".5rem" p="1rem">
          <Text textStyle="small-semibold" color="gray.500">
            {advisory.verdict.headline}
          </Text>
          <Text textStyle="small-regular" color="gray.400" mt=".25rem">
            {advisory.verdict.summary}
          </Text>
        </Box>
      )}

      {byGroup.map((group) => (
        <Box key={group.key}>
          <Flex align="center" gap="2" mb=".5rem">
            <Text
              textStyle="tiny-regular"
              bg={group.bg}
              color={group.text}
              px=".5rem"
              py=".125rem"
              rounded="full"
              fontWeight="600"
            >
              {group.label}
            </Text>
            <Text textStyle="tiny-regular" color="gray.300">
              {group.findings.length} item
              {group.findings.length === 1 ? '' : 's'}
            </Text>
          </Flex>

          <Stack gap=".5rem">
            {group.findings.map((finding, index) => (
              <AdvisoryRow
                key={`${finding.title}-${index}`}
                finding={finding}
                accent={group.text}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function AdvisoryRow({
  finding,
  accent,
}: {
  finding: IAdvisoryFinding;
  accent: string;
}) {
  const deadline = deadlineLabel(finding.maxDurationLeft);

  return (
    <Box borderWidth="1px" borderColor="gray.50" rounded=".5rem" p="1rem">
      <Flex justify="space-between" align="flex-start" gap="3" wrap="wrap">
        <Text textStyle="small-semibold" color="gray.500">
          {finding.title}
        </Text>
        {deadline && (
          <Text textStyle="tiny-regular" color={accent} fontWeight="600">
            {deadline}
          </Text>
        )}
      </Flex>

      <Text textStyle="small-regular" color="gray.400" mt=".375rem">
        {finding.observation}
      </Text>

      {finding.danger && (
        <Text textStyle="tiny-regular" color="error.300" mt=".375rem">
          If left: {finding.danger}
        </Text>
      )}

      {finding.components?.length > 0 && (
        <Flex gap="1" wrap="wrap" mt=".5rem">
          {finding.components.map((component) => (
            <Text
              key={component}
              textStyle="tiny-regular"
              color="gray.300"
              bg="gray.50"
              px=".375rem"
              rounded="sm"
            >
              {component}
            </Text>
          ))}
        </Flex>
      )}
    </Box>
  );
}
