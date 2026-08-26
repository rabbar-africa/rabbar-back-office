import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react';
import ConsentDialog from '@/components/common/ConsentDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { pascalToCapitalized } from '@/utils/string-formatter';
import {
  PERMISSION_ACTIONS,
  type IDefaultRoleTemplate,
  type PermissionAction,
} from '@/shared/interface/access';
import {
  useGetDefaultRoleTemplatesQuery,
  useGetPermissionCatalogQuery,
  useSyncPermissionsToAllOrgsMutation,
  useSyncRoleDefaultsToAllOrgsMutation,
} from '../api';
import {
  PermissionMatrix,
  permissionKey,
  type MatrixRow,
} from '../components/PermissionMatrix';

/**
 * Platform-level access control.
 *
 * The permission catalog and the default role templates are defined in backend
 * code — this screen shows what they currently contain and pushes them out to
 * organizations. Editing a role happens per organization, on the org's
 * Roles & Permissions tab.
 */
export function AccessControlTemplate() {
  const { data: catalogData, isLoading: catalogLoading } =
    useGetPermissionCatalogQuery();
  const { data: templateData, isLoading: templatesLoading } =
    useGetDefaultRoleTemplatesQuery();

  const syncPermissions = useSyncPermissionsToAllOrgsMutation();
  const syncRoles = useSyncRoleDefaultsToAllOrgsMutation();

  const [pendingSync, setPendingSync] = useState<
    'permissions' | 'roles' | null
  >(null);

  const catalog = catalogData?.data;
  const templates = templateData?.data;

  /**
   * Catalog rows carry no ids (they aren't org rows yet), so key each cell by
   * `action:subject` and mark them all present — the matrix renders read-only.
   */
  const catalogRows = useMemo<MatrixRow[]>(() => {
    const bySubject = new Map<string, MatrixRow>();
    catalog?.permissions.forEach(({ subject, action }) => {
      const row = bySubject.get(subject) ?? { subject, byAction: {} };
      row.byAction[action as PermissionAction] = permissionKey(action, subject);
      bySubject.set(subject, row);
    });
    return [...bySubject.values()];
  }, [catalog]);

  const catalogSelected = useMemo(
    () => new Set(catalogRows.flatMap((row) => Object.values(row.byAction))),
    [catalogRows]
  );

  const subjectCount = catalogRows.length;

  return (
    <>
      <Stack gap="1.5rem">
        <PageHeader
          title="Access Control"
          subtitle="The platform permission catalog and default role templates, and the syncs that push them to organizations"
        />

        {/* Sync actions */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="1rem">
          <SyncCard
            title="Permission catalog"
            body="Seeds any permission that exists in code but is missing from an organization. Existing rows are left untouched, so it's safe to re-run."
            count={
              catalogLoading ? undefined : `${catalog?.total ?? 0} permissions`
            }
            actionLabel="Sync to all organizations"
            isPending={syncPermissions.isPending}
            onClick={() => setPendingSync('permissions')}
          />
          <SyncCard
            title="Default roles"
            body="Re-creates the system roles from the templates below and resets their permission sets to match. Custom roles created by an organization are never touched."
            count={
              templatesLoading
                ? undefined
                : `${templates?.total ?? 0} templates`
            }
            actionLabel="Push to all organizations"
            isPending={syncRoles.isPending}
            onClick={() => setPendingSync('roles')}
          />
        </SimpleGrid>

        {/* Default role templates */}
        <Panel
          title="Default role templates"
          subtitle="Seeded into every organization as system roles — read-only for tenants"
        >
          {templatesLoading ? (
            <Skeleton height="12rem" rounded="md" bg="gray.50" />
          ) : (
            <Stack gap="1rem">
              {templates?.roles.map((role) => (
                <RoleTemplateRow key={role.name} role={role} />
              ))}
            </Stack>
          )}
        </Panel>

        {/* Catalog matrix */}
        <Panel
          title="Permission catalog"
          subtitle={
            catalogLoading
              ? 'Loading…'
              : `${subjectCount} subjects × ${PERMISSION_ACTIONS.length} actions — defined in backend code, read-only here`
          }
        >
          {catalogLoading ? (
            <Skeleton height="18rem" rounded="md" bg="gray.50" />
          ) : (
            <PermissionMatrix rows={catalogRows} selected={catalogSelected} />
          )}
        </Panel>
      </Stack>

      <ConsentDialog
        open={pendingSync === 'permissions'}
        onOpenChange={({ open }) => !open && setPendingSync(null)}
        variant="warning"
        heading="Sync the permission catalog to every organization?"
        note="Missing permissions are created for each organization. Nothing is deleted or overwritten."
        confirmText="Yes, Sync"
        cancelText="Cancel"
        isLoading={syncPermissions.isPending}
        handleSubmit={() =>
          syncPermissions.mutate(undefined, {
            onSuccess: () => setPendingSync(null),
          })
        }
      />

      <ConsentDialog
        open={pendingSync === 'roles'}
        onOpenChange={({ open }) => !open && setPendingSync(null)}
        variant="warning"
        heading="Push default roles to every organization?"
        note="System roles are re-created from the templates and their permissions reset to match. Custom roles are left untouched."
        confirmText="Yes, Push"
        cancelText="Cancel"
        isLoading={syncRoles.isPending}
        handleSubmit={() =>
          syncRoles.mutate(undefined, {
            onSuccess: () => setPendingSync(null),
          })
        }
      />
    </>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
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
      <Box px="1.25rem" py="1rem">
        {children}
      </Box>
    </Box>
  );
}

function SyncCard({
  title,
  body,
  count,
  actionLabel,
  isPending,
  onClick,
}: {
  title: string;
  body: string;
  count?: string;
  actionLabel: string;
  isPending: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded=".625rem"
      shadow="sm"
      p="1.25rem"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      gap="1rem"
    >
      <Box>
        <Flex justify="space-between" align="center" gap="2" mb=".375rem">
          <Text textStyle="default-bold" color="gray.500">
            {title}
          </Text>
          {count ? (
            <Badge
              bg="primary.50"
              color="primary.300"
              rounded="full"
              px=".625rem"
            >
              {count}
            </Badge>
          ) : (
            <Skeleton height="1.25rem" width="6rem" rounded="full" />
          )}
        </Flex>
        <Text textStyle="small-regular" color="gray.300">
          {body}
        </Text>
      </Box>
      <Button
        size="sm"
        alignSelf="flex-start"
        loading={isPending}
        onClick={onClick}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}

/** One default-role template, with what its matrix grants per subject. */
function RoleTemplateRow({ role }: { role: IDefaultRoleTemplate }) {
  const grantsEverything = role.permissions === '*';
  const entries = grantsEverything
    ? []
    : Object.entries(role.permissions as Record<string, string[] | '*'>);

  return (
    <Box borderWidth="1px" borderColor="gray.50" rounded=".5rem" p="1rem">
      <Flex justify="space-between" align="center" gap="3" wrap="wrap">
        <Box>
          <Text textStyle="small-semibold" color="gray.500">
            {pascalToCapitalized(role.name)}
          </Text>
          <Text textStyle="tiny-regular" color="gray.300" mt=".125rem">
            {role.description}
          </Text>
        </Box>
        {grantsEverything && (
          <Badge
            bg="success.50"
            color="success.300"
            rounded="full"
            px=".625rem"
          >
            Full access
          </Badge>
        )}
      </Flex>

      {!grantsEverything && entries.length > 0 && (
        <Box overflowX="auto" mt=".75rem" minW={0}>
          <Table.Root size="sm" minW="22rem">
            <Table.Body>
              {entries.map(([subject, actions]) => (
                <Table.Row key={subject}>
                  <Table.Cell w="45%" py=".375rem" borderColor="gray.50">
                    <Text textStyle="tiny-regular" color="gray.400">
                      {pascalToCapitalized(subject)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell py=".375rem" borderColor="gray.50">
                    <Flex gap="1" wrap="wrap">
                      {(actions === '*' ? PERMISSION_ACTIONS : actions).map(
                        (action) => (
                          <Text
                            key={action}
                            textStyle="tiny-regular"
                            color="gray.300"
                            bg="gray.50"
                            px=".375rem"
                            rounded="sm"
                          >
                            {action}
                          </Text>
                        )
                      )}
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  );
}
