import { useCallback } from 'react';
import { addComma } from '@/utils/format-number';

export interface FormatMoneyOptions {
  /** ISO 4217 code to render the amount in, e.g. "NGN". Falls back to the default. */
  currencyCode?: string;
  /** Prefix with the currency symbol (₦, $, …) when one is known. Default true. */
  showSymbol?: boolean;
  /** Prefix with the ISO code. Defaults to true only when no symbol is rendered. */
  showCurrencyCode?: boolean;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  GHS: '₵',
  KES: 'KSh',
  ZAR: 'R',
  XOF: 'CFA',
  XAF: 'FCFA',
  CAD: 'C$',
};

export const DEFAULT_CURRENCY = 'NGN';

export function getCurrencySymbol(code?: string | null): string {
  return code ? (CURRENCY_SYMBOLS[code.toUpperCase()] ?? '') : '';
}

/**
 * Formats a monetary value with thousands separators, optionally prefixed with
 * the currency symbol and/or its ISO code.
 *
 * The second argument accepts either a bare currency code (legacy call style)
 * or an options object.
 *
 * @example
 * formatMoney(1250000);                                  // "₦1,250,000"
 * formatMoney("999.5", "USD");                           // "$999.50"
 * formatMoney(1000, { showSymbol: false });              // "1,000"
 * formatMoney(1000, { showCurrencyCode: true, showSymbol: false }); // "NGN 1,000"
 */
export function formatMoney(
  value: number | string | null | undefined,
  currencyOrOptions: string | FormatMoneyOptions = {}
): string {
  const options: FormatMoneyOptions =
    typeof currencyOrOptions === 'string'
      ? { currencyCode: currencyOrOptions }
      : currencyOrOptions;

  const code = (options.currencyCode || DEFAULT_CURRENCY).toUpperCase();
  const symbol = getCurrencySymbol(code);
  const withSymbol = (options.showSymbol ?? true) && Boolean(symbol);
  // Without a symbol the amount would be a bare number, so fall back to the
  // code to keep the currency legible.
  const withCode = options.showCurrencyCode ?? !withSymbol;

  const amount = addComma(Number(value ?? 0) || 0);

  return [withCode ? `${code} ` : '', withSymbol ? symbol : '', amount].join(
    ''
  );
}

/**
 * Hook flavour of {@link formatMoney}, bound to a default currency — pass the
 * currency of the record being rendered (e.g. `invoice.currencyCode`) so every
 * amount on the page is labelled correctly.
 *
 * @example
 * const { formatMoney } = useFormatMoney(invoice.currencyCode);
 */
export function useFormatMoney(defaultCurrency?: string | null) {
  const format = useCallback(
    (
      value: number | string | null | undefined,
      currencyOrOptions: string | FormatMoneyOptions = {}
    ) => {
      const options: FormatMoneyOptions =
        typeof currencyOrOptions === 'string'
          ? { currencyCode: currencyOrOptions }
          : currencyOrOptions;

      return formatMoney(value, {
        ...options,
        currencyCode:
          options.currencyCode || defaultCurrency || DEFAULT_CURRENCY,
      });
    },
    [defaultCurrency]
  );

  return { formatMoney: format };
}
