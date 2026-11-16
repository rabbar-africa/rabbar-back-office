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
import { CustomInput } from '@/components/input';
import { useCreateAdmin } from '../api';

const schema = Yup.object({
  firstName: Yup.string().trim().required('First name is required'),
  lastName: Yup.string().trim().required('Last name is required'),
  email: Yup.string()
    .trim()
    .email('Enter a valid email')
    .required('Email is required'),
  phoneNumber: Yup.string().trim(),
});

interface AddAdminModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
}

/**
 * Invite a platform admin (owners only). No password: the API emails a
 * single-use link, valid 48 hours, where they choose their own.
 */
export function AddAdminModal({ open, onOpenChange }: AddAdminModalProps) {
  const createAdmin = useCreateAdmin();

  const formik = useFormik({
    initialValues: { firstName: '', lastName: '', email: '', phoneNumber: '' },
    validationSchema: schema,
    validateOnChange: false,
    onSubmit: (values) =>
      createAdmin.mutate(
        {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          ...(values.phoneNumber.trim()
            ? { phoneNumber: values.phoneNumber.trim() }
            : {}),
        },
        { onSuccess: () => onOpenChange({ open: false }) }
      ),
  });

  const { resetForm } = formik;
  useEffect(() => {
    if (!open) resetForm();
  }, [open, resetForm]);

  const field = (name: keyof typeof formik.values) => ({
    error: formik.touched[name] ? formik.errors[name] : undefined,
    inputProps: {
      name,
      value: formik.values[name],
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
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
          <Dialog.Content maxW="32rem" p="2rem">
            <Dialog.Header p={0} mb="1.5rem" display="block">
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                Add admin
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.300" mt="1">
                They can open every business in the back office, one at a time.
                Everything they open is recorded in the access log.
              </Text>
            </Dialog.Header>

            <chakra.form onSubmit={formik.handleSubmit} noValidate>
              <Dialog.Body p={0}>
                <Flex direction="column" gap="1rem">
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
                    <CustomInput
                      label="First name"
                      required
                      {...field('firstName')}
                    />
                    <CustomInput
                      label="Last name"
                      required
                      {...field('lastName')}
                    />
                  </SimpleGrid>
                  <CustomInput
                    label="Email"
                    required
                    placeholder="name@rabbar.africa"
                    {...field('email')}
                    inputProps={{ ...field('email').inputProps, type: 'email' }}
                  />
                  <CustomInput
                    label="Phone number"
                    placeholder="Optional"
                    {...field('phoneNumber')}
                    inputProps={{
                      ...field('phoneNumber').inputProps,
                      type: 'tel',
                    }}
                  />

                  <Box bg="primary.50" rounded=".5rem" px=".75rem" py=".625rem">
                    <Text textStyle="tiny-regular" color="primary.300">
                      We email them a link to choose their own password. It
                      works once, for 48 hours, and you can resend it from the
                      list. After that they sign in with their password and an
                      emailed code.
                    </Text>
                  </Box>
                </Flex>
              </Dialog.Body>

              <Dialog.Footer p={0} mt="2rem" gap=".75rem">
                <Button
                  type="button"
                  variant="outlineSecondary"
                  onClick={() => onOpenChange({ open: false })}
                  disabled={createAdmin.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="primary.500"
                  color="white"
                  _hover={{ bg: 'primary.600' }}
                  loading={createAdmin.isPending}
                  loadingText="Sending…"
                >
                  Send invite
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
