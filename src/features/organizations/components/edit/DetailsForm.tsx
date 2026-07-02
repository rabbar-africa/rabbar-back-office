import { Box, Button, Flex, Grid } from '@chakra-ui/react';
import { useFormik } from 'formik';
import { CustomInput, CustomTextArea } from '@/components/input';
import type { IOrganization } from '@/shared/interface/common';
import { useUpdateOrganization } from '../../api/query';
import { EditSection } from './EditSection';

interface DetailsFormProps {
  id: string;
  org?: IOrganization;
}

export function DetailsForm({ id, org }: DetailsFormProps) {
  const { mutate: updateOrganization, isPending } = useUpdateOrganization();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: org?.name || '',
      companyEmail: org?.companyEmail || org?.email || '',
      phone: org?.phone || '',
      phone2: org?.phone2 || '',
      website: org?.website || '',
      industry: org?.industry || '',
      rcNumber: org?.rcNumber || '',
      currency: org?.currency || '',
      timezone: org?.timezone || '',
      description: org?.description || '',
    },
    onSubmit: (values) => {
      updateOrganization({ id, ...values });
    },
  });

  return (
    <EditSection
      title="Company Information"
      subtitle="Core details about the organization."
    >
      <form onSubmit={formik.handleSubmit}>
        <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap="1rem">
          <CustomInput
            label="Organization Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <CustomInput
            label="Company Email"
            type="email"
            name="companyEmail"
            value={formik.values.companyEmail}
            onChange={formik.handleChange}
          />
          <CustomInput
            label="Phone Number"
            name="phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
          />
          <CustomInput
            label="Alternate Phone"
            name="phone2"
            value={formik.values.phone2}
            onChange={formik.handleChange}
          />
          <CustomInput
            label="Website"
            name="website"
            value={formik.values.website}
            onChange={formik.handleChange}
          />
          <CustomInput
            label="Industry"
            name="industry"
            value={formik.values.industry}
            onChange={formik.handleChange}
          />
          <CustomInput
            label="RC Number"
            name="rcNumber"
            value={formik.values.rcNumber}
            onChange={formik.handleChange}
          />
          <CustomInput
            label="Currency"
            name="currency"
            value={formik.values.currency}
            onChange={formik.handleChange}
          />
          <CustomInput
            label="Timezone"
            name="timezone"
            value={formik.values.timezone}
            onChange={formik.handleChange}
          />
          <Box gridColumn={{ sm: '1 / -1' }}>
            <CustomTextArea
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Box>
        </Grid>

        <Flex justify="flex-end" mt="1.5rem">
          <Button
            type="submit"
            bg="primary.500"
            color="white"
            _hover={{ bg: 'primary.600' }}
            loading={isPending}
            loadingText="Saving…"
          >
            Save Changes
          </Button>
        </Flex>
      </form>
    </EditSection>
  );
}
