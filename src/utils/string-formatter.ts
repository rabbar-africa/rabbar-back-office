export function arrayToCommaString(arr?: string[] | null): string {
  if (!Array.isArray(arr)) return '';

  return arr
    .map((item) => item?.trim())
    .filter((item) => item)
    .join(', ');
}

export function commaStringToArray(input?: string | null): string[] {
  if (typeof input !== 'string') return [];

  return input
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item);
}

interface AddressParts {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

/** Join the parts of an address into a single, human-readable line. */
export function formatAddress(address?: AddressParts | null): string {
  if (!address) return '';

  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}

interface TransactionSeriesParts {
  prefix?: string | null;
  suffix?: string | null;
  separator?: string | null;
  padding?: number | null;
  number: number;
}

/** Build a preview of a transaction number, e.g. `INV-000001-2026`. */
export function formatTransactionSeries({
  prefix,
  suffix,
  separator,
  padding,
  number,
}: TransactionSeriesParts): string {
  const sep = separator ?? '';
  const padded = String(number).padStart(padding ?? 0, '0');

  return [prefix, padded, suffix]
    .map((part) => (part ?? '').toString().trim())
    .filter(Boolean)
    .join(sep);
}
