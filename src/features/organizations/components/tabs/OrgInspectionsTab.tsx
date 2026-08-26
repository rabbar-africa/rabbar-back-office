import { useParams } from 'react-router-dom';
import { InspectionsTable } from '@/features/inspection/components/inspection-list/InspectionsTable';

export function OrgInspectionsTab() {
  const { id } = useParams<{ id: string }>();
  return <InspectionsTable organizationId={id} urlPrefix="inspection_" />;
}
