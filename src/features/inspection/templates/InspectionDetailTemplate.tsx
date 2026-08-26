import {
  Box,
  Button,
  Center,
  Flex,
  Image,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { ArrowLeft } from '@/assets/custom';
import Status from '@/components/ui/Status';
import { RouteConstants } from '@/shared/constants/routes';
import { pascalToCapitalized } from '@/utils/string-formatter';
import { useGetInspectionByIdQuery } from '../api';
import { InspectionFindings } from '../components/inspection-detail/InspectionFindings';
import { InspectionAdvisory } from '../components/inspection-detail/InspectionAdvisory';

const formatDate = (value?: string | null) =>
  value ? moment(value).format('DD MMM YYYY, h:mm A') : '—';

export function InspectionDetailTemplate() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetInspectionByIdQuery(id);

  const inspection = data?.data;

  if (isLoading) {
    return (
      <Stack gap="1.5rem">
        <Skeleton height="3rem" width="20rem" rounded="md" bg="gray.50" />
        <Skeleton height="9rem" rounded=".625rem" bg="gray.50" />
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="1.5rem">
          <Skeleton height="16rem" rounded=".625rem" bg="gray.50" />
          <Skeleton height="16rem" rounded=".625rem" bg="gray.50" />
        </SimpleGrid>
      </Stack>
    );
  }

  if (isError || !inspection) {
    return (
      <Center py="20">
        <Stack gap="3" align="center">
          <Text color="error.300">Inspection not found.</Text>
          <Button
            size="sm"
            variant="outlineSecondary"
            onClick={() => navigate(RouteConstants.inspection.base.path)}
          >
            Back to inspections
          </Button>
        </Stack>
      </Center>
    );
  }

  const vehicle =
    [inspection.vehicleYear, inspection.vehicleMake, inspection.vehicleModel]
      .filter(Boolean)
      .join(' ') || '—';

  const findings = inspection.findings ?? [];
  const checklists = inspection.inspectionChecklists ?? [];

  // Checklist entries arrive ordered by category; group them for display.
  const byCategory = checklists.reduce<Record<string, typeof checklists>>(
    (acc, entry) => {
      const category = entry.checklistItem?.category || 'Uncategorised';
      (acc[category] ??= []).push(entry);
      return acc;
    },
    {}
  );

  return (
    <Stack gap="1.5rem">
      <Flex
        as="button"
        align="center"
        gap=".5rem"
        alignSelf="flex-start"
        onClick={() => navigate(RouteConstants.inspection.base.path)}
        aria-label="Back to inspections"
      >
        <ArrowLeft width="1.25rem" color="gray.500" />
        <Text fontSize=".875rem" color="gray.500">
          Back to Inspections
        </Text>
      </Flex>

      {/* Header */}
      <Panel>
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="1rem"
        >
          <Box minW={0}>
            <Flex align="center" gap=".75rem" wrap="wrap">
              <Text textStyle="h3-bold" color="gray.500">
                {inspection.jobCode}
              </Text>
              <Status
                name={pascalToCapitalized(inspection.status)}
                px=".5rem"
                w="auto"
                minW="6rem"
                whiteSpace="nowrap"
              />
            </Flex>
            <Text textStyle="small-regular" color="gray.300" mt=".25rem">
              {inspection.organization ? (
                <Link
                  to={RouteConstants.organizations.detail.generate({
                    id: inspection.organization.id,
                  })}
                >
                  <Text as="span" color="primary.300">
                    {inspection.organization.name}
                  </Text>
                </Link>
              ) : (
                '—'
              )}{' '}
              · Inspected {formatDate(inspection.inspectionDate)}
            </Text>
          </Box>

          <Flex gap="2" wrap="wrap">
            {inspection.jobCard && (
              <Button size="sm" variant="outlineSecondary" disabled>
                Job card {inspection.jobCard.jobNumber}
              </Button>
            )}
            {inspection.pdfUrl && (
              <Button size="sm" asChild>
                <a
                  href={inspection.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open PDF report
                </a>
              </Button>
            )}
          </Flex>
        </Flex>
      </Panel>

      {/* Customer + vehicle */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="1.5rem">
        <Panel title="Customer">
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
            <Field label="Name" value={inspection.customerName} />
            <Field label="Phone" value={inspection.customerPhone} />
            <Field label="Email" value={inspection.customerEmail} />
            <Field label="Technician" value={inspection.technicianName} />
          </SimpleGrid>
        </Panel>

        <Panel title="Vehicle">
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
            <Field label="Vehicle" value={vehicle} />
            <Field
              label="Registration"
              value={inspection.vehicleRegistrationNumber}
            />
            <Field label="VIN" value={inspection.vehicleVin} />
            <Field label="Colour" value={inspection.vehicleColor} />
          </SimpleGrid>
        </Panel>
      </SimpleGrid>

      {/* Advisory */}
      {inspection.advisory && (
        <Panel
          title="Advisory"
          subtitle="Reviewed by the technician before being sent to the customer"
        >
          <InspectionAdvisory advisory={inspection.advisory} />
        </Panel>
      )}

      {/* Findings */}
      <Panel title={`Findings (${findings.length})`}>
        <InspectionFindings findings={findings} />
      </Panel>

      {/* Checklist */}
      {checklists.length > 0 && (
        <Panel title={`Checklist (${checklists.length})`}>
          <Stack gap="1.25rem">
            {Object.entries(byCategory).map(([category, entries]) => (
              <Box key={category}>
                <Text textStyle="tiny-regular" color="gray.300" mb=".5rem">
                  {pascalToCapitalized(category)}
                </Text>
                <Stack gap=".375rem">
                  {entries.map((entry) => (
                    <Flex
                      key={entry.id}
                      justify="space-between"
                      align="flex-start"
                      gap="3"
                      borderBottomWidth="1px"
                      borderColor="gray.50"
                      pb=".375rem"
                      _last={{ borderBottomWidth: 0, pb: 0 }}
                    >
                      <Box minW={0}>
                        <Text textStyle="small-regular" color="gray.500">
                          {entry.checklistItem?.name}
                          {entry.checklistItem?.isRequired && (
                            <Text as="span" color="error.300">
                              {' '}
                              *
                            </Text>
                          )}
                        </Text>
                        {entry.notes && (
                          <Text textStyle="tiny-regular" color="gray.300">
                            {entry.notes}
                          </Text>
                        )}
                      </Box>
                      <Text
                        textStyle="tiny-regular"
                        fontWeight="600"
                        whiteSpace="nowrap"
                        color={
                          entry.status === 'OK'
                            ? 'success.300'
                            : entry.status === 'NEEDS_FIX'
                              ? 'error.300'
                              : 'gray.200'
                        }
                      >
                        {pascalToCapitalized(entry.status)}
                      </Text>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Panel>
      )}

      {/* Notes + photos */}
      {(inspection.generalNotes || inspection.photos?.length > 0) && (
        <Panel title="Notes & photos">
          {inspection.generalNotes && (
            <Text
              textStyle="small-regular"
              color="gray.400"
              whiteSpace="pre-line"
            >
              {inspection.generalNotes}
            </Text>
          )}
          {inspection.photos?.length > 0 && (
            <SimpleGrid
              columns={{ base: 2, md: 4 }}
              gap="3"
              mt={inspection.generalNotes ? '1rem' : '0'}
            >
              {inspection.photos.map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt="Inspection photo"
                  rounded=".375rem"
                  objectFit="cover"
                  h="7rem"
                  w="100%"
                  borderWidth="1px"
                  borderColor="gray.50"
                />
              ))}
            </SimpleGrid>
          )}
        </Panel>
      )}
    </Stack>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded=".625rem"
      shadow="sm"
      overflow="hidden"
    >
      {title && (
        <Box
          px="1.25rem"
          py=".875rem"
          borderBottomWidth="1px"
          borderColor="gray.75"
        >
          <Text textStyle="default-bold" color="gray.500">
            {title}
          </Text>
          {subtitle && (
            <Text textStyle="tiny-regular" color="gray.300" mt=".125rem">
              {subtitle}
            </Text>
          )}
        </Box>
      )}
      <Box px="1.25rem" py="1.25rem">
        {children}
      </Box>
    </Box>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Text textStyle="tiny-regular" color="gray.300">
        {label}
      </Text>
      <Text textStyle="small-regular" color="gray.500" mt=".125rem">
        {value || '—'}
      </Text>
    </Box>
  );
}
