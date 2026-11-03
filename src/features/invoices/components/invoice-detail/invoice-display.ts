import type { IInvoiceResponse } from '@/shared/interface/invoice';

/**
 * Label for the tax line. The invoice carries the tax it was issued with;
 * older invoices have neither, so they fall back to "VAT".
 */
export function invoiceTaxLabel(
  invoice: Pick<IInvoiceResponse, 'taxName' | 'taxPercent'>
): string {
  const taxPercent = Number(invoice.taxPercent ?? 0);
  return invoice.taxName
    ? `${invoice.taxName}${taxPercent ? ` (${taxPercent}%)` : ''}`
    : 'VAT';
}

/** Vehicle details shown beside the totals. Unrecorded fields are left out. */
export function invoiceVehicleRows(
  invoice: Pick<IInvoiceResponse, 'vehicle'>
): Array<{ label: string; value: string }> {
  const vehicle = invoice.vehicle;
  if (!vehicle) return [];
  return [
    { label: 'Make', value: vehicle.make ?? '' },
    { label: 'Model', value: vehicle.model ?? '' },
    { label: 'Year', value: vehicle.year ? String(vehicle.year) : '' },
    { label: 'Reg. No.', value: vehicle.registrationNumber ?? '' },
  ].filter((row) => row.value);
}
