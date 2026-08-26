import type { IBaseFilter } from './filter';
import type { IOrgRef } from './organization-ref';

/**
 * Inspection reports as the back office sees them — sourced from
 * `GET /back-office/inspections[/:id]`, which spans every organization and
 * carries the owning org on each row.
 */

export const INSPECTION_STATUSES = ['IN_PROGRESS', 'COMPLETED'] as const;
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

/** Raw finding statuses, mirroring `FINDING_STATUSES` on the backend. */
export const FINDING_STATUSES = [
  'good',
  'needs_attention',
  'worn_out',
  'needs_repair',
  'needs_replacement',
  'faulty_repaired',
  'faulty_replaced',
  'damaged',
  'missing',
  'not_genuine',
] as const;
export type RawFindingStatus = (typeof FINDING_STATUSES)[number];

/** Collapsed severity used for colour-coding. */
export type FindingSeverity = 'pass' | 'warning' | 'fail';

export interface IInspectionFinding {
  component: string;
  observation?: string;
  status: RawFindingStatus | string;
  /** Up to two technician photos for this finding. */
  images?: string[];
}

/** How urgently an advisory finding must be dealt with. */
export const ADVISORY_GROUPS = [
  'fix_now',
  'due_soon',
  'optional',
  'completed',
] as const;
export type AdvisoryGroup = (typeof ADVISORY_GROUPS)[number];

export interface IAdvisoryFinding {
  title: string;
  components: string[];
  group: AdvisoryGroup | string;
  observation: string;
  /** What happens if ignored. Absent on completed items. */
  danger?: string;
  /** Days left before this must be handled; 0 = do not drive. */
  maxDurationLeft?: number;
}

export interface IInspectionAdvisory {
  verdict: { headline: string; summary: string };
  findings: IAdvisoryFinding[];
}

export const CHECKLIST_ITEM_STATUSES = [
  'OK',
  'NEEDS_FIX',
  'NOT_APPLICABLE',
] as const;
export type ChecklistItemStatus = (typeof CHECKLIST_ITEM_STATUSES)[number];

export interface IInspectionChecklistEntry {
  id: string;
  status: ChecklistItemStatus | string;
  notes: string | null;
  checklistItem: {
    id: string;
    name: string;
    category: string;
    isRequired: boolean;
  };
}

export interface IInspectionVehicle {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  registrationNumber: string | null;
  vin: string | null;
  color: string | null;
}

/** A row in the cross-organization inspections list. */
export interface IInspectionListItem {
  id: string;
  jobCode: string;
  status: InspectionStatus | string;
  customerName: string;
  customerPhone: string | null;
  technicianName: string | null;
  inspectionDate: string | null;
  /** Vehicle snapshot — survives deletion of the vehicle record. */
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehicleRegistrationNumber: string | null;
  pdfUrl: string | null;
  jobCardId: string | null;
  createdAt: string;
  organization: IOrgRef;
  _count: { inspectionChecklists: number };
}

/** The full report returned by the detail endpoint. */
export interface IInspection {
  id: string;
  organizationId: string;
  vehicleId: string | null;
  customerId: string | null;
  jobCardId: string | null;
  jobCode: string;
  technicianName: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  status: InspectionStatus | string;
  generalNotes: string | null;
  photos: string[];
  pdfUrl: string | null;
  inspectionDate: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehicleRegistrationNumber: string | null;
  vehicleVin: string | null;
  vehicleColor: string | null;
  findings: IInspectionFinding[] | null;
  advisory: IInspectionAdvisory | null;
  createdAt: string;
  updatedAt: string;

  organization: IOrgRef;
  vehicle: IInspectionVehicle | null;
  client: { id: string; displayName: string; email: string | null } | null;
  jobCard: { id: string; jobNumber: string; status: string } | null;
  inspectionChecklists: IInspectionChecklistEntry[];
}

export interface IGetInspectionsFilter extends IBaseFilter {
  status?: string;
  technicianName?: string;
  vehicleId?: string;
}

/**
 * Collapses a raw finding status to a severity, mirroring `normalizeStatus`
 * on the backend so both surfaces colour findings the same way.
 */
export function findingSeverity(status: string): FindingSeverity {
  switch (status) {
    case 'good':
    case 'pass':
    case 'faulty_repaired':
    case 'faulty_replaced':
      return 'pass';
    case 'needs_attention':
    case 'worn_out':
    case 'not_genuine':
    case 'warning':
      return 'warning';
    default:
      return 'fail';
  }
}
