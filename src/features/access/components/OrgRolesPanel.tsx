import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Collapsible,
  Flex,
  Menu,
  Portal,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import ConsentDialog from '@/components/common/ConsentDialog';
import Status from '@/components/ui/Status';
import { ThreeDotsIcon } from '@/assets/custom/ThreeDotsIcon';
import { pascalToCapitalized } from '@/utils/string-formatter';
import type { IRole } from '@/shared/interface/access';
import {
  useDeleteOrgRoleMutation,
  useGetOrgPermissionsGroupedQuery,
  useGetOrgRolesQuery,
  useSyncOrgPermissionsMutation,
  useSyncOrgRoleDefaultsMutation,
} from '../api';
import { PermissionMatrix, toMatrixRows } from './PermissionMatrix';
import { RoleFormModal } from './RoleFormModal';

interface OrgRolesPanelProps {
  orgId: string;
}

/**
 * Roles and permissions for one organization.
 *
 * System roles (seeded from the platform's default templates) are read-only —
 * the backend rejects edits to them — so they render with their matrix
 * expandable but not editable. Custom roles the org created are fully editable
 * from here.
 */
export function OrgRolesPanel({ orgId }: OrgRolesPanelProps) {
  const { data, isLoading } = useGetOrgRolesQuery(orgId);
  const { data: permissionData } = useGetOrgPermissionsGroupedQuery(orgId);

  const deleteRole = useDeleteOrgRoleMutation(orgId);
  const syncPermissions = useSyncOrgPermissionsMutation(orgId);
  const syncDefaults = useSyncOrgRoleDefaultsMutation(orgId);

  const [editing, setEditing] = useState<IRole | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<IRole | null>(null);
  const [pendingSyncDefaults, setPendingSyncDefaults] = useState(false);

  const roles = data?.data ?? [];
  const matrixRows = useMemo(
    () => toMatrixRows(permissionData?.data ?? []),
    [permissionData?.data]
  );
  const permissionCount = permissionData?.data?.reduce(
    (sum, group) => sum + group.permissions.length,
    0
  );

  const systemRoles = roles.filter((role) => role.isSystem);
  const customRoles = roles.filter((role) => !role.isSystem);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (role: IRole) => {
    setEditing(role);
    setFormOpen(true);
  };

  if (isLoading) {
    return (
      <Stack gap="1rem">
        <Skeleton height="4rem" rounded=".625rem" bg="gray.50" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height="5rem" rounded=".625rem" bg="gray.50" />
        ))}
      </Stack>
    );
  }

  return (
    <>
      <Stack gap="1.5rem">
        {/* Summary + org-level sync actions */}
        <Box
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
          rounded=".625rem"
          p="1.25rem"
        >
          <Flex
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap="1rem"
          >
            <SimpleGrid columns={3} gap="1.5rem" flex="1">
              <Box>
                <Text fontSize="1.25rem" fontWeight="700" color="gray.500">
                  {roles.length}
                </Text>
                <Text textStyle="tiny-regular" color="gray.300">
                  Roles
                </Text>
              </Box>
              <Box>
                <Text fontSize="1.25rem" fontWeight="700" color="gray.500">
                  {customRoles.length}
                </Text>
                <Text textStyle="tiny-regular" color="gray.300">
                  Custom
                </Text>
              </Box>
              <Box>
                <Text fontSize="1.25rem" fontWeight="700" color="gray.500">
                  {permissionCount ?? '—'}
                </Text>
                <Text textStyle="tiny-regular" color="gray.300">
                  Permissions
                </Text>
              </Box>
            </SimpleGrid>

            <Flex gap="2" wrap="wrap">
              <Button
                size="sm"
                variant="outlineSecondary"
                loading={syncPermissions.isPending}
                onClick={() => syncPermissions.mutate()}
              >
                Sync permissions
              </Button>
              <Button
                size="sm"
                variant="outlineSecondary"
                loading={syncDefaults.isPending}
                onClick={() => setPendingSyncDefaults(true)}
              >
                Sync default roles
              </Button>
              <Button size="sm" onClick={openCreate}>
                New role
              </Button>
            </Flex>
          </Flex>
        </Box>

        {roles.length === 0 ? (
          <Box
            bg="white"
            borderWidth="1px"
            borderColor="gray.75"
            rounded=".625rem"
            p="2rem"
            textAlign="center"
          >
            <Text textStyle="small-regular" color="gray.300">
              This organization has no roles yet. Run “Sync default roles” to
              seed the platform templates.
            </Text>
          </Box>
        ) : (
          <Stack gap="1rem">
            {[...customRoles, ...systemRoles].map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                matrixRows={matrixRows}
                onEdit={() => openEdit(role)}
                onDelete={() => setPendingDelete(role)}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <RoleFormModal
        open={formOpen}
        onOpenChange={({ open }) => setFormOpen(open)}
        orgId={orgId}
        role={editing}
      />

      <ConsentDialog
        open={Boolean(pendingDelete)}
        onOpenChange={({ open }) => {
          if (!open) setPendingDelete(null);
        }}
        heading={`Delete “${pendingDelete?.name}”?`}
        note={
          pendingDelete?._count?.userRoles
            ? `${pendingDelete._count.userRoles} user(s) currently hold this role and will lose its permissions.`
            : 'This role will be removed from the organization.'
        }
        confirmText="Yes, Delete"
        isLoading={deleteRole.isPending}
        handleSubmit={() => {
          if (!pendingDelete) return;
          deleteRole.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          });
        }}
      />

      <ConsentDialog
        open={pendingSyncDefaults}
        onOpenChange={({ open }) => setPendingSyncDefaults(open)}
        variant="warning"
        heading="Sync default roles to this organization?"
        note="System roles are re-created from the platform templates and their permission sets are reset to match. Custom roles are left untouched."
        confirmText="Yes, Sync"
        cancelText="Cancel"
        isLoading={syncDefaults.isPending}
        handleSubmit={() =>
          syncDefaults.mutate(undefined, {
            onSuccess: () => setPendingSyncDefaults(false),
          })
        }
      />
    </>
  );
}

interface RoleCardProps {
  role: IRole;
  matrixRows: ReturnType<typeof toMatrixRows>;
  onEdit: () => void;
  onDelete: () => void;
}

function RoleCard({ role, matrixRows, onEdit, onDelete }: RoleCardProps) {
  const granted = useMemo(
    () => new Set(role.rolePermissions?.map((rp) => rp.permissionId) ?? []),
    [role.rolePermissions]
  );
  const userCount = role._count?.userRoles ?? 0;

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded=".625rem"
      overflow="hidden"
    >
      <Collapsible.Root>
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="1rem"
          px="1.25rem"
          py="1rem"
        >
          <Box minW={0}>
            <Flex align="center" gap=".5rem" wrap="wrap">
              <Text textStyle="default-bold" color="gray.500">
                {pascalToCapitalized(role.name)}
              </Text>
              {role.isSystem && (
                <Status
                  name="System"
                  px=".5rem"
                  w="auto"
                  minW="4rem"
                  h="1.5rem"
                  whiteSpace="nowrap"
                />
              )}
            </Flex>
            <Text textStyle="small-regular" color="gray.300" mt=".125rem">
              {role.description || 'No description'}
            </Text>
            <Text textStyle="tiny-regular" color="gray.200" mt=".25rem">
              {granted.size} permission{granted.size === 1 ? '' : 's'} ·{' '}
              {userCount} user{userCount === 1 ? '' : 's'}
            </Text>
          </Box>

          <Flex align="center" gap="2">
            <Collapsible.Trigger asChild>
              <Button size="sm" variant="ghost">
                Permissions
              </Button>
            </Collapsible.Trigger>

            {/* System roles are platform-managed; the API rejects edits. */}
            {!role.isSystem && (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button
                    size="sm"
                    variant="outlineSecondary"
                    px=".625rem"
                    aria-label={`Actions for ${role.name}`}
                  >
                    <ThreeDotsIcon />
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item value="edit" onClick={onEdit}>
                        Edit role
                      </Menu.Item>
                      <Menu.Item
                        value="delete"
                        color="error.300"
                        onClick={onDelete}
                      >
                        Delete role
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            )}
          </Flex>
        </Flex>

        <Collapsible.Content>
          <Box
            px="1.25rem"
            pb="1.25rem"
            pt=".25rem"
            borderTopWidth="1px"
            borderColor="gray.50"
          >
            <PermissionMatrix rows={matrixRows} selected={granted} />
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}
