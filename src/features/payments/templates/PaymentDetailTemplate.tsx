import { Box, Button, Center, Flex, Text } from '@chakra-ui/react';
import { CaretLeft } from '@/assets/custom/CaretLeft';
import { usePaymentDetail } from '../components/payment-detail/usePaymentDetail';
import { PaymentReceipt } from '../components/payment-detail/PaymentReceipt';
import { PaymentDetailSkeleton } from '../components/payment-detail/PaymentDetailSkeleton';

export function PaymentDetailTemplate() {
  const {
    payment,
    organization,
    isLoading,
    isError,
    goBack,
    openOrganization,
    downloadPdf,
    isDownloading,
  } = usePaymentDetail();

  if (isLoading) return <PaymentDetailSkeleton />;

  if (isError || !payment) {
    return (
      <Center py="20" flexDirection="column" gap="3">
        <Text color="error.300">Payment not found.</Text>
        <Button size="sm" variant="outlineSecondary" onClick={goBack}>
          Back to payments
        </Button>
      </Center>
    );
  }

  return (
    <Box pb="3rem">
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        direction={{ base: 'column', sm: 'row' }}
        gap="3"
        mb="6"
      >
        <Flex align="center" gap="3">
          <Flex
            as="button"
            align="center"
            justify="center"
            boxSize="9"
            rounded="lg"
            borderWidth="1px"
            borderColor="gray.75"
            color="gray.400"
            bg="white"
            _hover={{ bg: 'gray.50' }}
            cursor="pointer"
            flexShrink={0}
            onClick={goBack}
            aria-label="Back to payments"
          >
            <CaretLeft boxSize="1rem" />
          </Flex>
          <Box>
            <Text textStyle="h3-bold" color="gray.500">
              {payment.paymentNumber || 'Payment'}
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="0.5">
              Payment receipt
              {organization?.name ? ` · ${organization.name}` : ''}
            </Text>
          </Box>
        </Flex>

        <Flex gap="2" wrap="wrap">
          <Button size="sm" variant="outline" onClick={openOrganization}>
            Open organization
          </Button>
          <Button
            size="sm"
            bg="primary.500"
            color="white"
            _hover={{ bg: 'primary.600' }}
            loading={isDownloading}
            loadingText="Preparing…"
            onClick={downloadPdf}
          >
            Download PDF
          </Button>
        </Flex>
      </Flex>

      <PaymentReceipt payment={payment} organization={organization} />
    </Box>
  );
}
