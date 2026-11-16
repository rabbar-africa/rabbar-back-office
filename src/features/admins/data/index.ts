import type { IAccessLogEntry } from '@/shared/interface/admin';

export type AccessTone = 'view' | 'change' | 'danger';

const humanize = (segment: string) => segment.replace(/-/g, ' ');

/** "invoices" → "invoice"; good enough for route names. */
const singular = (word: string) =>
  word.endsWith('ies')
    ? `${word.slice(0, -3)}y`
    : word.endsWith('s') && !word.endsWith('ss')
      ? word.slice(0, -1)
      : word;

/**
 * An access-log row in words: "Opened organization", "Viewed invoices",
 * "Changed subscriptions › plan". Read from the route's pattern, so it works
 * for any back-office route without a list to keep up to date.
 */
export function describeAccess(entry: IAccessLogEntry): {
  label: string;
  tone: AccessTone;
} {
  if (entry.method === 'SIGN_IN') return { label: 'Signed in', tone: 'view' };
  if (entry.method === 'SIGN_IN_FAILED')
    return { label: 'Entered a wrong sign-in code', tone: 'danger' };

  const segments = entry.route
    .replace(/^\/?api\/v\d+/, '')
    .replace(/^\/?back-office/, '')
    .split('/')
    .filter(Boolean);
  const words = segments.filter((s) => !s.startsWith(':')).map(humanize);
  const endsWithId = segments[segments.length - 1]?.startsWith(':') ?? false;
  const subject = words.join(' › ') || 'back office';

  switch (entry.method) {
    case 'GET':
      if (endsWithId && words.length > 0) {
        const parent = words.slice(0, -1).join(' › ');
        const thing = singular(words[words.length - 1]);
        return {
          label: parent ? `Opened ${thing} (${parent})` : `Opened ${thing}`,
          tone: 'view',
        };
      }
      return { label: `Viewed ${subject}`, tone: 'view' };
    case 'DELETE':
      return { label: `Deleted ${subject}`, tone: 'danger' };
    case 'POST':
    case 'PUT':
    case 'PATCH':
      return { label: `Changed ${subject}`, tone: 'change' };
    default:
      return { label: subject, tone: 'view' };
  }
}

/** The query the API kept (secrets are already dropped): "page=1 · search=ada". */
export function formatQuery(query: IAccessLogEntry['query']): string {
  if (!query) return '';
  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(
      ([key, value]) =>
        `${key}=${typeof value === 'object' ? JSON.stringify(value) : String(value)}`
    )
    .join('&');
}
