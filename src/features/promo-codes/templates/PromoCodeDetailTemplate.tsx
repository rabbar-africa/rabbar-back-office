import { useState, type ReactNode } from 'react';
import { Box, Button, Flex, Heading, Text, chakra } from '@chakra-ui/react';
import { type ColumnDef } from '@tanstack/react-table';
import { Link, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { ArrowLeft } from '@/assets/custom';
import Status from '@/components/common/Status';
import SectionLoader from '@/components/common/SectionLoader';
import { CustomTable } from '@/components/table';
import { RouteConstants } from '@/shared/constants/routes';
import type {
  IPromoCode,
  IPromoRedemption,
} from '@/shared/interface/promo-code';
import { useGetPromoCodeById, useUpdatePromoCode } from '../api';
import {
  REDEMPTION_STATUS_LABELS,
  apiErrorMessage,
  createdByName,
  describePromo,
  describeRemaining,
  describeUses,
  describeValidity,
} from '../data';
import { AutoApplyBadge } from '../components/promo-code-columns';
import { PromoCodeFields } from '../components/PromoCodeFields';
import {
  toUpdatePayload,
  usePromoCodeForm,
} from '../components/usePromoCodeForm';
import { usePromoActiveToggle } from '../components/usePromoActiveToggle';
import { usePaidPlans } from '../components/usePaidPlans';

const redemptionColumns = (
  promo: IPromoCode
): ColumnDef<IPromoRedemption, any>[] => [
  {
    id: 'organization',
    header: 'Organization',
    cell: ({ row }) => (
      <Link
        to={RouteConstants.organizations.detail.generate(
          { id: row.original.organization.id },
          { tab: 'subscription' }
        )}
      >
        <Text
          textStyle="small-semibold"
          color="primary.300"
          _hover={{ textDecoration: 'underline' }}
        >
          {row.original.organization.name}
        </Text>
      </Link>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Status
        name={
          REDEMPTION_STATUS_LABELS[row.original.status] ?? row.original.status
        }
      />
    ),
  },
  {
    id: 'remaining',
    header: 'Discounted months left',
    cell: ({ row }) => describeRemaining(promo, row.original),
  },
  {
    accessorKey: 'redeemedAt',
    header: 'Redeemed',
    cell: ({ getValue }) => moment(getValue() as string).format('DD MMM YYYY'),
  },
];

export function PromoCodeDetailTemplate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isPending } = useGetPromoCodeById(id!);
  const promo = data?.data;

  const { plans, planNames, isLoading: plansLoading } = usePaidPlans();
  const updatePromo = useUpdatePromoCode();
  const { toggle, dialog, togglingId } = usePromoActiveToggle();
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = usePromoCodeForm({
    promo,
    onSubmit: (values, initial) => {
      setServerError(null);
      updatePromo.mutate(
        { id: id!, payload: toUpdatePayload(values, initial) },
        { onError: (error) => setServerError(apiErrorMessage(error)) }
      );
    },
  });

  const goBack = () => navigate(RouteConstants.promoCodes.base.path);

  if (isPending) return <SectionLoader />;

  if (!promo) {
    return (
      <Flex direction="column" align="center" gap="1rem" py="4rem">
        <Text color="gray.500">This promo code could not be found.</Text>
        <Button variant="outlineSecondary" onClick={goBack}>
          Back to Promo Codes
        </Button>
      </Flex>
    );
  }

  const redemptions = promo.redemptions ?? [];

  return (
    <Flex direction="column" gap="1.5rem" pb="3rem">
      <Flex align="center" gap=".75rem">
        <Box as="button" onClick={goBack} aria-label="Back to promo codes">
          <ArrowLeft width="1.25rem" color="gray.500" />
        </Box>
        <Text fontSize=".875rem" color="gray.500">
          Back to Promo Codes
        </Text>
      </Flex>

      <Flex justify="space-between" align="flex-start" wrap="wrap" gap="1rem">
        <Box>
          <Flex align="center" gap=".75rem" wrap="wrap">
            <Heading fontSize="1.5rem" fontWeight="600" letterSpacing="0.5px">
              {promo.code}
            </Heading>
            <Status name={promo.isActive ? 'Active' : 'Inactive'} />
            {promo.autoApplyOnSignup && <AutoApplyBadge />}
          </Flex>
          <Text textStyle="default-regular" color="gray.500" mt=".5rem">
            {describePromo(promo, planNames)}
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt=".25rem">
            {describeUses(promo)} uses · {describeValidity(promo)} · Created by{' '}
            {createdByName(promo)} on{' '}
            {moment(promo.createdAt).format('DD MMM YYYY')}
          </Text>
        </Box>

        <Button
          variant="outline"
          color={promo.isActive ? 'error.300' : 'success.300'}
          borderColor={promo.isActive ? 'error.300' : 'success.300'}
          _hover={{ bg: promo.isActive ? 'error.50' : 'success.50' }}
          loading={togglingId === promo.id}
          onClick={() => toggle(promo)}
        >
          {promo.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </Flex>

      <Panel
        title="Details"
        subtitle="Changes apply to future uses of this code"
      >
        <chakra.form onSubmit={formik.handleSubmit}>
          <PromoCodeFields
            formik={formik}
            isEdit
            plans={plans}
            planNames={planNames}
            plansLoading={plansLoading}
            serverError={serverError}
          />
          <Flex justify="flex-end" gap=".75rem" mt="2rem">
            <Button
              type="button"
              variant="outlineSecondary"
              disabled={!formik.dirty || updatePromo.isPending}
              onClick={() => {
                formik.resetForm();
                setServerError(null);
              }}
            >
              Discard changes
            </Button>
            <Button
              type="submit"
              bg="primary.500"
              color="white"
              _hover={{ bg: 'primary.600' }}
              disabled={!formik.dirty}
              loading={updatePromo.isPending}
              loadingText="Saving…"
            >
              Save changes
            </Button>
          </Flex>
        </chakra.form>
      </Panel>

      <Panel
        title="Redemptions"
        subtitle={`${redemptions.length} organization${redemptions.length === 1 ? '' : 's'} used this code`}
      >
        <Box overflowX="auto" minW={0}>
          <CustomTable
            data={redemptions}
            columns={redemptionColumns(promo)}
            NoDataText="No organization has used this code yet"
          />
        </Box>
      </Panel>

      {dialog}
    </Flex>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded=".625rem"
      shadow="sm"
      overflow="hidden"
    >
      <Box
        px="1.25rem"
        py=".875rem"
        borderBottomWidth="1px"
        borderColor="gray.75"
      >
        <Text textStyle="default-bold" color="gray.500">
          {title}
        </Text>
        {subtitle && (
          <Text textStyle="tiny-regular" color="gray.300" mt=".125rem">
            {subtitle}
          </Text>
        )}
      </Box>
      <Box px="1.25rem" py="1.25rem">
        {children}
      </Box>
    </Box>
  );
}
