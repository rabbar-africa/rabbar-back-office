import { Button, Flex, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/table';
import Status from '@/components/common/Status';
import { RouteConstants } from '@/shared/constants/routes';
import type { IInspection } from '@/shared/interface/inspection';
import { inspectionData } from '../data';

const columns: ColumnDef<IInspection, any>[] = [
  { accessorKey: 'jobCode', header: 'Job Code' },
  { accessorKey: 'customerName', header: 'Customer' },
  { accessorKey: 'technicianName', header: 'Technician' },
  { accessorKey: 'vehicleRegistrationNumber', header: 'Vehicle Reg.' },
  { accessorKey: 'inspectionDate', header: 'Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <Status name={getValue() as string} />,
  },
];

export function InspectionTemplate() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" gap="1.5rem">
      <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
        <Heading fontSize="1.5rem" fontWeight="600">
          Inspection
        </Heading>
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          onClick={() =>
            navigate(RouteConstants.inspection.createInspection.path)
          }
        >
          New Inspection
        </Button>
      </Flex>

      <CustomTable
        data={inspectionData}
        columns={columns}
        NoDataText="No inspections yet"
      />
    </Flex>
  );
}
