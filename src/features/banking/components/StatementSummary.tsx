import { Box, Grid, Text } from '@chakra-ui/react';
import { formatCurrency } from '@/utils/calculations';

export interface SummaryTile {
  label: string;
  amount: number;
  /** Colour token for the figure; defaults to dark ink. */
  color?: string;
  /** Small line under the figure. */
  hint?: string;
}

/** A row of money tiles — opening / in / out / closing, or similar. */
export function StatementSummary({
  currencyCode,
  tiles,
}: {
  currencyCode: string;
  tiles: SummaryTile[];
}) {
  return (
    <Grid
      templateColumns={{ base: '1fr 1fr', md: `repeat(${tiles.length}, 1fr)` }}
      gap="3"
    >
      {tiles.map((tile) => (
        <Box
          key={tile.label}
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
          rounded=".625rem"
          p={{ base: '3', md: '4' }}
        >
          <Text textStyle="tiny-regular" color="gray.300" mb="1">
            {tile.label}
          </Text>
          <Text
            fontSize={{ base: '16px', md: '20px' }}
            fontWeight="700"
            color={tile.color ?? 'gray.500'}
            wordBreak="break-word"
          >
            {formatCurrency(tile.amount, currencyCode)}
          </Text>
          {tile.hint && (
            <Text fontSize="11px" color="gray.300" mt="1">
              {tile.hint}
            </Text>
          )}
        </Box>
      ))}
    </Grid>
  );
}

/** Opening, money in, money out and closing — a period at a glance. */
export const balanceTiles = (figures: {
  openingBalance: number;
  moneyIn: number;
  moneyOut: number;
  closingBalance: number;
}): SummaryTile[] => [
  {
    label: 'Opening balance',
    amount: figures.openingBalance,
    color: figures.openingBalance < 0 ? 'error.300' : undefined,
  },
  { label: 'Money in', amount: figures.moneyIn, color: 'success.300' },
  { label: 'Money out', amount: figures.moneyOut, color: 'error.300' },
  {
    label: 'Closing balance',
    amount: figures.closingBalance,
    color: figures.closingBalance < 0 ? 'error.300' : undefined,
  },
];
