import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import moment from 'moment';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { formatAccountLabel } from '@/shared/interface/banking';
import {
  expenseCategoryLabel,
  expensePaymentModeLabel,
} from '@/shared/interface/expense';
import type { IInvoiceResponse } from '@/shared/interface/invoice';

interface InvoiceExpensesProps {
  invoice: IInvoiceResponse;
}

/**
 * What the organization spent to do this invoice's job, newest first. Each
 * cost names the invoice item it was for when it was recorded against one.
 */
export function InvoiceExpenses({ invoice }: InvoiceExpensesProps) {
  const { formatMoney } = useFormatMoney(invoice.currencyCode);
  const expenses = invoice.expenses ?? [];
  if (!expenses.length) return null;

  const spent =
    invoice.expensesTotal ??
    expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const billed = Number(invoice.subTotal ?? 0) || 0;
  const margin = billed - spent;

  // Line item names, so a cost can say what it was for.
  const lineNames = new Map(
    (invoice.lineItems ?? []).map((line) => [line.id, line.name] as const)
  );

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      shadow="sm"
      overflow="hidden"
    >
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap="2"
        px={{ base: '4', md: '5' }}
        py="3"
        borderBottomWidth="1px"
        borderColor="gray.75"
      >
        <Text textStyle="small-semibold" color="gray.500">
          Expenses ({expenses.length})
        </Text>
        <Flex gap="4" wrap="wrap">
          <Text textStyle="small-regular" color="gray.400">
            Spent{' '}
            <Text as="span" fontWeight="600" color="error.300">
              {formatMoney(spent)}
            </Text>
          </Text>
          <Text textStyle="small-regular" color="gray.400">
            Margin before tax{' '}
            <Text
              as="span"
              fontWeight="600"
              color={margin < 0 ? 'error.300' : 'success.300'}
            >
              {formatMoney(margin)}
            </Text>
          </Text>
        </Flex>
      </Flex>

      <Stack gap="0">
        {expenses.map((expense, idx) => {
          const forLine = expense.invoiceLineItemId
            ? lineNames.get(expense.invoiceLineItemId)
            : undefined;
          return (
            <Flex
              key={expense.id}
              justify="space-between"
              align="center"
              gap="3"
              px={{ base: '4', md: '5' }}
              py="3"
              borderTopWidth={idx === 0 ? '0' : '1px'}
              borderColor="gray.50"
            >
              <Stack gap="0.5" minW={0}>
                <Text textStyle="small-semibold" color="gray.500" truncate>
                  {expense.name || expense.description || 'Expense'}
                  {forLine ? (
                    <Text as="span" fontWeight="400" color="gray.300">
                      {' '}
                      · for {forLine}
                    </Text>
                  ) : null}
                </Text>
                <Text textStyle="tiny-regular" color="gray.300">
                  {[
                    expense.expenseNumber,
                    moment(expense.date).format('DD MMM YYYY'),
                    expenseCategoryLabel(expense.category),
                    expense.vendorName,
                    expense.paidThroughAccount
                      ? `from ${formatAccountLabel(expense.paidThroughAccount)}`
                      : expensePaymentModeLabel(expense.paymentMode),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </Stack>
              <Text textStyle="small-semibold" color="gray.500" flexShrink={0}>
                {formatMoney(Number(expense.amount) || 0)}
              </Text>
            </Flex>
          );
        })}
      </Stack>
    </Box>
  );
}
