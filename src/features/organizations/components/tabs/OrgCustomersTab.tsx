import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import type { ICustomer } from '@/shared/interface/customer';
import { customersData } from '@/features/customers/data';

const columns: ColumnDef<ICustomer, any>[] = [
  { accessorKey: 'displayName', header: 'Name' },
  { accessorKey: 'company', header: 'Company' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'stage', header: 'Stage' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <Status name={getValue() as string} />,
  },
];

export function OrgCustomersTab() {
  return (
    <CustomTable
      data={customersData}
      columns={columns}
      NoDataText="No customers for this organization"
    />
  );
}
