import { useState } from 'react';
import {
  IconButton,
  Portal,
  Tooltip,
  type IconButtonProps,
} from '@chakra-ui/react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { ArrowClockwise } from '@/assets/custom/ArrowClockwise';

interface RefreshButtonProps extends Omit<
  IconButtonProps,
  'aria-label' | 'onClick' | 'children'
> {
  /**
   * Queries to reload. Each key is a prefix: `[customQueryKey.items.getAll]`
   * reloads every items list, `[key, orgId]` only that organization's.
   */
  queryKeys: QueryKey[];
  /** Tooltip and accessible name. */
  label?: string;
}

/**
 * Reloads data in place, without refreshing the page. Invalidates the given
 * queries, so whatever is on screen refetches and anything cached but hidden
 * refetches the next time it's shown.
 */
export function RefreshButton({
  queryKeys,
  label = 'Reload',
  ...props
}: RefreshButtonProps) {
  const queryClient = useQueryClient();
  const [reloading, setReloading] = useState(false);

  const reload = async () => {
    setReloading(true);
    try {
      // Resolves once the on-screen queries have refetched.
      await Promise.all(
        queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      );
    } finally {
      setReloading(false);
    }
  };

  return (
    <Tooltip.Root openDelay={300}>
      <Tooltip.Trigger asChild>
        <IconButton
          aria-label={label}
          size="sm"
          variant="outline"
          color="gray.400"
          borderColor="gray.75"
          bg="white"
          _hover={{ bg: 'gray.50', color: 'primary.300' }}
          flexShrink={0}
          alignSelf={{ base: 'flex-end', md: 'center' }}
          disabled={reloading}
          onClick={reload}
          {...props}
        >
          <ArrowClockwise
            boxSize="1rem"
            animation={reloading ? 'spin 0.8s linear infinite' : undefined}
          />
        </IconButton>
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content px=".625rem" py=".375rem" fontSize="12px">
            {reloading ? 'Reloading…' : label}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
