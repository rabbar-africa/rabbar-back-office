import { Box, Flex, Grid, Progress, Stack, Text } from '@chakra-ui/react';
import { formatMoney } from '@/hooks/useFormatMoney';
import type { IOverviewMoney } from '@/shared/interface/overview';
import { SectionCard } from './SectionCard';

interface MoneyPanelProps {
  money: IOverviewMoney;
}

interface CurrencyRow {
  currency: string;
  invoiced: number;
  invoiceCount: number;
  collected: number;
  paymentCount: number;
}

/**
 * Orgs bill in different currencies, so the API groups money by currency and
 * never sums across them — this pairs invoiced against collected per currency
 * and shows the collection rate for each.
 */
function toRows(money: IOverviewMoney): CurrencyRow[] {
  const rows = new Map<string, CurrencyRow>();

  const rowFor = (currency: string) => {
    const existing = rows.get(currency);
    if (existing) return existing;
    const created: CurrencyRow = {
      currency,
      invoiced: 0,
      invoiceCount: 0,
      collected: 0,
      paymentCount: 0,
    };
    rows.set(currency, created);
    return created;
  };

  money.invoiced?.forEach((entry) => {
    const row = rowFor(entry.currency);
    row.invoiced = entry.amount;
    row.invoiceCount = entry.count;
  });
  money.collected?.forEach((entry) => {
    const row = rowFor(entry.currency);
    row.collected = entry.amount;
    row.paymentCount = entry.count;
  });

  return [...rows.values()].sort((a, b) => b.invoiced - a.invoiced);
}

export function MoneyPanel({ money }: MoneyPanelProps) {
  const rows = toRows(money);

  return (
    <SectionCard
      title="Money moved"
      subtitle="Invoiced vs collected in the selected period, per currency"
    >
      {rows.length === 0 ? (
        <Text textStyle="small-regular" color="gray.300" py="2">
          No invoices or payments recorded in this period.
        </Text>
      ) : (
        <Stack gap="1.25rem">
          {rows.map((row) => {
            const rate =
              row.invoiced > 0
                ? Math.min(100, (row.collected / row.invoiced) * 100)
                : 0;
            return (
              <Box key={row.currency}>
                <Flex justify="space-between" align="center" mb=".5rem">
                  <Text textStyle="small-semibold" color="gray.500">
                    {row.currency}
                  </Text>
                  <Text textStyle="tiny-regular" color="gray.300">
                    {row.invoiced > 0
                      ? `${rate.toFixed(1)}% collected`
                      : 'No invoices'}
                  </Text>
                </Flex>

                <Grid templateColumns="1fr 1fr" gap="3" mb=".5rem">
                  <Box>
                    <Text textStyle="tiny-regular" color="gray.300">
                      Invoiced ({row.invoiceCount})
                    </Text>
                    <Text
                      fontSize="1.0625rem"
                      fontWeight="700"
                      color="gray.500"
                    >
                      {formatMoney(row.invoiced, {
                        currencyCode: row.currency,
                      })}
                    </Text>
                  </Box>
                  <Box>
                    <Text textStyle="tiny-regular" color="gray.300">
                      Collected ({row.paymentCount})
                    </Text>
                    <Text
                      fontSize="1.0625rem"
                      fontWeight="700"
                      color="success.300"
                    >
                      {formatMoney(row.collected, {
                        currencyCode: row.currency,
                      })}
                    </Text>
                  </Box>
                </Grid>

                <Progress.Root
                  value={rate}
                  size="sm"
                  rounded="full"
                  colorPalette="green"
                >
                  <Progress.Track bg="gray.50" rounded="full">
                    <Progress.Range bg="success.300" />
                  </Progress.Track>
                </Progress.Root>
              </Box>
            );
          })}
        </Stack>
      )}
    </SectionCard>
  );
}
