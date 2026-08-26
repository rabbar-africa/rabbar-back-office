import { Head } from '@/components/seo/head';
import { UserDashboardContainer } from '@/components/hoc';
import { AccessControlTemplate } from '../templates/AccessControlTemplate';

export function AccessControlPage() {
  return (
    <>
      <Head
        title="Access Control"
        description="Manage the platform permission catalog and default roles"
      />
      <UserDashboardContainer py="1.5rem">
        <AccessControlTemplate />
      </UserDashboardContainer>
    </>
  );
}
