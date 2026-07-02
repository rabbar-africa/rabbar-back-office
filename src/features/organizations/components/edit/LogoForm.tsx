import { useState } from 'react';
import { Avatar, Button, Flex, Text } from '@chakra-ui/react';
import { CustomFileInput } from '@/components/common/CustomFileInput';
import type { IOrganization } from '@/shared/interface/common';
import { useUpdateOrganizationLogo } from '../../api/query';
import { EditSection } from './EditSection';

interface LogoFormProps {
  id: string;
  org?: IOrganization;
}

export function LogoForm({ id, org }: LogoFormProps) {
  const { mutate: updateLogo, isPending } = useUpdateOrganizationLogo();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  };

  const handleUpload = () => {
    if (!file) return;
    updateLogo(
      { id, file },
      {
        onSuccess: () => {
          setFile(null);
          setPreview(null);
        },
      }
    );
  };

  return (
    <EditSection
      title="Organization Logo"
      subtitle="Shown on the organization profile and on generated documents."
    >
      <Flex align="center" gap="1.5rem" wrap="wrap">
        <Avatar.Root
          shape="rounded"
          size="2xl"
          border="1px solid"
          borderColor="gray.75"
          bg="gray.50"
        >
          <Avatar.Fallback name={org?.name || 'Org'} />
          <Avatar.Image
            src={preview || org?.logoUrl || ''}
            alt={`${org?.name || 'organization'} logo`}
          />
        </Avatar.Root>

        <Flex direction="column" gap=".75rem" flex="1" minW="16rem">
          <CustomFileInput
            label="Upload new logo"
            helperText="PNG, JPG or SVG. Square images work best."
            inputProps={{ accept: 'image/*', onChange: handleFileChange }}
          />
          {file && (
            <Text fontSize=".75rem" color="gray.400">
              Selected: {file.name}
            </Text>
          )}
        </Flex>
      </Flex>

      <Flex justify="flex-end" mt="1.5rem">
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          disabled={!file}
          loading={isPending}
          loadingText="Uploading…"
          onClick={handleUpload}
        >
          Update Logo
        </Button>
      </Flex>
    </EditSection>
  );
}
