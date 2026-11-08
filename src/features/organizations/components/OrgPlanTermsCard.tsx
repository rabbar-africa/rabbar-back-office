import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import moment from 'moment';
import ConsentDialog from '@/components/common/ConsentDialog';
import SectionLoader from '@/components/common/SectionLoader';
import {
  differences,
  fromRows,
} from '@/features/billing/components/entitlements/draft';
import type { IOrgEntitlements } from '@/shared/interface/plan-entitlements';
import { useClearOrganizationEntitlements } from '../api/query';
import { OrgTermsModal } from './OrgTermsModal';

interface OrgPlanTermsCardProps {
  orgId: string;
  data?: IOrgEntitlements;
  isPending: boolean;
  planName: (tier?: string | null) => string;
}

/** Where the business's terms stand, in one sentence. */
function describeTerms(
  data: IOrgEntitlements,
  planName: (tier?: string | null) => string
): { tag?: { label: string; palette: string }; text: string } {
  const { terms, planOnFile, effectiveTier } = data;
  const onFile = planName(planOnFile);
  const now = planName(effectiveTier);
  const lapsed = effectiveTier !== planOnFile;

  if (!terms.agreedFor) {
    return {
      text: lapsed
        ? `No terms of its own. ${onFile} has lapsed, so it is on ${now} until it is paid up.`
        : `No terms of its own: it gets ${onFile} as everyone on it does.`,
    };
  }
  if (terms.applies) {
    return {
      tag: { label: 'Agreed terms', palette: 'green' },
      text: `Terms agreed for ${planName(terms.agreedFor)} are in force.`,
    };
  }
  if (terms.stale) {
    return {
      tag: { label: 'Not in force', palette: 'gray' },
      text: `Terms were agreed for ${planName(terms.agreedFor)}; not in force on ${onFile}. They apply again only if it goes back to ${planName(terms.agreedFor)}.`,
    };
  }
  return {
    tag: { label: 'Lapsed', palette: 'orange' },
    text: `Terms agreed for ${onFile}, but the plan has lapsed, so it is on ${now} for now. They apply again once it is paid up.`,
  };
}

/**
 * What this business can do now, and the terms agreed with it (an
 * Enterprise deal, or a favour), laid over its plan.
 */
export function OrgPlanTermsCard({
  orgId,
  data,
  isPending,
  planName,
}: OrgPlanTermsCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const clear = useClearOrganizationEntitlements();

  if (isPending) return <SectionLoader />;
  if (!data) return null;

  const status = describeTerms(data, planName);
  // Values differ from the plan only because of terms when it is on that plan.
  const comparable = data.effectiveTier === data.planOnFile;
  const diff = comparable
    ? differences(fromRows(data.effective), fromRows(data.plan))
    : { features: [], limits: [], count: 0 };
  const planLimits = new Map(data.plan.limits.map((row) => [row.key, row]));
  const planFeatures = new Map(data.plan.features.map((row) => [row.key, row]));
  const limits = data.effective.limits.filter((row) => !row.comingSoon);
  const features = data.effective.features.filter((row) => !row.comingSoon);
  const agreedFeatures = data.effective.features.filter((row) =>
    diff.features.includes(row.key)
  );

  return (
    <Box bg="white" border="1px solid #EBEBEB" rounded="lg" p="1.5rem">
      <Flex
        justify="space-between"
        align="flex-start"
        mb="1rem"
        wrap="wrap"
        gap="1rem"
      >
        <Box maxW="40rem">
          <Flex align="center" gap=".75rem">
            <Text fontSize="1.125rem" fontWeight="600">
              Plan & terms
            </Text>
            {status.tag && (
              <Badge
                size="sm"
                variant="subtle"
                colorPalette={status.tag.palette}
              >
                {status.tag.label}
              </Badge>
            )}
          </Flex>
          <Text textStyle="small-regular" color="gray.400" mt=".25rem">
            {status.text}
          </Text>
        </Box>

        <Flex gap=".75rem" wrap="wrap">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit terms
          </Button>
          {data.terms.agreedFor && (
            <Button
              variant="outline"
              color="error.300"
              borderColor="error.300"
              _hover={{ bg: 'error.50' }}
              onClick={() => setClearOpen(true)}
            >
              Remove terms
            </Button>
          )}
        </Flex>
      </Flex>

      {data.terms.note && (
        <Box bg="gray.50" rounded=".5rem" px=".875rem" py=".625rem" mb="1rem">
          <Text textStyle="tiny-semibold" color="gray.300">
            WHAT WAS AGREED
          </Text>
          <Text
            textStyle="small-regular"
            color="gray.500"
            whiteSpace="pre-wrap"
          >
            {data.terms.note}
          </Text>
          {data.terms.updatedAt && (
            <Text textStyle="tiny-regular" color="gray.300" mt=".25rem">
              Updated {moment(data.terms.updatedAt).format('DD MMM YYYY')}
            </Text>
          )}
        </Box>
      )}

      <Text textStyle="tiny-semibold" color="gray.300" mb=".5rem">
        WHAT IT CAN DO NOW · {planName(data.effectiveTier).toUpperCase()}
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap=".75rem 1.25rem">
        {limits.map((row) => {
          const agreed = diff.limits.includes(row.key);
          return (
            <Box key={row.key}>
              <Flex align="center" gap=".375rem">
                <Text fontSize=".8125rem" color="gray.500">
                  {row.label}
                </Text>
                {agreed && (
                  <Badge size="xs" variant="subtle" colorPalette="orange">
                    Agreed
                  </Badge>
                )}
              </Flex>
              <Text fontSize=".9375rem" fontWeight="500">
                {row.phrase}
              </Text>
              {agreed && (
                <Text textStyle="tiny-regular" color="gray.300">
                  Plan: {planLimits.get(row.key)?.phrase}
                </Text>
              )}
            </Box>
          );
        })}
      </SimpleGrid>

      <Stack gap=".25rem" mt="1rem">
        <Text textStyle="small-regular" color="gray.400">
          {features.filter((row) => row.included).length} of {features.length}{' '}
          features on
          {agreedFeatures.length > 0 ? ', agreed separately:' : '.'}
        </Text>
        {agreedFeatures.map((row) => (
          <Text key={row.key} textStyle="small-regular" color="gray.500">
            {row.included ? '✓' : '✕'} {row.label}{' '}
            <Text as="span" textStyle="tiny-regular" color="gray.300">
              (plan: {planFeatures.get(row.key)?.included ? 'on' : 'off'})
            </Text>
          </Text>
        ))}
      </Stack>

      <OrgTermsModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        orgId={orgId}
        data={data}
        planName={planName}
      />

      <ConsentDialog
        open={clearOpen}
        onOpenChange={({ open }) => setClearOpen(open)}
        handleSubmit={() =>
          clear.mutate(orgId, { onSuccess: () => setClearOpen(false) })
        }
        isLoading={clear.isPending}
        heading="Remove this business's terms?"
        note={`It goes back to ${planName(data.planOnFile)} as everyone on it has it, straight away, and the note is deleted. Nothing it already has is deleted: over a limit, it just can't add more.`}
        confirmText="Yes, Remove"
        cancelText="Keep Terms"
        variant="danger"
      />
    </Box>
  );
}
