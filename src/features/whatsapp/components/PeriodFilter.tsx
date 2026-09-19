import { CustomSelect, DateField } from '@/components/input';
import { WHATSAPP_PERIOD_OPTIONS, type WhatsappPeriodState } from '../data';

interface PeriodFilterProps {
  value: WhatsappPeriodState;
  onChange: (next: Partial<WhatsappPeriodState>) => void;
}

/** Quick ranges, or explicit dates when "Custom dates" is picked. */
export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <>
      <CustomSelect
        placeholder="Period"
        options={WHATSAPP_PERIOD_OPTIONS}
        value={[value.period]}
        onChange={(opt: { value?: string[] }) =>
          onChange({ period: opt?.value?.[0] || '30d' })
        }
        rootProps={{ size: 'sm', w: { base: '100%', md: 'auto' } }}
        controlProps={{ w: { base: '100%', md: '160px' } }}
      />
      {value.period === 'custom' && (
        <>
          <DateField
            label="From"
            value={value.from}
            max={value.to || undefined}
            onChange={(from) => onChange({ from })}
          />
          <DateField
            label="To"
            value={value.to}
            min={value.from || undefined}
            onChange={(to) => onChange({ to })}
          />
        </>
      )}
    </>
  );
}
