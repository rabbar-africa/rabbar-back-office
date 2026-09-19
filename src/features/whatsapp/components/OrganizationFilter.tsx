import { useMemo, useState } from 'react';
import { Box, CloseButton, Flex } from '@chakra-ui/react';
import { SearchCombobox } from '@/components/input';
import { useGetOrganizations } from '@/features/organizations/api/query';

interface OrganizationFilterProps {
  organizationId: string;
  /** Kept alongside the id so the choice still reads after a reload. */
  organizationName: string;
  onChange: (organization: { id: string; name: string } | null) => void;
}

/** Type-to-search organization picker for narrowing a platform-wide view. */
export function OrganizationFilter({
  organizationId,
  organizationName,
  onChange,
}: OrganizationFilterProps) {
  const [search, setSearch] = useState('');
  const { data, isFetching } = useGetOrganizations({
    page: 1,
    limit: 15,
    ...(search ? { search } : {}),
  });

  const options = useMemo(() => {
    const found = (data?.data ?? []).map((org) => ({
      label: org.name,
      value: org.id,
      subLabel: org.companyEmail || undefined,
    }));
    // The selected organization may not be in the current search results.
    if (organizationId && !found.some((o) => o.value === organizationId))
      found.unshift({
        label: organizationName || 'Selected organization',
        value: organizationId,
        subLabel: undefined,
      });
    return found;
  }, [data, organizationId, organizationName]);

  return (
    <Flex align="center" gap="1" w={{ base: '100%', md: '15rem' }}>
      <Box flex="1" minW={0}>
        <SearchCombobox
          placeholder="All organizations"
          options={options}
          value={organizationId}
          onChange={(id, option) => onChange({ id, name: option.label })}
          onSearchChange={setSearch}
          searchDebounceMs={400}
          serverSearch
          isLoading={isFetching}
          emptyText="No organization matches"
        />
      </Box>
      {organizationId && (
        <CloseButton
          size="sm"
          aria-label="Clear organization filter"
          onClick={() => onChange(null)}
        />
      )}
    </Flex>
  );
}
