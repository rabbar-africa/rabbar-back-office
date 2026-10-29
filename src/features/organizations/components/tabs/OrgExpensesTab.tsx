import { useParams } from 'react-router-dom';
import { ExpensesTable } from '@/features/expenses/components/ExpensesTable';

/** What this organization spent. */
export function OrgExpensesTab() {
  const { id } = useParams<{ id: string }>();
  return <ExpensesTable organizationId={id} urlPrefix="expense_" />;
}
