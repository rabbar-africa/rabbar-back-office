import moment from 'moment';
import type {
  IWhatsappEvent,
  IWhatsappPerson,
  IWhatsappWho,
} from '@/shared/interface/whatsapp';

/** Outcome → label. The labels double as Status colour keys (see get-color). */
export const WHATSAPP_OUTCOME_LABELS: Record<string, string> = {
  handled: 'Handled',
  unlinked: 'Not linked',
  unsupported: 'Unsupported',
  rate_limited: 'Rate limited',
  admin: 'Admin',
  stale: 'Late',
  failed: 'Failed',
};

export const whatsappOutcomeLabel = (outcome?: string | null) =>
  outcome ? (WHATSAPP_OUTCOME_LABELS[outcome] ?? outcome) : '';

export const WHATSAPP_OUTCOME_FILTER_OPTIONS = [
  { label: 'All outcomes', value: 'all' },
  ...Object.entries(WHATSAPP_OUTCOME_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
];

export const WHATSAPP_VIEWS = [
  { value: 'activity', label: 'Activity' },
  { value: 'people', label: 'People' },
] as const;

/** Best name we have: account name, then WhatsApp profile name, then the number. */
export const whoName = (who?: IWhatsappWho | null, phone?: string) =>
  who?.name || who?.whatsappName || phone || 'Unknown';

export const whoSubtitle = (
  who: IWhatsappWho | null | undefined,
  phone: string
) => {
  const named = Boolean(who?.name || who?.whatsappName);
  const parts = [named ? phone : null, who?.email].filter(Boolean);
  return parts.join(' · ');
};

/** What the person sent: typed text, or the button they tapped. */
export const whatTheySent = (event: Pick<IWhatsappEvent, 'said' | 'tapped'>) =>
  event.said?.trim() || (event.tapped ? `Tapped “${event.tapped}”` : '');

export const formatWhen = (iso?: string | null) =>
  iso ? moment(iso).format('DD MMM YYYY, HH:mm') : '—';

export const formatRelative = (iso?: string | null) =>
  iso ? moment(iso).fromNow() : '—';

export const formatDay = (iso: string) => {
  const day = moment(iso);
  if (day.isSame(moment(), 'day')) return 'Today';
  if (day.isSame(moment().subtract(1, 'day'), 'day')) return 'Yesterday';
  return day.format('dddd, DD MMM YYYY');
};

export const dayStartIso = (date: string) =>
  moment(date, 'YYYY-MM-DD').startOf('day').toISOString();
export const dayEndIso = (date: string) =>
  moment(date, 'YYYY-MM-DD').endOf('day').toISOString();

export const personKey = (person: IWhatsappPerson) => person.phone;

/* ── Page tabs ─────────────────────────────────────────────────────────── */

export const WHATSAPP_PAGE_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'people', label: 'People' },
] as const;

/* ── Filter options ────────────────────────────────────────────────────── */

/** Things the bot can create or change. Mirrors BotActionType on the API. */
export const WHATSAPP_ACTION_LABELS: Record<string, string> = {
  'invoice.created': 'Invoice created',
  'invoice.updated': 'Invoice updated',
  'invoice.voided': 'Invoice voided',
  'invoice.pdf_sent': 'Invoice PDF sent',
  'payment.recorded': 'Payment recorded',
  'receipt.pdf_sent': 'Receipt PDF sent',
  'customer.created': 'Customer created',
  'customer.updated': 'Customer updated',
  'vehicle.created': 'Vehicle added',
  'vehicle.owner_changed': 'Vehicle owner changed',
  'account.unlinked': 'Number unlinked',
};

export const WHATSAPP_ACTION_FILTER_OPTIONS = [
  { label: 'Any action', value: 'all' },
  ...Object.entries(WHATSAPP_ACTION_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
];

/** Conversation flows. Mirrors FLOW_LABELS on the API. */
export const WHATSAPP_FLOW_LABELS: Record<string, string> = {
  menu: 'Menu',
  'invoice.create': 'New invoice',
  'invoice.find': 'Find an invoice',
  'invoice.pick': 'Choose an invoice',
  'invoice.unpaid': 'Unpaid invoices',
  'invoice.edit': 'Edit an invoice',
  'payment.record': 'Record a payment',
  'payment.find': 'Find a receipt',
  'customer.pick': 'Choose a customer',
  'customer.find': 'Look up a customer',
  'customer.create': 'Add a customer',
  'customer.edit': 'Edit a customer',
  'vehicle.add': 'Add a vehicle',
  'vehicle.find': 'Look up a vehicle',
  'report.numbers': 'Their numbers',
  'account.whoami': 'Account details',
  'account.unlink': 'Unlink number',
};

export const whatsappFlowLabel = (flow?: string | null) =>
  flow ? (WHATSAPP_FLOW_LABELS[flow] ?? flow) : '';

export const WHATSAPP_FLOW_FILTER_OPTIONS = [
  { label: 'Any flow', value: 'all' },
  ...Object.entries(WHATSAPP_FLOW_LABELS).map(([value, label]) => ({
    label,
    value,
  })),
];

/* ── Reporting period ──────────────────────────────────────────────────── */

export const WHATSAPP_PERIOD_OPTIONS = [
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Custom dates', value: 'custom' },
];

export const DEFAULT_WHATSAPP_PERIOD = '30d';

const PRESET_HOURS: Record<string, number> = {
  '24h': 24,
  '7d': 7 * 24,
  '30d': 30 * 24,
  '90d': 90 * 24,
};

export interface WhatsappPeriodState {
  period: string;
  /** 'YYYY-MM-DD', used only when period is 'custom'. */
  from: string;
  to: string;
}

/**
 * Period → ISO bounds for the API. Presets leave `to` open (the API uses
 * "now") and snap `from` to the minute so the query key stays stable.
 */
export function resolvePeriod({ period, from, to }: WhatsappPeriodState): {
  from?: string;
  to?: string;
} {
  if (period === 'custom')
    return {
      from: from ? dayStartIso(from) : undefined,
      to: to ? dayEndIso(to) : undefined,
    };
  const hours = PRESET_HOURS[period] ?? PRESET_HOURS[DEFAULT_WHATSAPP_PERIOD];
  return {
    from: moment().subtract(hours, 'hours').startOf('minute').toISOString(),
  };
}

/* ── Numbers ───────────────────────────────────────────────────────────── */

export const formatDuration = (ms?: number | null) => {
  if (!ms) return '—';
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
};

export const formatPercent = (part: number, whole: number) =>
  whole > 0
    ? `${((part / whole) * 100).toFixed(part / whole < 0.1 ? 1 : 0)}%`
    : '0%';

export const formatUsd = (amount: number) =>
  `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: amount < 1 ? 4 : 2,
  })}`;

/** Every day between the bounds, so quiet days show as zero instead of vanishing. */
export function fillDays(
  perDay: Array<{ day: string; messages: number }>,
  fromIso: string,
  toIso: string
) {
  const counts = new Map(perDay.map((d) => [d.day, d.messages]));
  const days: Array<{ day: string; messages: number }> = [];
  const cursor = moment.utc(fromIso).startOf('day');
  const end = moment.utc(toIso).startOf('day');
  while (!cursor.isAfter(end) && days.length < 400) {
    const key = cursor.format('YYYY-MM-DD');
    days.push({ day: key, messages: counts.get(key) ?? 0 });
    cursor.add(1, 'day');
  }
  return days;
}
