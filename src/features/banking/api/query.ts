import { useMutation, useQuery } from '@tanstack/react-query';
import type { QueryConfigType } from '@/lib/react-query';
import { customQueryKey } from '@/shared/constants/query-keys';
import type { StatementRange } from '@/shared/interface/banking';
import { bankingService } from './service';

export function useGetOrgAccounts(orgId: string) {
  return useQuery({
    queryKey: [customQueryKey.banking.accounts, orgId],
    queryFn: () => bankingService.getAccounts(orgId),
    enabled: Boolean(orgId),
  });
}

export function useGetAccountStatement(
  orgId: string,
  accountId: string,
  range: StatementRange,
  config?: QueryConfigType<typeof bankingService.getAccountStatement>
) {
  return useQuery({
    queryKey: [customQueryKey.banking.statement, orgId, accountId, range],
    queryFn: () => bankingService.getAccountStatement(orgId, accountId, range),
    enabled: Boolean(orgId && accountId),
    // Money moves all the time; a statement should never be minutes old.
    staleTime: 0,
    ...config,
  });
}

export function useGetBusinessStatement(
  orgId: string,
  range: StatementRange,
  config?: QueryConfigType<typeof bankingService.getBusinessStatement>
) {
  return useQuery({
    queryKey: [customQueryKey.banking.business, orgId, range],
    queryFn: () => bankingService.getBusinessStatement(orgId, range),
    enabled: Boolean(orgId),
    staleTime: 0,
    ...config,
  });
}

export function useDownloadStatementPdf() {
  return useMutation({ mutationFn: bankingService.downloadStatementPdf });
}

export function useEmailStatement() {
  return useMutation({ mutationFn: bankingService.emailStatement });
}
