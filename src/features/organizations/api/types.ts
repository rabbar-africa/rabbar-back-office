import type { IBaseFilter } from '@/shared/interface/filter';
import type { CreateOrgBankAccountPayload } from '@/shared/interface/settings';

export type UpdateOrgBankAccountPayload = Partial<CreateOrgBankAccountPayload>;

export interface CreateOrganizationPayload {
  name: string;
  slug?: string;
  email: string;
  companyEmail?: string;
  phone: string;
  phone2?: string | null;
  website?: string;
  industry?: string;
  rcNumber?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string | null;
  country?: string;
  postalCode?: string | null;
  currency?: string;
  timezone?: string;
  description?: string | null;
}

export type UpdateOrganizationPayload = Partial<CreateOrganizationPayload> & {
  isActive?: boolean;
};

export interface IGetOrganizationsFilter extends IBaseFilter {
  industry?: string;
  isActive?: boolean;
}
