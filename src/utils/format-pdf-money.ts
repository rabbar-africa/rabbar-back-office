/**
 * Money on PDFs, formatted exactly as the backend's documents do
 * (internal-tool-backend/src/shared/utils/document-format.ts): always two decimal
 * places and no space after the code. The app's `formatMoney` shortens amounts
 * for screens, so PDFs don't use it.
 */
interface FormatPdfMoneyOptions {
  currencyCode?: string;
  showSymbol?: boolean;
  showCurrencyCode?: boolean;
}

const DEFAULT_CURRENCY = 'NGN';

function symbolFor(currency: string): string {
  if (currency === 'NGN') return '₦';
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).formatToParts(1);
    return parts.find((part) => part.type === 'currency')?.value || '';
  } catch {
    return `${currency} `;
  }
}

export function formatPdfMoney(
  amount: number | string | null | undefined,
  options: FormatPdfMoneyOptions = {}
): string {
  const currency = options.currencyCode || DEFAULT_CURRENCY;
  const showSymbol = options.showSymbol ?? true;
  const value = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
  const prefix = options.showCurrencyCode
    ? currency
    : showSymbol
      ? symbolFor(currency)
      : '';
  return `${prefix}${formatted}`;
}
