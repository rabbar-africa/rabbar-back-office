import { useParams } from 'react-router-dom';
import { OrgRolesPanel } from '@/features/access/components/OrgRolesPanel';

export function OrgRolesTab() {
  const { id } = useParams<{ id: string }>();
  return <OrgRolesPanel orgId={id ?? ''} />;
}
