import { createElement, useCallback, useState } from 'react';
import { createDownloadLink } from '@/utils/file-helper';
import type { IOrganization } from '@/shared/interface/common';
import type { IPaymentReceived } from '@/shared/interface/payment';

/**
 * Client-side receipt PDF via @react-pdf/renderer, mirroring the on-screen
 * <PaymentReceipt/>. The renderer and document are lazy-loaded, so the bundle
 * is only fetched when a download is asked for.
 */

const fileNameFor = (payment: IPaymentReceived) =>
  `${payment.paymentNumber || `payment-${payment.id}`}.pdf`;

export function useReceiptPdf() {
  const [isGenerating, setIsGenerating] = useState(false);

  const download = useCallback(
    async (payment: IPaymentReceived, organization?: IOrganization) => {
      setIsGenerating(true);
      try {
        const [{ pdf }, { PaymentReceiptDocument }] = await Promise.all([
          import('@react-pdf/renderer'),
          import('../components/payment-detail/pdf/PaymentReceiptDocument'),
        ]);
        // The document renders a <Document>, but its prop type doesn't
        // structurally match react-pdf's DocumentProps — cast to pdf()'s arg.
        const element = createElement(PaymentReceiptDocument, {
          payment,
          organization,
        }) as unknown as Parameters<typeof pdf>[0];
        const blob = await pdf(element).toBlob();
        createDownloadLink(blob, fileNameFor(payment));
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return { download, isGenerating };
}
