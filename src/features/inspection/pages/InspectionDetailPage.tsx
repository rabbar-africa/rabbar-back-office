import { Head } from '@/components/seo/head';
import { UserDashboardContainer } from '@/components/hoc';
import { InspectionDetailTemplate } from '../templates/InspectionDetailTemplate';

export function InspectionDetailPage() {
  return (
    <>
      <Head title="Inspection" description="Inspection report details" />
      <UserDashboardContainer py="1.5rem">
        <InspectionDetailTemplate />
      </UserDashboardContainer>
    </>
  );
}
