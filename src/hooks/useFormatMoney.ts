import { useCallback } from 'react';
import { addComma } from '@/utils/format-number';

/**
 * Formats monetary values with thousands separators and a currency prefix.
 *
 * @example
 * const { formatMoney } = useFormatMoney();
 * formatMoney(1250000);            // "NGN 1,250,000"
 * formatMoney("999.5", "USD");     // "USD 999.50"
 */
export function useFormatMoney(defaultCurrency = 'NGN') {
  const formatMoney = useCallback(
    (value: number | string | null | undefined, currency = defaultCurrency) => {
      const amount = Number(value ?? 0) || 0;
      return `${currency} ${addComma(amount)}`;
    },
    [defaultCurrency]
  );

  return { formatMoney };
}
