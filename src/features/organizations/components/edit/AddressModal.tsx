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
import { CustomInput, CustomSelect, CustomSwitch } from '@/components/input';
import {
  ORG_ADDRESS_TYPES,
  type IOrgAddress,
  type OrgAddressType,
} from '@/shared/interface/settings';
import {
  useCreateOrganizationAddress,
  useUpdateOrganizationAddress,
} from '../../api/query';

const TYPE_OPTIONS = ORG_ADDRESS_TYPES.map((type) => ({
  label: type.charAt(0) + type.slice(1).toLowerCase(),
  value: type,
}));

const schema = Yup.object({
  type: Yup.string().required('Select a type'),
  addressLine1: Yup.string().required('Address line 1 is required'),
  city: Yup.string().required('City is required'),
});

interface Props {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  orgId: string;
  address: IOrgAddress | null;
}

export function AddressModal({ open, onOpenChange, orgId, address }: Props) {
  const createAddress = useCreateOrganizationAddress();
  const updateAddress = useUpdateOrganizationAddress();
  const isPending = createAddress.isPending || updateAddress.isPending;

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: schema,
    validateOnChange: false,
    initialValues: {
      label: address?.label || '',
      type: (address?.type || 'OFFICE') as OrgAddressType,
      attention: address?.attention || '',
      addressLine1: address?.addressLine1 || '',
      addressLine2: address?.addressLine2 || '',
      city: address?.city || '',
      state: address?.state || '',
      country: address?.country || '',
      postalCode: address?.postalCode || '',
      phone: address?.phone || '',
      isPrimary: address?.isPrimary || false,
    },
    onSubmit: (values) => {
      const payload = {
        label: values.label || undefined,
        type: values.type,
        attention: values.attention || undefined,
        addressLine1: values.addressLine1 || undefined,
        addressLine2: values.addressLine2 || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        country: values.country || undefined,
        postalCode: values.postalCode || undefined,
        phone: values.phone || undefined,
        isPrimary: values.isPrimary,
      };

      const onSuccess = () => {
        formik.resetForm();
        onOpenChange({ open: false });
      };

      if (address) {
        updateAddress.mutate(
          { id: orgId, addressId: address.id, payload },
          { onSuccess }
        );
      } else {
        createAddress.mutate({ id: orgId, payload }, { onSuccess });
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
          <Dialog.Content maxW="36rem" p="2rem">
            <Dialog.Header p={0} mb="1.5rem">
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                {address ? 'Edit Address' : 'Add Address'}
              </Dialog.Title>
            </Dialog.Header>

            <chakra.form onSubmit={formik.handleSubmit}>
              <Dialog.Body p={0}>
                <Flex direction="column" gap="1rem">
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
                    <CustomInput
                      label="Label"
                      placeholder="e.g. Head Office"
                      name="label"
                      value={formik.values.label}
                      onChange={formik.handleChange}
                    />
                    <CustomSelect
                      label="Type"
                      placeholder="Select type"
                      options={TYPE_OPTIONS}
                      value={formik.values.type ? [formik.values.type] : []}
                      onChange={(d: { value?: string[] }) =>
                        formik.setFieldValue('type', d?.value?.[0] ?? '')
                      }
                      error={formik.errors.type}
                    />
                  </SimpleGrid>

                  <CustomInput
                    label="Attention"
                    placeholder="Contact person"
                    name="attention"
                    value={formik.values.attention}
                    onChange={formik.handleChange}
                  />

                  <CustomInput
                    label="Address Line 1"
                    name="addressLine1"
                    value={formik.values.addressLine1}
                    onChange={formik.handleChange}
                    error={formik.errors.addressLine1}
                  />
                  <CustomInput
                    label="Address Line 2"
                    name="addressLine2"
                    value={formik.values.addressLine2}
                    onChange={formik.handleChange}
                  />

                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
                    <CustomInput
                      label="City"
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      error={formik.errors.city}
                    />
                    <CustomInput
                      label="State"
                      name="state"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                    />
                    <CustomInput
                      label="Country"
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                    />
                    <CustomInput
                      label="Postal Code"
                      name="postalCode"
                      value={formik.values.postalCode}
                      onChange={formik.handleChange}
                    />
                  </SimpleGrid>

                  <CustomInput
                    label="Phone"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                  />

                  <CustomSwitch
                    reversed
                    checked={formik.values.isPrimary}
                    onCheckedChange={(e: { checked: boolean }) =>
                      formik.setFieldValue('isPrimary', e.checked)
                    }
                  >
                    Set as primary address
                  </CustomSwitch>
                </Flex>
              </Dialog.Body>

              <Dialog.Footer p={0} mt="2rem" gap=".75rem">
                <Button
                  type="button"
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
                  {address ? 'Save Changes' : 'Add Address'}
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
