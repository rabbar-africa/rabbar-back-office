import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  SimpleGrid,
  Text,
  chakra,
} from '@chakra-ui/react';
import { WarningIcon } from '@/assets/custom';
import { CustomInput } from '@/components/input';
import { getErrorMessage } from '@/utils/handle-error';
import type {
  IOrganizationDeletionRequest,
  IOrganizationDeletionSummary,
} from '../api/types';
import {
  useConfirmOrganizationDeletion,
  useRequestOrganizationDeletion,
} from '../api/query';

/** Mirrors DELETION_REQUEST_COOLDOWN_SECONDS on the API. */
const RESEND_COOLDOWN_SECONDS = 60;

const SUMMARY_LABELS: Array<{
  key: keyof IOrganizationDeletionSummary;
  label: string;
}> = [
  { key: 'users', label: 'Users' },
  { key: 'customers', label: 'Customers' },
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'paymentsReceived', label: 'Payments received' },
  { key: 'jobCards', label: 'Job cards' },
  { key: 'inspections', label: 'Inspections' },
  { key: 'expenses', label: 'Expenses' },
];

/** Same comparison the API makes: case and extra spaces don't matter. */
const normalizeName = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLowerCase();

const errorText = (error: unknown) => {
  const message = getErrorMessage(error);
  if (Array.isArray(message)) return message.join('. ');
  return message ? String(message) : 'Something went wrong. Please try again.';
};

const statusOf = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status;

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

interface DeleteOrganizationModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  orgId: string;
  orgName: string;
  /** Called once the organization is gone. */
  onDeleted: () => void;
}

/**
 * Permanently delete an organization, in the API's two steps:
 *   1. request a 6-digit code, emailed to the admin who is signed in;
 *   2. enter that code and type the organization's exact name.
 */
export function DeleteOrganizationModal({
  open,
  onOpenChange,
  orgId,
  orgName,
  onDeleted,
}: DeleteOrganizationModalProps) {
  const requestDeletion = useRequestOrganizationDeletion();
  const confirmDeletion = useConfirmOrganizationDeletion();

  const [request, setRequest] = useState<IOrganizationDeletionRequest | null>(
    null
  );
  const [sentAt, setSentAt] = useState(0);
  const [otp, setOtp] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Start from scratch every time the dialog is reopened.
  useEffect(() => {
    if (open) return;
    setRequest(null);
    setOtp('');
    setConfirmName('');
    setError(null);
  }, [open]);

  // Tick once a second while a code is live, for the two countdowns.
  useEffect(() => {
    if (!open || !request) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [open, request]);

  const busy = requestDeletion.isPending || confirmDeletion.isPending;
  const expiresIn = request
    ? Math.max(
        0,
        Math.ceil((new Date(request.expiresAt).getTime() - now) / 1000)
      )
    : 0;
  const expired = Boolean(request) && expiresIn === 0;
  const resendIn = Math.max(
    0,
    Math.ceil((sentAt + RESEND_COOLDOWN_SECONDS * 1000 - now) / 1000)
  );

  const nameMatches =
    normalizeName(confirmName) === normalizeName(orgName) &&
    confirmName.trim() !== '';
  const canDelete = /^\d{6}$/.test(otp) && nameMatches && !expired;

  const sendCode = () => {
    setError(null);
    requestDeletion.mutate(orgId, {
      onSuccess: (response) => {
        setRequest(response.data);
        setSentAt(Date.now());
        setOtp('');
      },
      onError: (err) => setError(errorText(err)),
    });
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDelete) return;
    setError(null);
    confirmDeletion.mutate(
      { id: orgId, payload: { otp, confirmName: confirmName.trim() } },
      {
        onSuccess: () => {
          onOpenChange({ open: false });
          onDeleted();
        },
        onError: (err) => {
          setError(errorText(err));
          // Any failed attempt means retyping the code; 410 (expired) and
          // 403 (locked after too many tries) also need a fresh one.
          setOtp('');
          const status = statusOf(err);
          if (status === 410 || status === 403) setSentAt(0);
        },
      }
    );
  };

  return (
    <Dialog.Root
      placement="center"
      open={open}
      // Don't let a stray click abandon a delete that is already running.
      onOpenChange={(details) => !busy && onOpenChange(details)}
      motionPreset="slide-in-bottom"
      role="alertdialog"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="32rem" p="2rem">
            <Dialog.Header p={0} mb="1.25rem" display="block">
              <Flex
                w="3rem"
                h="3rem"
                rounded="full"
                bg="error.50"
                align="center"
                justify="center"
                mb="1rem"
              >
                <WarningIcon color="error.300" width="1.5rem" height="1.5rem" />
              </Flex>
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                Permanently delete {orgName}?
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.400" mt=".5rem">
                This removes the organization, its users and customers, and
                every record that belongs to it. It cannot be undone, and there
                is no backup to restore from.
              </Text>
            </Dialog.Header>

            {!request ? (
              <>
                <Dialog.Body p={0}>
                  <Text textStyle="small-regular" color="gray.400">
                    To continue, we'll email a 6-digit confirmation code to your
                    own address. You'll then enter that code and type the
                    organization's name. If you only want to stop this
                    organization using the app, deactivate it instead.
                  </Text>
                  {error && <ErrorNote>{error}</ErrorNote>}
                </Dialog.Body>
                <Dialog.Footer p={0} mt="2rem" gap=".75rem">
                  <Button
                    variant="outlineSecondary"
                    onClick={() => onOpenChange({ open: false })}
                    disabled={busy}
                  >
                    Cancel
                  </Button>
                  <Button
                    bg="error.300"
                    color="white"
                    _hover={{ bg: 'error.400' }}
                    loading={requestDeletion.isPending}
                    loadingText="Sending…"
                    onClick={sendCode}
                  >
                    Send confirmation code
                  </Button>
                </Dialog.Footer>
              </>
            ) : (
              <chakra.form onSubmit={handleDelete}>
                <Dialog.Body p={0}>
                  <Flex direction="column" gap="1.25rem">
                    <Box>
                      <Text
                        textStyle="tiny-semibold"
                        color="gray.300"
                        mb=".5rem"
                      >
                        This will be deleted
                      </Text>
                      <SimpleGrid
                        columns={{ base: 2, sm: 4 }}
                        gap=".5rem"
                        bg="error.50"
                        rounded=".5rem"
                        p=".75rem"
                      >
                        {SUMMARY_LABELS.map(({ key, label }) => (
                          <Box key={key}>
                            <Text
                              fontSize="1rem"
                              fontWeight="700"
                              color="error.300"
                            >
                              {(request.willDelete[key] ?? 0).toLocaleString()}
                            </Text>
                            <Text fontSize="11px" color="gray.400">
                              {label}
                            </Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>

                    <CustomInput
                      label="Confirmation code"
                      placeholder="6-digit code"
                      helperText={
                        expired
                          ? `The code sent to ${request.sentTo} has expired. Send a new one.`
                          : `Sent to ${request.sentTo}. Expires in ${formatCountdown(expiresIn)}.`
                      }
                      inputProps={{
                        name: 'otp',
                        value: otp,
                        autoComplete: 'one-time-code',
                        inputMode: 'numeric',
                        maxLength: 6,
                        letterSpacing: '0.3em',
                        onChange: (e) =>
                          setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)),
                      }}
                    />

                    <CustomInput
                      label={`Type "${orgName}" to confirm`}
                      placeholder={orgName}
                      inputProps={{
                        name: 'confirmName',
                        value: confirmName,
                        autoComplete: 'off',
                        onChange: (e) => setConfirmName(e.target.value),
                      }}
                    />

                    {error && <ErrorNote>{error}</ErrorNote>}
                  </Flex>
                </Dialog.Body>

                <Dialog.Footer
                  p={0}
                  mt="2rem"
                  gap=".75rem"
                  justifyContent="space-between"
                  flexWrap="wrap"
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    color="gray.400"
                    px="0"
                    disabled={resendIn > 0 || busy}
                    loading={requestDeletion.isPending}
                    onClick={sendCode}
                  >
                    {resendIn > 0
                      ? `Resend code in ${resendIn}s`
                      : 'Resend code'}
                  </Button>
                  <Flex gap=".75rem">
                    <Button
                      type="button"
                      variant="outlineSecondary"
                      onClick={() => onOpenChange({ open: false })}
                      disabled={busy}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      bg="error.300"
                      color="white"
                      _hover={{ bg: 'error.400' }}
                      disabled={!canDelete}
                      loading={confirmDeletion.isPending}
                      loadingText="Deleting…"
                    >
                      Delete permanently
                    </Button>
                  </Flex>
                </Dialog.Footer>
              </chakra.form>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <Box bg="error.50" rounded=".5rem" px=".75rem" py=".5rem" mt=".75rem">
      <Text textStyle="tiny-regular" color="error.300">
        {children}
      </Text>
    </Box>
  );
}
