import { Box, Flex, Grid, Image, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { formatMoney } from '@/hooks/useFormatMoney';
import { RouteConstants } from '@/shared/constants/routes';
import type { IOrganization } from '@/shared/interface/common';
import type { IPaymentReceived } from '@/shared/interface/payment';
import { formatAddress } from '@/utils/string-formatter';
import {
  PAYMENT_MODE_LABELS,
  formatReceiptDate,
  outstandingAfter,
  receivedFromName,
  ribbonFor,
  toNum,
  type RibbonKind,
} from './receipt-format';

const RIBBON_BG: Record<RibbonKind, string> = {
  paid: '#1fcd6d',
  refunded: 'error.300',
  failed: 'error.300',
  draft: 'gray.300',
};

interface PaymentReceiptProps {
  payment: IPaymentReceived;
  /** The payment's own organization — its letterhead, not the admin's. */
  organization?: IOrganization;
}

/** The receipt as the organization's customer sees it. */
export function PaymentReceipt({ payment, organization }: PaymentReceiptProps) {
  const currencyCode = payment.currencyCode || organization?.currency;
  const money = (n: number) => formatMoney(n, { currencyCode });

  const orgAddress = formatAddress(organization?.primaryAddress);
  const orgLocation = [organization?.city, organization?.country]
    .filter(Boolean)
    .join(', ');

  const allocations = payment.allocations ?? [];
  const ribbon = ribbonFor(payment.status);

  return (
    <Box
      position="relative"
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      shadow="sm"
      maxW="860px"
      mx="auto"
      w="100%"
      overflow="hidden"
      px={{ base: '6', md: '12' }}
      py={{ base: '8', md: '12' }}
    >
      {/* Status ribbon */}
      <Box
        position="absolute"
        top="20px"
        left="-34px"
        transform="rotate(-45deg)"
        bg={RIBBON_BG[ribbon.kind]}
        color="white"
        px="12"
        py="1"
        fontSize="11px"
        fontWeight="700"
        letterSpacing="0.5px"
        textAlign="center"
        boxShadow="sm"
      >
        {ribbon.label}
      </Box>

      {/* Organization letterhead */}
      <Flex gap="6" align="flex-start" mb="10">
        {organization?.logoUrl ? (
          <Image
            src={organization.logoUrl}
            alt={organization.name}
            maxH="96px"
            maxW="150px"
            objectFit="contain"
          />
        ) : (
          <Flex
            boxSize="96px"
            bg="primary.500"
            rounded="md"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Text fontSize="lg" color="white" fontWeight="700">
              {organization?.name?.[0] ?? 'R'}
            </Text>
          </Flex>
        )}
        <Stack gap="1" pt="1">
          <Text fontSize="20px" fontWeight="700" color="gray.500">
            {organization?.name ?? '—'}
          </Text>
          {(orgAddress || orgLocation) && (
            <Text fontSize="12px" color="gray.300" whiteSpace="pre-line">
              {orgAddress || orgLocation}
            </Text>
          )}
          {(organization?.companyEmail || organization?.email) && (
            <Text fontSize="12px" color="gray.300">
              {organization?.companyEmail || organization?.email}
            </Text>
          )}
        </Stack>
      </Flex>

      <Box borderTopWidth="1px" borderColor="gray.75" pt="8">
        <Text
          textAlign="center"
          fontSize="15px"
          letterSpacing="2px"
          color="gray.400"
          fontWeight="500"
          mb="8"
        >
          PAYMENT RECEIPT
        </Text>

        {/* Details + amount box */}
        <Grid
          templateColumns={{ base: '1fr', md: '1.4fr 1fr' }}
          gap="8"
          mb="10"
        >
          <Stack gap="0">
            <DetailRow label="Receipt #" value={payment.paymentNumber || '—'} />
            <DetailRow
              label="Payment Date"
              value={formatReceiptDate(payment.date)}
            />
            <DetailRow
              label="Payment Mode"
              value={PAYMENT_MODE_LABELS[payment.mode] ?? payment.mode}
            />
            <DetailRow
              label="Outstanding Balance"
              value={money(outstandingAfter(payment))}
              last
            />
          </Stack>

          <Flex
            bg="success.200"
            rounded="sm"
            direction="column"
            align="center"
            justify="center"
            py={{ base: '6', md: '12' }}
            px="4"
            h="fit-content"
          >
            <Text fontSize="14px" color="white" opacity={0.9} mb="1">
              Amount Received
            </Text>
            <Text fontSize="24px" fontWeight="700" color="white">
              {money(toNum(payment.amount))}
            </Text>
          </Flex>
        </Grid>

        {/* Received from */}
        <Stack gap="1" mb="10">
          <Text fontSize="12px" color="gray.400">
            Received From
          </Text>
          <Text fontSize="16px" fontWeight="700" color="primary.300">
            {receivedFromName(payment)}
          </Text>
        </Stack>

        {/* Payment for */}
        {allocations.length > 0 && (
          <Box>
            <Text fontSize="15px" fontWeight="700" color="gray.500" mb="3">
              Payment for
            </Text>
            <Box overflowX="auto">
              <Box
                borderWidth="1px"
                borderColor="gray.75"
                rounded="lg"
                overflow="hidden"
                minW="34rem"
              >
                <Grid
                  templateColumns="1.2fr 1fr 1fr 1fr"
                  bg="gray.50"
                  px="4"
                  py="2.5"
                  gap="3"
                >
                  {[
                    'Invoice Number',
                    'Invoice Date',
                    'Invoice Amount',
                    'Payment Amount',
                  ].map((h, i) => (
                    <Text
                      key={h}
                      fontSize="11px"
                      fontWeight="600"
                      color="gray.400"
                      textAlign={i >= 2 ? 'right' : 'left'}
                    >
                      {h}
                    </Text>
                  ))}
                </Grid>
                {allocations.map((a) => (
                  <Grid
                    key={a.id}
                    templateColumns="1.2fr 1fr 1fr 1fr"
                    px="4"
                    py="3"
                    gap="3"
                    borderTopWidth="1px"
                    borderColor="gray.75"
                    alignItems="center"
                  >
                    {a.invoiceId ? (
                      <Link
                        to={RouteConstants.invoices.detail.generate({
                          id: a.invoiceId,
                        })}
                      >
                        <Text
                          fontSize="14px"
                          fontWeight="600"
                          color="primary.300"
                          _hover={{ textDecoration: 'underline' }}
                        >
                          {a.invoice?.invoiceNumber ?? '—'}
                        </Text>
                      </Link>
                    ) : (
                      <Text fontSize="14px" fontWeight="600" color="gray.500">
                        {a.invoice?.invoiceNumber ?? '—'}
                      </Text>
                    )}
                    <Text fontSize="14px" color="gray.400">
                      {formatReceiptDate(a.invoice?.date)}
                    </Text>
                    <Text fontSize="14px" color="gray.500" textAlign="right">
                      {money(toNum(a.invoice?.total))}
                    </Text>
                    <Text
                      fontSize="14px"
                      fontWeight="600"
                      color="gray.500"
                      textAlign="right"
                    >
                      {money(toNum(a.amountApplied))}
                    </Text>
                  </Grid>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Notes */}
        {payment.notes && (
          <Box mt="8">
            <Text fontSize="12px" fontWeight="600" color="gray.400" mb="1.5">
              Notes
            </Text>
            <Text
              fontSize="14px"
              color="gray.400"
              whiteSpace="pre-line"
              lineHeight="1.6"
            >
              {payment.notes}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <Flex
      justify="space-between"
      align="center"
      gap="6"
      py="3"
      borderBottomWidth={last ? '0' : '1px'}
      borderColor="gray.75"
    >
      <Text fontSize="14px" color="gray.300">
        {label}
      </Text>
      <Text fontSize="14px" fontWeight="600" color="gray.500" textAlign="right">
        {value}
      </Text>
    </Flex>
  );
}
