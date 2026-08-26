import { Head } from '@/components/seo/head';
import { UserDashboardContainer } from '@/components/hoc';
import { OverviewTemplate } from '../templates/OverviewTemplate';

export function Overview() {
  return (
    <>
      <Head
        title="Dashboard"
        description="Platform-wide activity, revenue and growth across all organizations"
      />
      <UserDashboardContainer py="1.5rem">
        <OverviewTemplate />
      </UserDashboardContainer>
    </>
  );
}
