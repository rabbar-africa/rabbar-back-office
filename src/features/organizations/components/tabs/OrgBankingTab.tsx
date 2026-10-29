import { useParams } from 'react-router-dom';
import { OrgBankingPanel } from '@/features/banking/components/OrgBankingPanel';
import { useGetOrganizationById } from '../../api/query';

/** The organization's statements: the whole business, and each account. */
export function OrgBankingTab() {
  const { id = '' } = useParams<{ id: string }>();
  const { data } = useGetOrganizationById(id);
  const organization = data?.data;
  return (
    <OrgBankingPanel
      orgId={id}
      businessEmail={organization?.companyEmail || organization?.email}
    />
  );
}
