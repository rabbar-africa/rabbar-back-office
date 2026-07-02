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
import { CustomInput, CustomSwitch } from '@/components/input';
import type { IOrgBankAccount } from '@/shared/interface/settings';
import {
  useCreateOrganizationBankAccount,
  useUpdateOrganizationBankAccount,
} from '../../api/query';

const schema = Yup.object({
  bankName: Yup.string().required('Bank name is required'),
  accountName: Yup.string().required('Account name is required'),
  accountNumber: Yup.string().required('Account number is required'),
});

interface Props {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  orgId: string;
  account: IOrgBankAccount | null;
}

export function BankAccountModal({
  open,
  onOpenChange,
  orgId,
  account,
}: Props) {
  const createAccount = useCreateOrganizationBankAccount();
  const updateAccount = useUpdateOrganizationBankAccount();
  const isPending = createAccount.isPending || updateAccount.isPending;

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: schema,
    validateOnChange: false,
    initialValues: {
      bankName: account?.bankName || '',
      accountName: account?.accountName || '',
      accountNumber: account?.accountNumber || '',
      bankCode: account?.bankCode || '',
      isPrimary: account?.isPrimary || false,
    },
    onSubmit: (values) => {
      const payload = {
        bankName: values.bankName,
        accountName: values.accountName,
        accountNumber: values.accountNumber,
        bankCode: values.bankCode || undefined,
        isPrimary: values.isPrimary,
      };

      const onSuccess = () => {
        formik.resetForm();
        onOpenChange({ open: false });
      };

      if (account) {
        updateAccount.mutate(
          { id: orgId, accountId: account.id, payload },
          { onSuccess }
        );
      } else {
        createAccount.mutate({ id: orgId, payload }, { onSuccess });
      }
    },
  });

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
                {account ? 'Edit Bank Account' : 'Add Bank Account'}
              </Dialog.Title>
            </Dialog.Header>

            <chakra.form onSubmit={formik.handleSubmit}>
              <Dialog.Body p={0}>
                <Flex direction="column" gap="1rem">
                  <CustomInput
                    label="Bank Name"
                    name="bankName"
                    value={formik.values.bankName}
                    onChange={formik.handleChange}
                    error={formik.errors.bankName}
                  />
                  <CustomInput
                    label="Account Name"
                    name="accountName"
                    value={formik.values.accountName}
                    onChange={formik.handleChange}
                    error={formik.errors.accountName}
                  />
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
                    <CustomInput
                      label="Account Number"
                      name="accountNumber"
                      value={formik.values.accountNumber}
                      onChange={formik.handleChange}
                      error={formik.errors.accountNumber}
                    />
                    <CustomInput
                      label="Bank Code"
                      name="bankCode"
                      value={formik.values.bankCode}
                      onChange={formik.handleChange}
                    />
                  </SimpleGrid>

                  <CustomSwitch
                    reversed
                    checked={formik.values.isPrimary}
                    onCheckedChange={(e: { checked: boolean }) =>
                      formik.setFieldValue('isPrimary', e.checked)
                    }
                  >
                    Set as primary account
                  </CustomSwitch>
                </Flex>
              </Dialog.Body>

              <Dialog.Footer p={0} mt="2rem" gap=".75rem">
                <Button
                  variant="outlineSecondary"
                  onClick={() => onOpenChange({ open: false })}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="primary.500"
                  color="white"
                  _hover={{ bg: 'primary.600' }}
                  loading={isPending}
                  loadingText="Saving…"
                >
                  {account ? 'Save Changes' : 'Add Account'}
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
