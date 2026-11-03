import { useNavigate, useParams } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';
import { useGetOrganizationById } from '@/features/organizations/api/query';
import type { IPaymentReceived } from '@/shared/interface/payment';
import { useGetPaymentByIdQuery } from '../../api/query';
import { useReceiptPdf } from '../../hooks/useReceiptPdf';

/**
 * One payment received, read-only. The letterhead comes from the payment's
 * own organization, not from the signed-in back-office user.
 */
export function usePaymentDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetPaymentByIdQuery(id);
  const payment = data?.data as IPaymentReceived | undefined;

  const { data: organizationData } = useGetOrganizationById(
    payment?.organizationId ?? ''
  );
  const organization = organizationData?.data;

  const { download, isGenerating } = useReceiptPdf();

  return {
    payment,
    organization,
    isLoading,
    isError,
    goBack: () => navigate(RouteConstants.payments.base.path),
    openOrganization: () =>
      payment &&
      navigate(
        RouteConstants.organizations.detail.generate(
          { id: payment.organizationId },
          { tab: 'payments' }
        )
      ),
    downloadPdf: () => payment && void download(payment, organization),
    isDownloading: isGenerating,
  };
}
