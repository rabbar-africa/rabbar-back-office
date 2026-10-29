import { axios } from '@/lib/axios';
import { type ApiResponse } from '@/shared/interface/api';
import type {
  AccountStatement,
  BusinessStatement,
  EmailStatementPayload,
  EmailStatementResponse,
  IAccountRef,
  StatementRange,
} from '@/shared/interface/banking';
import { createDownloadLink } from '@/utils/file-helper';

/**
 * An organization's accounts and statements, read by a platform admin.
 * Everything here is scoped to one organization (`orgId`).
 */

const orgPath = (orgId: string) => `back-office/organizations/${orgId}`;
const accountStatementPath = (orgId: string, accountId: string) =>
  `${orgPath(orgId)}/bank-accounts/${accountId}/statement`;
const businessStatementPath = (orgId: string) =>
  `${orgPath(orgId)}/business-statement`;

/** `attachment; filename="statement-cash-….pdf"` → the filename. */
const filenameFrom = (disposition: unknown): string | null => {
  if (typeof disposition !== 'string') return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match ? decodeURIComponent(match[1]) : null;
};

/** Saves a statement PDF under the server's filename. */
const downloadPdf = async (url: string, range: StatementRange) => {
  const response = await axios.get<Blob>(`${url}/pdf`, {
    params: range,
    responseType: 'blob',
  });
  const filename =
    filenameFrom(response.headers['content-disposition']) ??
    `statement-${range.from ?? ''}-to-${range.to ?? ''}.pdf`;
  createDownloadLink(
    new Blob([response.data], { type: 'application/pdf' }),
    filename
  );
};

export const bankingService = {
  /** Bank accounts plus the Cash account (banks first, Cash last). */
  getAccounts: async (orgId: string) => {
    const response = await axios.get<ApiResponse<IAccountRef[]>>(
      `${orgPath(orgId)}/bank-accounts`,
      { params: { includeCash: true } }
    );
    return response.data;
  },

  getAccountStatement: async (
    orgId: string,
    accountId: string,
    range: StatementRange = {}
  ) => {
    const response = await axios.get<ApiResponse<AccountStatement>>(
      accountStatementPath(orgId, accountId),
      { params: range }
    );
    return response.data;
  },

  getBusinessStatement: async (orgId: string, range: StatementRange = {}) => {
    const response = await axios.get<ApiResponse<BusinessStatement>>(
      businessStatementPath(orgId),
      { params: range }
    );
    return response.data;
  },

  /** One account's PDF, or the business statement's without `accountId`. */
  downloadStatementPdf: ({
    orgId,
    accountId,
    range,
  }: {
    orgId: string;
    accountId?: string;
    range: StatementRange;
  }) =>
    downloadPdf(
      accountId
        ? accountStatementPath(orgId, accountId)
        : businessStatementPath(orgId),
      range
    ),

  /**
   * Emails the PDF. Without `email` it goes to the business email (else the
   * owner's), marked as sent by Rabbar support.
   */
  emailStatement: async ({
    orgId,
    accountId,
    payload,
  }: {
    orgId: string;
    accountId?: string;
    payload: EmailStatementPayload;
  }) => {
    const response = await axios.post<ApiResponse<EmailStatementResponse>>(
      `${
        accountId
          ? accountStatementPath(orgId, accountId)
          : businessStatementPath(orgId)
      }/email`,
      payload
    );
    return response.data;
  },
};
