/**
 * What people are doing on the WhatsApp bot.
 * Mirrors `GET /back-office/whatsapp/*` (WhatsappActivityService).
 */

export type WhatsappOutcome =
  | 'handled'
  | 'unlinked'
  | 'unsupported'
  | 'rate_limited'
  | 'admin'
  | 'stale'
  | 'failed';

export interface IWhatsappWho {
  /** Null when the number isn't linked to an account. */
  userId: string | null;
  name: string | null;
  email: string | null;
  /** Their WhatsApp profile name: all we know about an unlinked number. */
  whatsappName: string | null;
}

export interface IWhatsappOrganizationRef {
  id: string;
  name: string | null;
}

/** Something the bot actually created or changed. */
export interface IWhatsappAction {
  /** e.g. "invoice.created", "payment.recorded". */
  type: string;
  entityId?: string;
  /** Plain sentence, e.g. "Created invoice INV-000042 for Mr Bayo (₦31,000)". */
  label: string;
}

export interface IWhatsappEvent {
  id: string;
  at: string;
  /** E.164 with a leading "+". */
  phone: string;
  who: IWhatsappWho;
  organization: IWhatsappOrganizationRef | null;
  /** What they typed, or null when they tapped a button. */
  said: string | null;
  tapped: string | null;
  /** The one line to read. */
  summary: string;
  actions: IWhatsappAction[];
  botReplied: Array<{ type: string; text: string }>;
  outcome: WhatsappOutcome | string;
  error: string | null;
  flow: { before: string | null; after: string | null };
  ai: { calls: number; inputTokens: number; outputTokens: number };
  durationMs: number | null;
}

export interface IGetWhatsappActivityFilter {
  page?: number;
  limit?: number;
  organizationId?: string;
  userId?: string;
  phone?: string;
  outcome?: string;
  action?: string;
  flow?: string;
  search?: string;
  /** Only events where the bot created or changed something. */
  onlyActions?: boolean;
  from?: string;
  to?: string;
  /** Defaults to `at`, newest first. */
  sortBy?: WhatsappActivitySortField;
  sortOrder?: 'asc' | 'desc';
}

/** `at` = when it arrived, `durationMs` = slow replies, `aiCalls` = costly ones. */
export type WhatsappActivitySortField = 'at' | 'durationMs' | 'aiCalls';

export interface IWhatsappConversation {
  phone: string;
  who: IWhatsappWho | null;
  organization: IWhatsappOrganizationRef | null;
  /** Oldest first, like reading a chat. */
  messages: IWhatsappEvent[];
  hasMore: boolean;
  /** Timestamp of the oldest message returned — pass as `before` to load earlier. */
  oldest: string | null;
}

export interface IGetWhatsappConversationFilter {
  limit?: number;
  before?: string;
}

export interface IWhatsappPerson {
  phone: string;
  who: IWhatsappWho | null;
  organization: IWhatsappOrganizationRef | null;
  linked: boolean;
  messages: number;
  /** Messages where the bot created or changed something. */
  thingsDone: number;
  failures: number;
  firstSeen: string | null;
  lastSeen: string | null;
  lastActivity: string | null;
}

export interface IWhatsappPeople {
  period: { from: string; to: string };
  users: IWhatsappPerson[];
  /** Numbers that messaged the bot but aren't linked to an account. */
  unlinkedNumbers: IWhatsappPerson[];
}

export interface IGetWhatsappPeopleFilter {
  from?: string;
  to?: string;
  organizationId?: string;
}

/** Aggregate bot usage. Mirrors `GET /back-office/analytics/whatsapp`. */
export interface IWhatsappUsage {
  period: { from: string; to: string };
  messages: number;
  activeSenders: number;
  activeOrganizations: number;
  /** Outcome → message count, e.g. `{ handled: 120, failed: 3 }`. */
  byOutcome: Record<string, number>;
  /** Top flows people ended up in, most used first. */
  byFlow: Array<{ flow: string; count: number }>;
  ai: {
    calls: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  };
  avgDurationMs: number;
  /** `day` is 'YYYY-MM-DD'; days with no messages are absent. */
  perDay: Array<{ day: string; messages: number }>;
  topOrganizations: Array<{
    organizationId: string;
    name: string | null;
    messages: number;
    senders: number;
  }>;
  /** Inbound messages waiting on the bot right now (not period-bound). */
  queue: { pending: number; processing: number; failed: number };
}

export interface IGetWhatsappUsageFilter {
  from?: string;
  to?: string;
}
