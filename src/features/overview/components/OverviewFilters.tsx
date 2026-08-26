import { Button, Flex, Text } from '@chakra-ui/react';
import { DateField } from '@/components/input/DateField';
import { CustomSelect } from '@/components/input/CustomSelect';
import { PERIOD_PRESETS, type PeriodPreset } from './useOverview';

const TREND_OPTIONS = [
  { label: '6 months', value: '6' },
  { label: '12 months', value: '12' },
  { label: '24 months', value: '24' },
  { label: '36 months', value: '36' },
];

interface OverviewFiltersProps {
  from: string;
  to: string;
  trendMonths: number;
  activePreset: PeriodPreset | '';
  onPresetChange: (preset: PeriodPreset) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onTrendMonthsChange: (value: number) => void;
  onReset: () => void;
}

export function OverviewFilters({
  from,
  to,
  trendMonths,
  activePreset,
  onPresetChange,
  onFromChange,
  onToChange,
  onTrendMonthsChange,
  onReset,
}: OverviewFiltersProps) {
  return (
    <Flex
      direction={{ base: 'column', xl: 'row' }}
      justify="space-between"
      align={{ base: 'stretch', xl: 'center' }}
      gap="3"
      wrap="wrap"
    >
      <Flex gap="2" wrap="wrap">
        {PERIOD_PRESETS.map((preset) => (
          <Button
            key={preset.value}
            size="sm"
            h="2.5rem"
            variant={
              activePreset === preset.value ? 'primary' : 'outlineSecondary'
            }
            onClick={() => onPresetChange(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </Flex>

      <Flex gap="2" align="center" wrap="wrap">
        <DateField
          label="From"
          value={from}
          max={to || undefined}
          onChange={onFromChange}
          containerProps={{ flex: { base: '1', md: 'unset' } }}
        />
        <DateField
          label="To"
          value={to}
          min={from || undefined}
          onChange={onToChange}
          containerProps={{ flex: { base: '1', md: 'unset' } }}
        />

        <Flex align="center" gap="2">
          <Text textStyle="small-regular" color="gray.300" whiteSpace="nowrap">
            Trend:
          </Text>
          <CustomSelect
            options={TREND_OPTIONS}
            value={[String(trendMonths)]}
            onChange={(opt: { value: string[] }) =>
              onTrendMonthsChange(Number(opt?.value?.[0]) || 12)
            }
            rootProps={{ size: 'sm' }}
            controlProps={{ w: '9rem' }}
          />
        </Flex>

        {(from || to) && (
          <Button size="sm" h="2.5rem" variant="ghost" onClick={onReset}>
            Clear
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
