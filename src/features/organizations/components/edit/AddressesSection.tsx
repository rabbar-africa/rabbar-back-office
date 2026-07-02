import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { PlusIcon, MapPinLineIcon } from '@/assets/custom';
import { ActionButton } from '@/components/common/ActionButton';
import ConsentDialog from '@/components/common/ConsentDialog';
import { formatAddress } from '@/utils/string-formatter';
import type { IOrgAddress } from '@/shared/interface/settings';
import {
  useDeleteOrganizationAddress,
  useGetOrganizationAddresses,
  useSetPrimaryOrganizationAddress,
} from '../../api/query';
import { EditSection } from './EditSection';
import { AddressModal } from './AddressModal';

interface AddressesSectionProps {
  id: string;
}

export function AddressesSection({ id }: AddressesSectionProps) {
  const { data, isLoading } = useGetOrganizationAddresses(id);
  const addresses = data?.data ?? [];
  const { mutate: setPrimary, isPending: isSettingPrimary } =
    useSetPrimaryOrganizationAddress();
  const { mutate: deleteAddress, isPending: isDeleting } =
    useDeleteOrganizationAddress();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IOrgAddress | null>(null);
  const [deleting, setDeleting] = useState<IOrgAddress | null>(null);

  const confirmDelete = () => {
    if (!deleting) return;
    deleteAddress(
      { id, addressId: deleting.id },
      { onSuccess: () => setDeleting(null) }
    );
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (address: IOrgAddress) => {
    setEditing(address);
    setModalOpen(true);
  };

  return (
    <EditSection
      title="Addresses"
      subtitle="Billing, shipping, and office addresses for the organization."
      action={
        <ActionButton
          icon={PlusIcon}
          text="Add Address"
          size="sm"
          onClick={openCreate}
          iconProps={{ boxSize: '1rem' }}
        />
      }
    >
      {isLoading ? (
        <Center py="12">
          <Spinner color="primary.300" />
        </Center>
      ) : addresses.length === 0 ? (
        <Center py="12" flexDirection="column" gap="3">
          <Flex
            align="center"
            justify="center"
            boxSize="12"
            rounded="full"
            bg="gray.50"
            color="gray.300"
          >
            <MapPinLineIcon boxSize="1.5rem" />
          </Flex>
          <Text fontSize="14px" color="gray.400" fontWeight="500">
            No addresses yet
          </Text>
          <ActionButton
            icon={PlusIcon}
            text="Add Address"
            size="sm"
            variant="outline"
            onClick={openCreate}
            iconProps={{ boxSize: '1rem' }}
            mt="1"
          />
        </Center>
      ) : (
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap="4">
          {addresses.map((address) => (
            <Box
              key={address.id}
              borderWidth="1px"
              borderColor={address.isPrimary ? 'primary.100' : 'gray.75'}
              bg={address.isPrimary ? 'primary.50' : 'white'}
              rounded="lg"
              p="4"
            >
              <Flex align="center" gap="2" flexWrap="wrap" mb="2">
                <Text fontSize="14px" fontWeight="600" color="gray.500">
                  {address.label || 'Address'}
                </Text>
                <Badge
                  size="sm"
                  variant="subtle"
                  colorPalette="gray"
                  textTransform="capitalize"
                >
                  {address.type.toLowerCase()}
                </Badge>
                {address.isPrimary && (
                  <Badge size="sm" variant="solid" colorPalette="blue">
                    Primary
                  </Badge>
                )}
              </Flex>
              {address.attention && (
                <Text fontSize="12px" color="gray.400" mb="1">
                  Attn: {address.attention}
                </Text>
              )}
              <Text fontSize="13px" color="gray.400" lineHeight="1.6">
                {formatAddress(address)}
              </Text>
              {address.phone && (
                <Text fontSize="12px" color="gray.300" mt="1">
                  {address.phone}
                </Text>
              )}
              <Flex
                gap="2"
                mt="3"
                pt="3"
                borderTopWidth="1px"
                borderColor="gray.75"
              >
                {!address.isPrimary && (
                  <Button
                    size="xs"
                    variant="ghost"
                    color="primary.300"
                    loading={isSettingPrimary}
                    onClick={() => setPrimary({ id, addressId: address.id })}
                  >
                    Set as primary
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  onClick={() => openEdit(address)}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  color="error.300"
                  onClick={() => setDeleting(address)}
                  ml="auto"
                >
                  Remove
                </Button>
              </Flex>
            </Box>
          ))}
        </Grid>
      )}

      <AddressModal
        open={modalOpen}
        onOpenChange={({ open }) => setModalOpen(open)}
        orgId={id}
        address={editing}
      />

      <ConsentDialog
        open={!!deleting}
        onOpenChange={({ open }) => {
          if (!open) setDeleting(null);
        }}
        handleSubmit={confirmDelete}
        isLoading={isDeleting}
        heading="Delete this address?"
        note={
          deleting
            ? `"${deleting.label || formatAddress(deleting)}" will be permanently removed. This action cannot be undone.`
            : undefined
        }
      />
    </EditSection>
  );
}
