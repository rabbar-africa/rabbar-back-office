import { useParams } from 'react-router-dom';
import { JobCardsTable } from '@/features/job-cards/components/JobCardsTable';

export function OrgJobCardsTab() {
  const { id } = useParams<{ id: string }>();
  return <JobCardsTable organizationId={id} urlPrefix="jobcard_" />;
}
