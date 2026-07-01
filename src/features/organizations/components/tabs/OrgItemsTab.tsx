import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { formatAmount } from '@/utils/format-number';
import type { Item } from '@/shared/interface/item';
import { itemsData } from '@/features/items/data';

const columns: ColumnDef<Item, any>[] = [
  { accessorKey: 'code', header: 'Code' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'unit', header: 'Unit' },
  {
    accessorKey: 'unitPrice',
    header: 'Rate',
    cell: ({ getValue }) => formatAmount(getValue() as number),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <Status name={getValue() as string} />,
  },
];

export function OrgItemsTab() {
  return (
    <CustomTable
      data={itemsData}
      columns={columns}
      NoDataText="No items for this organization"
    />
  );
}
