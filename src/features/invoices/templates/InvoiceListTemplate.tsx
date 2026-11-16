import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CustomTable } from '@/components/table';
import { PageHeader } from '@/components/common/PageHeader';
import { DownloadButton } from '@/components/common/DownloadButton';
import { RouteConstants } from '@/shared/constants/routes';
import { useInvoiceList } from '@/features/invoices/components/invoice-list/useInvoiceList';
import {
  INVOICE_CSV_HEADERS,
  useInvoiceListColumns,
} from '@/features/invoices/components/invoice-list/columns';
import { InvoiceFilters } from '@/features/invoices/components/invoice-list/InvoiceFilters';
import { DeleteInvoiceConfirm } from '@/features/invoices/components/invoice-list/DeleteInvoiceConfirm';
import { OneBusinessGate } from '@/features/organizations/components/OneBusinessGate';
import { RefreshButton } from '@/components/common/RefreshButton';
import { customQueryKey } from '@/shared/constants/query-keys';

/** One business's invoices at a time. */
export function InvoiceListTemplate() {
  const navigate = useNavigate();
  return (
    <Stack gap="6">
      <PageHeader
        title="Invoices"
        subtitle="A business's invoices"
        action={
          <Button onClick={() => navigate(RouteConstants.invoices.create.path)}>
            New Invoice
          </Button>
        }
      />
      <OneBusinessGate records="invoices" tab="invoices">
        {(business) => <InvoiceList organizationId={business.id} />}
      </OneBusinessGate>
    </Stack>
  );
}

function InvoiceList({ organizationId }: { organizationId: string }) {
  const {
    invoices,
    meta,
    isLoading,
    isFetching,
    csvData,
    selectedInvoices,

    filters,
    setFilters,
    searchInput,
    setSearchInput,
    handleSearchCommit,

    rowSelection,
    setRowSelection,

    tableActions,
    navigateToDetail,

    pendingDelete,
    confirmDelete,
    cancelDelete,
    isDeleting,
  } = useInvoiceList(organizationId);

  const columns = useInvoiceListColumns();

  const selectionCount = selectedInvoices.length;
  const downloadFilename =
    selectionCount > 0 ? 'invoices-selected' : 'invoices';
  const downloadLabel =
    selectionCount > 0
      ? `Export ${selectionCount} selected`
      : 'Export all (CSV)';

  return (
    <>
      <Flex justify="space-between" align="center" mb="1rem">
        <Box>
          <Text
            textStyle={{ base: 'default-bold', md: 'large-bold' }}
            color="gray.500"
          >
            Invoices
          </Text>
          <Text textStyle="small-regular" color="gray.300">
            {selectionCount > 0
              ? `${selectionCount} selected`
              : 'Click a row to view invoice details'}
          </Text>
        </Box>
        <Flex gap="2" align="center" wrap="wrap">
          <DownloadButton
            data={csvData}
            filename={downloadFilename}
            headers={INVOICE_CSV_HEADERS}
            label={downloadLabel}
          />
          <RefreshButton
            queryKeys={[[customQueryKey.invoices.getAll]]}
            label="Reload invoices"
          />
        </Flex>
      </Flex>

      <InvoiceFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchCommit={handleSearchCommit}
        status={filters.status}
        onStatusChange={(val) => setFilters({ status: val, page: 1 })}
        isLoading={isFetching}
      />

      <Box overflowX="auto" minW={0}>
        <CustomTable
          stickyHeader
          data={invoices}
          columns={columns}
          loading={isLoading}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(row) => row.id}
          enableActions
          actions={tableActions}
          onRowClick={(row) => navigateToDetail(row.original)}
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
      </Box>

      <DeleteInvoiceConfirm
        target={
          pendingDelete
            ? {
                id: pendingDelete.id,
                invoiceNumber: pendingDelete.invoiceNumber,
              }
            : null
        }
        isDeleting={isDeleting}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}
