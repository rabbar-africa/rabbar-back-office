import type { IBaseFilter } from './filter';
import type { IOrgRef } from './organization-ref';

/**
 * Job cards (repair/work orders) as the back office sees them — sourced from
 * `GET /back-office/job-cards`, which spans every organization.
 */

export const JOB_CARD_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'AWAITING_APPROVAL',
  'AWAITING_PARTS',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED',
] as const;
export type JobCardStatus = (typeof JOB_CARD_STATUSES)[number];

export const JOB_CARD_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export type JobCardPriority = (typeof JOB_CARD_PRIORITIES)[number];

export interface IJobCardListItem {
  id: string;
  jobNumber: string;
  status: JobCardStatus | string;
  priority: JobCardPriority | string;
  customerName: string | null;
  customerPhone: string | null;
  /** Vehicle snapshot — survives deletion of the vehicle record. */
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehicleRegistrationNumber: string | null;
  complaint: string | null;
  promisedDate: string | null;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  organization: IOrgRef;
  /** Linked-record counts — what the job card actually pulled together. */
  _count: {
    inspections: number;
    invoices: number;
    payments: number;
    expenses: number;
  };
}

export interface IGetJobCardsFilter extends IBaseFilter {
  status?: string;
  priority?: string;
  vehicleId?: string;
}
