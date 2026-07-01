import type {
  IOrganization,
  IOrganizationConfig,
} from '@/shared/interface/common';
import type {
  IOrgAddress,
  IOrgBankAccount,
  IOrgCurrency,
  IOrgTax,
} from '@/shared/interface/settings';

const baseConfig: IOrganizationConfig = {
  organizationId: 'ORG-1001',
  fiscalYearStartMonth: 1,
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  decimalPlaces: 2,
  numberFormat: '1,234,567.89',
  isInclusiveTaxDefault: false,
  isDiscountBeforeTaxDefault: true,
  defaultPaymentTerms: 30,
  allowNegativeStock: false,
  requireSignatureOnInspection: true,
  allowedPaymentMethods: ['CASH', 'BANK_TRANSFER', 'CARD'],
  brandPrimaryColor: '#293885',
  brandSecondaryColor: '#F5A623',
  brandFont: null,
  invoiceFooter: null,
  invoiceNotesDefault: null,
  invoiceTermsDefault: null,
  createdAt: '2025-01-12T09:00:00.000Z',
  updatedAt: '2025-01-12T09:00:00.000Z',
};

const baseAddress: IOrgAddress = {
  id: 'ADDR-1',
  type: 'OFFICE',
  addressLine1: '12 Marina Road',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  postalCode: '101001',
  isPrimary: true,
  isActive: true,
};

const baseBankAccount: IOrgBankAccount = {
  id: 'BANK-1',
  accountName: 'Rabbar Logistics Ltd',
  accountNumber: '0123456789',
  bankName: 'Guaranty Trust Bank',
  bankCode: '058',
  isPrimary: true,
};

const baseCurrency: IOrgCurrency = {
  id: 'CUR-1',
  code: 'NGN',
  symbol: '₦',
  name: 'Nigerian Naira',
  exchangeRate: 1,
  isDefault: true,
  isActive: true,
};

const baseTax: IOrgTax = {
  id: 'TAX-1',
  name: 'VAT',
  rate: 7.5,
  isCompound: false,
  isDefault: true,
  isActive: true,
};

const makeOrg = (
  org: Partial<IOrganization> & Pick<IOrganization, 'id'>
): IOrganization => ({
  name: '',
  slug: '',
  email: '',
  companyEmail: '',
  phone: '',
  phone2: null,
  fax: null,
  website: '',
  addressLine1: '12 Marina Road',
  addressLine2: null,
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  postalCode: '101001',
  logoUrl: '',
  taxId: null,
  rcNumber: 'RC-000000',
  industry: 'Logistics',
  description: null,
  registrationNumber: null,
  timezone: 'Africa/Lagos',
  currency: 'NGN',
  invoicePrefix: 'INV',
  autoGenerateInvoiceNumber: true,
  invoiceSequence: 1,
  isActive: true,
  createdAt: '2025-01-12T09:00:00.000Z',
  updatedAt: '2025-01-12T09:00:00.000Z',
  config: baseConfig,
  primaryAddress: baseAddress,
  primaryBankAccount: baseBankAccount,
  defaultCurrency: baseCurrency,
  defaultTax: baseTax,
  ...org,
});

export const organizationsData: IOrganization[] = [
  makeOrg({
    id: 'ORG-1001',
    name: 'Rabbar Logistics Ltd',
    slug: 'rabbar-logistics',
    email: 'ops@rabbar.africa',
    companyEmail: 'ops@rabbar.africa',
    phone: '+234 801 234 5678',
    website: 'https://rabbar.africa',
    industry: 'Logistics',
    isActive: true,
  }),
  makeOrg({
    id: 'ORG-1002',
    name: 'Sahel Freight Co',
    slug: 'sahel-freight',
    email: 'hello@sahelfreight.com',
    companyEmail: 'hello@sahelfreight.com',
    phone: '+234 802 987 6543',
    website: 'https://sahelfreight.com',
    industry: 'Freight',
    isActive: true,
  }),
  makeOrg({
    id: 'ORG-1003',
    name: 'Kano Traders Union',
    slug: 'kano-traders',
    email: 'admin@kanotraders.ng',
    companyEmail: 'admin@kanotraders.ng',
    phone: '+234 803 555 1212',
    website: 'https://kanotraders.ng',
    industry: 'Retail',
    isActive: false,
  }),
  makeOrg({
    id: 'ORG-1004',
    name: 'Lagos Port Services',
    slug: 'lagos-port-services',
    email: 'contact@lagosport.com',
    companyEmail: 'contact@lagosport.com',
    phone: '+234 809 444 3300',
    website: 'https://lagosport.com',
    industry: 'Maritime',
    isActive: true,
  }),
];
