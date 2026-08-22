import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  Flex,
  Portal,
  Skeleton,
  Text,
  chakra,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CustomInput, CustomTextArea } from '@/components/input';
import type { IRole } from '@/shared/interface/access';
import {
  useCreateOrgRoleMutation,
  useGetOrgPermissionsGroupedQuery,
  useUpdateOrgRoleMutation,
} from '../api';
import { PermissionMatrix, toMatrixRows } from './PermissionMatrix';

const schema = Yup.object({
  name: Yup.string()
    .required('Role name is required')
    .matches(
      /^[a-z0-9_]+$/,
      'Use lowercase letters, numbers and underscores only'
    ),
});

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  orgId: string;
  /** Null creates a new role. */
  role: IRole | null;
}

/**
 * Create or edit a custom role and its permission set in one pass.
 *
 * Update sends `permissionIds` alongside the name/description — the backend's
 * update clears and re-creates the role's permissions when that field is
 * present, so a single call covers both.
 */
export function RoleFormModal({
  open,
  onOpenChange,
  orgId,
  role,
}: RoleFormModalProps) {
  const { data, isLoading } = useGetOrgPermissionsGroupedQuery(orgId, {
    enabled: open && Boolean(orgId),
  });

  const createRole = useCreateOrgRoleMutation(orgId);
  const updateRole = useUpdateOrgRoleMutation(orgId);
  const isPending = createRole.isPending || updateRole.isPending;

  const rows = useMemo(() => toMatrixRows(data?.data ?? []), [data?.data]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Reset the grid whenever the dialog opens onto a different role.
  useEffect(() => {
    if (!open) return;
    setSelected(
      new Set(role?.rolePermissions?.map((rp) => rp.permissionId) ?? [])
    );
  }, [open, role]);

  const toggle = (ids: string[], granted: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (granted ? next.add(id) : next.delete(id)));
      return next;
    });

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: schema,
    validateOnChange: false,
    initialValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
    },
    onSubmit: (values) => {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        permissionIds: [...selected],
      };

      const onSuccess = () => {
        formik.resetForm();
        setSelected(new Set());
        onOpenChange({ open: false });
      };

      if (role) {
        updateRole.mutate({ roleId: role.id, payload }, { onSuccess });
      } else {
        createRole.mutate(payload, { onSuccess });
      }
    },
  });

  return (
    <Dialog.Root
      placement="center"
      open={open}
      onOpenChange={onOpenChange}
      motionPreset="slide-in-bottom"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="46rem" p="2rem">
            <Dialog.Header p={0} mb="1.5rem">
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                {role ? `Edit “${role.name}”` : 'New Role'}
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.300" mt="1">
                Permissions are platform-defined — tick the ones this role
                should grant.
              </Text>
            </Dialog.Header>

            <chakra.form onSubmit={formik.handleSubmit}>
              <Dialog.Body p={0}>
                <Flex direction="column" gap="1rem">
                  <CustomInput
                    label="Role name"
                    placeholder="e.g. workshop_supervisor"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.errors.name}
                    helperText="Lowercase, underscores instead of spaces."
                  />
                  <CustomTextArea
                    label="Description"
                    placeholder="What this role is for"
                    name="description"
                    rows={2}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                  />

                  <Flex justify="space-between" align="center" mt=".5rem">
                    <Text textStyle="small-semibold" color="gray.500">
                      Permissions
                    </Text>
                    <Text textStyle="tiny-regular" color="gray.300">
                      {selected.size} selected
                    </Text>
                  </Flex>

                  {isLoading ? (
                    <Skeleton height="14rem" rounded="md" bg="gray.50" />
                  ) : (
                    <PermissionMatrix
                      rows={rows}
                      selected={selected}
                      onToggle={toggle}
                    />
                  )}
                </Flex>
              </Dialog.Body>

              <Dialog.Footer p={0} mt="1.5rem" gap="3">
                <Button
                  type="button"
                  variant="outlineSecondary"
                  onClick={() => onOpenChange({ open: false })}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isPending}>
                  {role ? 'Save changes' : 'Create role'}
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
