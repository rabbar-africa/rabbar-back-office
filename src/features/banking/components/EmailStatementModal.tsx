import { useEffect, useState } from 'react';
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import { isAxiosError } from 'axios';
import { CustomInput } from '@/components/input';
import type { StatementRange } from '@/shared/interface/banking';
import { useEmailStatement } from '../api';

interface EmailStatementModalProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  /** The organization's business email, shown as the default recipient. */
  businessEmail?: string | null;
  /** Omitted → the business statement. */
  accountId?: string;
  /** For the heading, e.g. "Cash". */
  accountLabel?: string;
  range: StatementRange;
}

/**
 * Emails the statement PDF to the organization. Left blank, it goes to the
 * business email (else the owner's) and reads as sent by Rabbar support; type
 * an address to send it elsewhere. A 502 means it didn't go out: offer a retry.
 */
export function EmailStatementModal({
  open,
  onClose,
  orgId,
  businessEmail,
  accountId,
  accountLabel,
  range,
}: EmailStatementModalProps) {
  const { mutateAsync, isPending } = useEmailStatement();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail('');
    setSentTo(null);
    setFailed(false);
  }, [open]);

  const send = async () => {
    setFailed(false);
    try {
      const response = await mutateAsync({
        orgId,
        accountId,
        payload: { ...range, ...(email.trim() ? { email: email.trim() } : {}) },
      });
      setSentTo(response.data.sentTo);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 502)
        setFailed(true);
    }
  };

  const title = accountId
    ? `Email ${accountLabel ? `${accountLabel} ` : ''}statement`
    : 'Email business statement';

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: isOpen }) => !isOpen && !isPending && onClose()}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="28rem" p="2rem" position="relative">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="4" right="4" size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Body p={0}>
              {sentTo ? (
                <Stack gap="4">
                  <Text fontSize="16px" fontWeight="600" color="gray.500">
                    Statement sent
                  </Text>
                  <Text fontSize="14px" color="gray.400">
                    Sent to {sentTo}
                  </Text>
                  <Flex justify="flex-end">
                    <Button
                      bg="primary.300"
                      color="white"
                      _hover={{ bg: 'primary.400' }}
                      onClick={onClose}
                    >
                      Done
                    </Button>
                  </Flex>
                </Stack>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void send();
                  }}
                >
                  <Stack gap="5">
                    <Stack gap="1">
                      <Text fontSize="16px" fontWeight="600" color="gray.500">
                        {title}
                      </Text>
                      <Text fontSize="13px" color="gray.300">
                        The PDF goes as an attachment, marked as sent by Rabbar
                        support.
                      </Text>
                    </Stack>
                    <CustomInput
                      label="Send to"
                      helperText={
                        businessEmail
                          ? `Leave blank to send to the business email, ${businessEmail}.`
                          : "Leave blank to send to the business email, or the owner's if there isn't one."
                      }
                      inputProps={{
                        name: 'email',
                        type: 'email',
                        value: email,
                        placeholder: businessEmail || 'Business email',
                        onChange: (event) => setEmail(event.target.value),
                      }}
                    />
                    {failed && (
                      <Text fontSize="13px" color="error.300">
                        The email didn&apos;t go out. Please try again.
                      </Text>
                    )}
                    <Flex gap="3" justify="flex-end">
                      <Button
                        variant="outlineSecondary"
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        bg="primary.300"
                        color="white"
                        _hover={{ bg: 'primary.400' }}
                        loading={isPending}
                        loadingText="Sending…"
                      >
                        {failed ? 'Try again' : 'Send'}
                      </Button>
                    </Flex>
                  </Stack>
                </form>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
