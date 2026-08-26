import { Head } from '@/components/seo/head';
import { UserDashboardContainer } from '@/components/hoc';
import { ForceDesktopView } from '@/components/common/ForceDesktopView';
import { InspectionListTemplate } from '../templates/InspectionListTemplate';

export function InspectionListPage() {
  return (
    <>
      <Head
        title="Inspections"
        description="Vehicle inspection reports across all organizations"
      />
      <ForceDesktopView />
      <UserDashboardContainer py="1.5rem">
        <InspectionListTemplate />
      </UserDashboardContainer>
    </>
  );
}
