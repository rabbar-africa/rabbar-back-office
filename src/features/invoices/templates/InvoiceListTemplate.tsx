import { useMemo } from 'react';
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
import { organizationColumn } from '@/features/organizations/components/organization-column';
import { RefreshButton } from '@/components/common/RefreshButton';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { IInvoiceResponse } from '@/shared/interface/invoice';

export function InvoiceListTemplate() {
  const navigate = useNavigate();
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
  } = useInvoiceList();

  const baseColumns = useInvoiceListColumns();
  // Cross-organization list: say whose invoice each row is, after Invoice #.
  const columns = useMemo(
    () => [
      baseColumns[0],
      organizationColumn<IInvoiceResponse>('invoices'),
      ...baseColumns.slice(1),
    ],
    [baseColumns]
  );

  const selectionCount = selectedInvoices.length;
  const downloadFilename =
    selectionCount > 0 ? 'invoices-selected' : 'invoices';
  const downloadLabel =
    selectionCount > 0
      ? `Export ${selectionCount} selected`
      : 'Export all (CSV)';

  return (
    <>
      <Stack gap="6">
        <PageHeader
          title="Invoices"
          subtitle="Every organization's invoices"
          action={
            <Flex gap="2" wrap="wrap">
              <DownloadButton
                data={csvData}
                filename={downloadFilename}
                headers={INVOICE_CSV_HEADERS}
                label={downloadLabel}
              />
              <Button
                onClick={() => navigate(RouteConstants.invoices.create.path)}
              >
                New Invoice
              </Button>
            </Flex>
          }
        />

        <Box
          pt={{ base: '1.25rem', md: '2rem' }}
          pb={{ base: '1.25rem', md: '2rem' }}
          bg="white"
          px={{ base: '0.75rem', md: '1rem' }}
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Flex justify="space-between" align="center" mb="1rem">
            <Box>
              <Text
                textStyle={{ base: 'default-bold', md: 'large-bold' }}
                color="gray.500"
              >
                All Invoices
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                {selectionCount > 0
                  ? `${selectionCount} selected`
                  : 'Click a row to view invoice details'}
              </Text>
            </Box>
            <RefreshButton
              queryKeys={[[customQueryKey.invoices.getAll]]}
              label="Reload invoices"
            />
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
              setPagination={({ pageIndex }) =>
                setFilters({ page: pageIndex + 1 })
              }
              pageCount={meta?.totalPages ?? 1}
              totalItems={meta?.total}
              hasNextPage={filters.page < (meta?.totalPages ?? 1)}
              hasPrevPage={filters.page > 1}
            />
          </Box>
        </Box>
      </Stack>

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
