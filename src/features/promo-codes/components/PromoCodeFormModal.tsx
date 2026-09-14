import { useState } from 'react';
import { Button, Dialog, Portal, Text, chakra } from '@chakra-ui/react';
import { useCreatePromoCode } from '../api';
import { apiErrorMessage, apiErrorStatus } from '../data';
import { PromoCodeFields } from './PromoCodeFields';
import { toCreatePayload, usePromoCodeForm } from './usePromoCodeForm';
import { usePaidPlans } from './usePaidPlans';

interface PromoCodeFormModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
}

/** Create a promo code. Editing happens on the detail page. */
export function PromoCodeFormModal({
  open,
  onOpenChange,
}: PromoCodeFormModalProps) {
  const { plans, planNames, isLoading: plansLoading } = usePaidPlans(open);
  const createPromo = useCreatePromoCode();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = usePromoCodeForm({
    onSubmit: (values) => {
      setServerError(null);
      createPromo.mutate(toCreatePayload(values), {
        onSuccess: () => handleOpenChange({ open: false }),
        onError: (error) => {
          const message = apiErrorMessage(error);
          // 409 = the code already exists; show it on the field itself.
          if (apiErrorStatus(error) === 409)
            formik.setFieldError('code', message);
          else setServerError(message);
        },
      });
    },
  });

  const handleOpenChange = (details: { open: boolean }) => {
    if (!details.open) {
      formik.resetForm();
      setServerError(null);
    }
    onOpenChange(details);
  };

  return (
    <Dialog.Root
      placement="center"
      open={open}
      onOpenChange={handleOpenChange}
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="44rem" p="2rem">
            <Dialog.Header p={0} mb="1.5rem" display="block">
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                New promo code
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.300" mt="1">
                Run a promotion like “3 months free” or “50% off for 3 months”.
              </Text>
            </Dialog.Header>

            <chakra.form onSubmit={formik.handleSubmit}>
              <Dialog.Body p={0}>
                <PromoCodeFields
                  formik={formik}
                  plans={plans}
                  planNames={planNames}
                  plansLoading={plansLoading}
                  serverError={serverError}
                />
              </Dialog.Body>

              <Dialog.Footer p={0} mt="2rem" gap=".75rem">
                <Button
                  type="button"
                  variant="outlineSecondary"
                  onClick={() => handleOpenChange({ open: false })}
                  disabled={createPromo.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="primary.500"
                  color="white"
                  _hover={{ bg: 'primary.600' }}
                  loading={createPromo.isPending}
                  loadingText="Creating…"
                >
                  Create promo code
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
