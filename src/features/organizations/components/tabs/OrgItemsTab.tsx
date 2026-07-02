import { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { CustomTable } from '@/components/table';
import { SearchInput } from '@/components/input';
import { useUrlState } from '@/hooks/useUrlState';
import { useGetItems } from '@/features/items/api/query';
import { itemListColumns } from '@/features/items/components/item-columns';

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: '' },
};

export function OrgItemsTab() {
  const { id } = useParams<{ id: string }>();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, {
    replace: true,
    prefix: 'item_',
  });
  const [searchInput, setSearchInput] = useState(filters.search);

  const { data, isPending } = useGetItems(
    {
      organizationId: id,
      page: filters.page,
      limit: filters.limit,
      ...(filters.search ? { search: filters.search } : {}),
    },
    { enabled: !!id }
  );

  const items = data?.data || [];
  const meta = data?.meta;

  return (
    <Flex direction="column" gap="1rem">
      <SearchInput
        placeholder="Search items"
        value={searchInput}
        onChange={setSearchInput}
        onSearch={(val) => setFilters({ search: val, page: 1 })}
        debounceMs={500}
        loading={isPending}
        width={{ base: '100%', md: '22rem' }}
      />

      <CustomTable
        data={items}
        columns={itemListColumns}
        loading={isPending}
        NoDataText="No items for this organization"
        pagination={{
          pageIndex: filters.page - 1,
          pageSize: filters.limit,
        }}
        setPagination={({ pageIndex }) => setFilters({ page: pageIndex + 1 })}
        pageCount={meta?.totalPages ?? 1}
        totalItems={meta?.total}
        hasNextPage={filters.page < (meta?.totalPages ?? 1)}
        hasPrevPage={filters.page > 1}
      />
    </Flex>
  );
}
