import {
  Button,
  Dialog,
  Flex,
  Portal,
  SimpleGrid,
  chakra,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import { CustomInput, CustomSelect, CustomTextArea } from '@/components/input';
import { useGetPlans, useCreateManualSubscription } from '../api/query';

const PAYMENT_METHODS = [
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'Card', value: 'CARD' },
  { label: 'Cash', value: 'CASH' },
  { label: 'Mobile Money', value: 'MOBILE_MONEY' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Online', value: 'ONLINE' },
  { label: 'Other', value: 'OTHER' },
];

const numberRule = (msg: string) =>
  Yup.string()
    .required(msg)
    .matches(/^\d+(\.\d+)?$/, 'Enter a valid number');

const schema = Yup.object({
  planTier: Yup.string().required('Select a plan'),
  amount: numberRule('Amount is required'),
  currency: Yup.string().required('Currency is required'),
  periodStart: Yup.string().required('Start date is required'),
  periodMonths: numberRule('Period is required'),
  paidAt: Yup.string().required('Payment date is required'),
  method: Yup.string().required('Select a payment method'),
  reference: Yup.string(),
  note: Yup.string(),
});

interface Props {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  orgId: string;
}

export function AddSubscriptionPaymentModal({
  open,
  onOpenChange,
  orgId,
}: Props) {
  const { data: plansData, isPending: plansLoading } = useGetPlans({
    enabled: open,
  });
  const plans = plansData?.data || [];
  const planOptions = plans.map((plan) => ({
    label: `${plan.name} — ${plan.currency} ${plan.monthlyPrice}`,
    value: plan.id,
  }));

  const createPayment = useCreateManualSubscription();

  const formik = useFormik({
    initialValues: {
      planId: '',
      planTier: '',
      amount: '',
      currency: 'NGN',
      periodStart: moment().format('YYYY-MM-DD'),
      periodMonths: '12',
      paidAt: moment().format('YYYY-MM-DD'),
      method: 'BANK_TRANSFER',
      reference: '',
      note: '',
    },
    validationSchema: schema,
    validateOnChange: false,
    onSubmit: (values) => {
      createPayment.mutate(
        {
          id: orgId,
          payload: {
            planTier: values.planTier,
            amount: Number(values.amount),
            currency: values.currency,
            periodStart: values.periodStart,
            periodMonths: Number(values.periodMonths),
            paidAt: values.paidAt,
            method: values.method,
            reference: values.reference,
            note: values.note,
          },
        },
        {
          onSuccess: () => {
            formik.resetForm();
            onOpenChange({ open: false });
          },
        }
      );
    },
  });

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    formik.setValues((prev) => ({
      ...prev,
      planId,
      planTier: plan?.tier ?? '',
      amount: plan ? plan.monthlyPrice : prev.amount,
      currency: plan?.currency ?? prev.currency,
    }));
  };

  return (
    <Dialog.Root
      placement="center"
      open={open}
      onOpenChange={onOpenChange}
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="34rem" p="2rem">
            <Dialog.Header p={0} mb="1.5rem">
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                Record Manual Payment
              </Dialog.Title>
            </Dialog.Header>

            <chakra.form onSubmit={formik.handleSubmit}>
              <Dialog.Body p={0}>
                <Flex direction="column" gap="1rem">
                  <CustomSelect
                    label="Plan"
                    placeholder="Select a plan"
                    loading={plansLoading}
                    options={planOptions}
                    value={formik.values.planId ? [formik.values.planId] : []}
                    onChange={(d: { value?: string[] }) =>
                      handlePlanChange(d?.value?.[0] ?? '')
                    }
                    error={formik.errors.planTier}
                  />

                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
                    <CustomInput
                      label="Amount"
                      placeholder="0.00"
                      error={formik.errors.amount}
                      inputProps={{
                        name: 'amount',
                        value: formik.values.amount,
                        onChange: formik.handleChange,
                        inputMode: 'decimal',
                      }}
                    />
                    <CustomInput
                      label="Currency"
                      placeholder="NGN"
                      error={formik.errors.currency}
                      inputProps={{
                        name: 'currency',
                        value: formik.values.currency,
                        onChange: formik.handleChange,
                      }}
                    />
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
                    <CustomInput
                      label="Period Start"
                      type="date"
                      error={formik.errors.periodStart}
                      inputProps={{
                        name: 'periodStart',
                        value: formik.values.periodStart,
                        onChange: formik.handleChange,
                      }}
                    />
                    <CustomInput
                      label="Period (months)"
                      placeholder="12"
                      error={formik.errors.periodMonths}
                      inputProps={{
                        name: 'periodMonths',
                        value: formik.values.periodMonths,
                        onChange: formik.handleChange,
                        inputMode: 'numeric',
                      }}
                    />
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
                    <CustomInput
                      label="Paid At"
                      type="date"
                      error={formik.errors.paidAt}
                      inputProps={{
                        name: 'paidAt',
                        value: formik.values.paidAt,
                        onChange: formik.handleChange,
                      }}
                    />
                    <CustomSelect
                      label="Payment Method"
                      placeholder="Select method"
                      options={PAYMENT_METHODS}
                      value={formik.values.method ? [formik.values.method] : []}
                      onChange={(d: { value?: string[] }) =>
                        formik.setFieldValue('method', d?.value?.[0] ?? '')
                      }
                      error={formik.errors.method}
                    />
                  </SimpleGrid>

                  <CustomInput
                    label="Reference"
                    placeholder="Transaction reference"
                    error={formik.errors.reference}
                    inputProps={{
                      name: 'reference',
                      value: formik.values.reference,
                      onChange: formik.handleChange,
                    }}
                  />

                  <CustomTextArea
                    label="Note"
                    placeholder="Optional note"
                    name="note"
                    value={formik.values.note}
                    onChange={formik.handleChange}
                    error={formik.errors.note}
                  />
                </Flex>
              </Dialog.Body>

              <Dialog.Footer p={0} mt="2rem" gap=".75rem">
                <Button
                  type="button"
                  variant="outlineSecondary"
                  onClick={() => onOpenChange({ open: false })}
                  disabled={createPayment.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="primary.500"
                  color="white"
                  _hover={{ bg: 'primary.600' }}
                  loading={createPayment.isPending}
                  loadingText="Saving…"
                >
                  Record Payment
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
