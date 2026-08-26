import { Box, Checkbox, Flex, Table, Text } from '@chakra-ui/react';
import { pascalToCapitalized } from '@/utils/string-formatter';
import {
  PERMISSION_ACTIONS,
  type PermissionAction,
} from '@/shared/interface/access';

/** Key used everywhere to pair an action with a subject. */
export const permissionKey = (action: string, subject: string) =>
  `${action}:${subject}`;

export interface MatrixRow {
  subject: string;
  /** `action → permission id`. A missing action means the org has no such row. */
  byAction: Partial<Record<PermissionAction, string>>;
}

interface PermissionMatrixProps {
  rows: MatrixRow[];
  /** Currently granted permission ids. */
  selected: Set<string>;
  /** Omit to render read-only (system roles, catalog previews). */
  onToggle?: (permissionIds: string[], granted: boolean) => void;
  disabled?: boolean;
}

/**
 * Subject × action grid of permissions. The same grid backs the editor and the
 * read-only view — pass no `onToggle` for the latter, which is what system
 * roles get since the backend rejects edits to them.
 */
export function PermissionMatrix({
  rows,
  selected,
  onToggle,
  disabled,
}: PermissionMatrixProps) {
  const readOnly = !onToggle || disabled;

  const idsFor = (row: MatrixRow) =>
    PERMISSION_ACTIONS.map((action) => row.byAction[action]).filter(
      (id): id is string => Boolean(id)
    );

  const idsForAction = (action: PermissionAction) =>
    rows
      .map((row) => row.byAction[action])
      .filter((id): id is string => Boolean(id));

  const allSelected = (ids: string[]) =>
    ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = (ids: string[]) =>
    ids.some((id) => selected.has(id)) && !allSelected(ids);

  /** Tri-state for a bulk checkbox: checked / indeterminate / unchecked. */
  const bulkState = (ids: string[]) =>
    allSelected(ids) ? true : someSelected(ids) ? 'indeterminate' : false;

  const toggleMany = (ids: string[]) => {
    if (!onToggle || !ids.length) return;
    onToggle(ids, !allSelected(ids));
  };

  if (rows.length === 0) {
    return (
      <Text textStyle="small-regular" color="gray.300" py="4">
        No permissions found. Run a permission sync for this organization.
      </Text>
    );
  }

  return (
    <Box overflowX="auto" minW={0}>
      <Table.Root size="sm" minW="34rem">
        <Table.Header>
          <Table.Row bg="gray.50">
            <Table.ColumnHeader
              w="40%"
              fontSize="12px"
              color="gray.400"
              fontWeight="600"
            >
              Subject
            </Table.ColumnHeader>
            {PERMISSION_ACTIONS.map((action) => {
              const ids = idsForAction(action);
              return (
                <Table.ColumnHeader key={action} textAlign="center">
                  <Flex direction="column" align="center" gap="1">
                    <Text fontSize="12px" color="gray.400" fontWeight="600">
                      {pascalToCapitalized(action)}
                    </Text>
                    {!readOnly && (
                      <Checkbox.Root
                        size="sm"
                        checked={bulkState(ids)}
                        onCheckedChange={() => toggleMany(ids)}
                        aria-label={`Toggle ${action} on every subject`}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control rounded=".25rem" />
                      </Checkbox.Root>
                    )}
                  </Flex>
                </Table.ColumnHeader>
              );
            })}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {rows.map((row) => {
            const rowIds = idsFor(row);
            return (
              <Table.Row key={row.subject} _hover={{ bg: 'gray.50' }}>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    {!readOnly && (
                      <Checkbox.Root
                        size="sm"
                        checked={bulkState(rowIds)}
                        onCheckedChange={() => toggleMany(rowIds)}
                        aria-label={`Toggle every action on ${row.subject}`}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control rounded=".25rem" />
                      </Checkbox.Root>
                    )}
                    <Text textStyle="small-regular" color="gray.500">
                      {pascalToCapitalized(row.subject)}
                    </Text>
                  </Flex>
                </Table.Cell>

                {PERMISSION_ACTIONS.map((action) => {
                  const id = row.byAction[action];
                  return (
                    <Table.Cell key={action} textAlign="center">
                      {id ? (
                        <Checkbox.Root
                          size="sm"
                          checked={selected.has(id)}
                          disabled={readOnly}
                          onCheckedChange={() =>
                            onToggle?.([id], !selected.has(id))
                          }
                          aria-label={`${action} ${row.subject}`}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control rounded=".25rem" />
                        </Checkbox.Root>
                      ) : (
                        <Text textStyle="tiny-regular" color="gray.100">
                          —
                        </Text>
                      )}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

/** Fold the grouped-permissions response into matrix rows. */
export function toMatrixRows(
  groups: Array<{
    subject: string;
    permissions: Array<{ id: string; action: string }>;
  }>
): MatrixRow[] {
  return groups.map((group) => ({
    subject: group.subject,
    byAction: group.permissions.reduce<
      Partial<Record<PermissionAction, string>>
    >((acc, permission) => {
      acc[permission.action as PermissionAction] = permission.id;
      return acc;
    }, {}),
  }));
}
