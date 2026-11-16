import { useMemo, useState } from 'react';
import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import type { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { CustomTable, type TableAction } from '@/components/table';
import { PageHeader } from '@/components/common/PageHeader';
import { RefreshButton } from '@/components/common/RefreshButton';
import ConsentDialog from '@/components/common/ConsentDialog';
import Status from '@/components/common/Status';
import { toaster } from '@/components/ui';
import { customQueryKey } from '@/shared/constants/query-keys';
import { RouteConstants } from '@/shared/constants/routes';
import type { IAdmin } from '@/shared/interface/admin';
import { useGetCurrentUserQuery } from '@/features/auth/api';
import {
  useAdminPermissions,
  useCancelAdminInvite,
  useGetAdmins,
  useResendAdminInvite,
  useSetAdminActive,
} from '../api';
import { AddAdminModal } from '../components/AddAdminModal';

const fullName = (admin: IAdmin) =>
  [admin.firstName, admin.lastName].filter(Boolean).join(' ') || admin.email;

/** Everyone who can sign in to the back office. Owners only (see the page). */
export function AdminsTemplate() {
  const navigate = useNavigate();
  const { canManageAdmins } = useAdminPermissions();
  const { data: me } = useGetCurrentUserQuery();
  const { data, isPending } = useGetAdmins();
  const admins = data ?? [];

  const [addOpen, setAddOpen] = useState(false);
  const [pending, setPending] = useState<IAdmin | null>(null);
  const setActive = useSetAdminActive();
  const resendInvite = useResendAdminInvite();
  const cancelInvite = useCancelAdminInvite();

  const columns = useMemo<ColumnDef<IAdmin, any>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Box>
            <Flex align="center" gap=".5rem">
              <Text fontSize="13px" fontWeight="500" color="gray.500">
                {fullName(row.original)}
              </Text>
              {row.original.id === me?.id && (
                <Text
                  fontSize="10px"
                  fontWeight="600"
                  color="primary.300"
                  bg="primary.50"
                  rounded="full"
                  px=".5rem"
                >
                  You
                </Text>
              )}
            </Flex>
            <Text fontSize="12px" color="gray.300">
              {row.original.email}
            </Text>
          </Box>
        ),
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const { isActive, pendingInvite } = row.original;
          if (isActive && pendingInvite)
            return (
              <Box>
                <Status name="Invited" />
                <Text fontSize="11px" color="gray.300" mt="2px">
                  Link expires{' '}
                  {moment(pendingInvite.expiresAt).format('D MMM, HH:mm')}
                </Text>
              </Box>
            );
          return <Status name={isActive ? 'Active' : 'Inactive'} />;
        },
      },
      {
        accessorKey: 'lastLoginAt',
        header: 'Last sign-in',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? (
            <Text fontSize="13px" title={moment(value).format('LLL')}>
              {moment(value).fromNow()}
            </Text>
          ) : (
            <Text fontSize="13px" color="gray.300">
              Never
            </Text>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Added',
        cell: ({ getValue }) =>
          moment(getValue() as string).format('DD MMM YYYY'),
      },
      // Owners only: the API refuses this for everyone else.
      ...(canManageAdmins
        ? [
            {
              id: 'access',
              header: '',
              meta: { disableRowClick: true },
              cell: ({ row }: { row: { original: IAdmin } }) => {
                const admin = row.original;
                const isMe = admin.id === me?.id;
                return (
                  <Button
                    size="xs"
                    variant="outline"
                    color={admin.isActive ? 'error.300' : 'primary.300'}
                    borderColor="gray.75"
                    disabled={isMe && admin.isActive}
                    title={
                      isMe && admin.isActive
                        ? "You can't deactivate yourself"
                        : undefined
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setPending(admin);
                    }}
                  >
                    {admin.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                );
              },
            } satisfies ColumnDef<IAdmin, any>,
          ]
        : []),
    ],
    [me?.id, canManageAdmins]
  );

  // Owners only: the API refuses these for everyone else.
  const actions = useMemo<TableAction<IAdmin>[]>(
    () =>
      canManageAdmins
        ? [
            {
              label: 'View access log',
              value: 'log',
              onClick: (admin) =>
                navigate(
                  RouteConstants.accessLog.base.generate(
                    {},
                    { admin: admin.id }
                  )
                ),
            },
            {
              label: 'Resend invite',
              value: 'resend',
              separator: true,
              // A new link; the old one stops working.
              onClick: (admin) => resendInvite.mutate(admin.id),
              disabled: (admin) => !admin.isActive || !admin.pendingInvite,
            },
            {
              label: 'Send password reset link',
              value: 'reset',
              // The same invite link: they choose a new password from it.
              onClick: (admin) => resendInvite.mutate(admin.id),
              disabled: (admin) =>
                !admin.isActive || Boolean(admin.pendingInvite),
            },
            {
              label: 'Cancel invite',
              value: 'cancel',
              variant: 'destructive',
              onClick: (admin) => cancelInvite.mutate(admin.id),
              disabled: (admin) => !admin.pendingInvite,
            },
          ]
        : [],
    [canManageAdmins, navigate, resendInvite, cancelInvite]
  );

  const deactivating = pending?.isActive ?? false;

  return (
    <Stack gap="6">
      <PageHeader
        title="Admins"
        subtitle="Everyone who can sign in to the back office"
        action={
          canManageAdmins ? (
            <Button
              bg="primary.500"
              color="white"
              _hover={{ bg: 'primary.600' }}
              onClick={() => setAddOpen(true)}
            >
              Add admin
            </Button>
          ) : undefined
        }
      />

      <Box
        py={{ base: '1.25rem', md: '1.5rem' }}
        px={{ base: '0.75rem', md: '1rem' }}
        bg="white"
        rounded=".625rem"
        shadow="sm"
        borderWidth="1px"
        borderColor="gray.75"
      >
        <Flex
          justify="space-between"
          align="center"
          gap="3"
          mb="1rem"
          wrap="wrap"
        >
          <Text textStyle="small-regular" color="gray.300">
            New admins get an emailed link to choose their own password (48
            hours, single use). Deactivating an admin signs them out everywhere
            at once.
          </Text>
          <RefreshButton
            queryKeys={[[customQueryKey.admins.getAll]]}
            label="Reload admins"
          />
        </Flex>

        <Box overflowX="auto" minW={0}>
          <CustomTable
            data={admins}
            columns={columns}
            loading={isPending}
            NoDataText="No admins yet"
            actions={actions}
            enableActions={actions.length > 0}
          />
        </Box>
      </Box>

      {canManageAdmins && (
        <AddAdminModal
          open={addOpen}
          onOpenChange={({ open }) => setAddOpen(open)}
        />
      )}

      <ConsentDialog
        open={Boolean(pending)}
        onOpenChange={({ open }) => !open && setPending(null)}
        variant={deactivating ? 'danger' : 'info'}
        heading={
          pending
            ? `${deactivating ? 'Deactivate' : 'Activate'} ${fullName(pending)}?`
            : ''
        }
        note={
          deactivating
            ? 'They are signed out everywhere right away and can no longer sign in. You can activate them again later.'
            : 'They can sign in to the back office again, with their password and an emailed code. If they never joined, resend their invite after this.'
        }
        confirmText={deactivating ? 'Yes, deactivate' : 'Yes, activate'}
        isLoading={setActive.isPending}
        handleSubmit={() =>
          pending &&
          setActive.mutate(
            { id: pending.id, isActive: !pending.isActive },
            {
              onSuccess: (admin) => {
                toaster.create({
                  type: 'success',
                  description: admin.isActive
                    ? `${fullName(admin)} can sign in again`
                    : `${fullName(admin)} was deactivated and signed out`,
                });
                setPending(null);
              },
            }
          )
        }
      />
    </Stack>
  );
}
