import { axios } from '@/lib/axios';
import type { ApiResponse, IMeta } from '@/shared/interface/api';
import type { IExpense, IGetExpensesFilter } from '@/shared/interface/expense';
import { buildUrlWithQueryParams } from '@/utils/build-url-query';

/** The list's meta also carries the sum of every match, not just the page. */
export type ExpensesListResponse = ApiResponse<IExpense[]> & {
  meta: IMeta & { totalAmount?: number };
};

export const expensesService = {
  /** Every organization's expenses (filter with `organizationId`). */
  getAll: async (filter?: IGetExpensesFilter) => {
    const url = buildUrlWithQueryParams('back-office/expenses', filter);
    const response = await axios.get<ExpensesListResponse>(url);
    return response.data;
  },
};
