import { useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  SimpleGrid,
  Text,
  chakra,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CustomInput, CustomSwitch, CustomTextArea } from '@/components/input';
import type { IPlan } from '@/features/organizations/api/types';
import { FREE_PLAN_TIER } from '@/shared/constants/subscription';
import { useUpdatePlan } from '../api';

const schema = Yup.object({
  name: Yup.string().trim().required('Enter a plan name'),
  description: Yup.string(),
  monthlyPrice: Yup.string()
    .required('Enter the monthly price')
    .matches(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount'),
  currency: Yup.string()
    .trim()
    .required('Enter a currency')
    .matches(/^[A-Za-z]{3}$/, 'Use a 3-letter code, e.g. NGN'),
  isActive: Yup.boolean(),
});

interface PlanFormModalProps {
  plan: IPlan | null;
  onClose: () => void;
}

/** Edit a plan's name, description, price, or availability. */
export function PlanFormModal({ plan, onClose }: PlanFormModalProps) {
  const updatePlan = useUpdatePlan();
  const isFreeTier = plan?.tier === FREE_PLAN_TIER;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: plan?.name ?? '',
      description: plan?.description ?? '',
      monthlyPrice: plan ? String(Number(plan.monthlyPrice)) : '',
      currency: plan?.currency ?? 'NGN',
      isActive: plan?.isActive ?? true,
    },
    validationSchema: schema,
    validateOnChange: false,
    onSubmit: (values) => {
      if (!plan) return;
      updatePlan.mutate(
        {
          id: plan.id,
          payload: {
            name: values.name.trim(),
            description: values.description.trim(),
            // Starter stays free: the billing job treats any priced plan as paid.
            monthlyPrice: isFreeTier ? 0 : Number(values.monthlyPrice),
            currency: values.currency.trim().toUpperCase(),
            isActive: values.isActive,
          },
        },
        { onSuccess: onClose }
      );
    },
  });

  // Drop stale errors when a different plan is opened.
  useEffect(() => {
    formik.setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id]);

  const deactivating = Boolean(plan?.isActive) && !formik.values.isActive;

  return (
    <Dialog.Root
      placement="center"
      open={Boolean(plan)}
      onOpenChange={({ open }) => !open && onClose()}
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="32rem" p="2rem">
            <Dialog.Header p={0} mb="1.5rem" display="block">
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                Edit {plan?.name ?? 'plan'}
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.300" mt="1">
                Price changes apply to future payments. Organizations already on
                this plan keep their current period.
              </Text>
            </Dialog.Header>

            <chakra.form onSubmit={formik.handleSubmit}>
              <Dialog.Body p={0}>
                <Flex direction="column" gap="1rem">
                  <CustomInput
                    label="Name"
                    placeholder="Standard"
                    error={formik.errors.name}
                    inputProps={{
                      name: 'name',
                      value: formik.values.name,
                      onChange: formik.handleChange,
                    }}
                  />

                  <CustomTextArea
                    label="Description"
                    placeholder="What this plan includes"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.errors.description}
                  />

                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
                    <CustomInput
                      label="Monthly price"
                      placeholder="0.00"
                      disabled={isFreeTier}
                      helperText={
                        isFreeTier
                          ? 'Starter is the free default plan and stays at 0.'
                          : undefined
                      }
                      error={formik.errors.monthlyPrice}
                      inputProps={{
                        name: 'monthlyPrice',
                        value: formik.values.monthlyPrice,
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
                        maxLength: 3,
                      }}
                    />
                  </SimpleGrid>

                  <Box>
                    <CustomSwitch
                      label="Available to organizations"
                      checked={formik.values.isActive}
                      onCheckedChange={({ checked }: { checked: boolean }) =>
                        formik.setFieldValue('isActive', checked)
                      }
                      helperText={
                        deactivating
                          ? 'Organizations can no longer upgrade to this plan. Those already on it are not affected.'
                          : 'Inactive plans are hidden from the upgrade options in the app.'
                      }
                    />
                  </Box>
                </Flex>
              </Dialog.Body>

              <Dialog.Footer p={0} mt="2rem" gap=".75rem">
                <Button
                  type="button"
                  variant="outlineSecondary"
                  onClick={onClose}
                  disabled={updatePlan.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="primary.500"
                  color="white"
                  _hover={{ bg: 'primary.600' }}
                  disabled={!formik.dirty}
                  loading={updatePlan.isPending}
                  loadingText="Saving…"
                >
                  Save changes
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
