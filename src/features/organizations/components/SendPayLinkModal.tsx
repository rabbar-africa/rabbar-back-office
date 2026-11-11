import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  SimpleGrid,
  Text,
  Textarea,
  chakra,
} from '@chakra-ui/react';
import moment from 'moment';
import { CustomInput, CustomSelect } from '@/components/input';
import { toaster } from '@/components/ui';
import { useClipboard } from '@/hooks/useClipboard';
import { isContactSalesTier } from '@/shared/constants/subscription';
import { formatAmount } from '@/utils/format-number';
import { useCreatePayLink, useGetPlans } from '../api/query';
import type {
  BillingInterval,
  CreatePayLinkPayload,
  ICreatedPayLink,
  IPlan,
  PayLinkReturn,
} from '../api/types';

interface SendPayLinkModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  orgId: string;
}

const WORKS_FOR = [
  { value: '3', label: '3 days' },
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
];

/**
 * Where the confirmation page points them first. It never redirects by
 * itself: it confirms the payment, then offers this button first.
 */
const RETURN_OPTIONS: Array<{ value: PayLinkReturn; label: string }> = [
  { value: 'WHATSAPP', label: 'WhatsApp (the Rabbar bot)' },
  { value: 'WEB', label: 'The web app (log in)' },
];

/** Plans a business can pay for at checkout: on sale and not free. */
const isPayable = (plan: IPlan) =>
  plan.isActive &&
  Number(plan.monthlyPrice) > 0 &&
  !isContactSalesTier(plan.tier);

const sellsAnnually = (plan?: IPlan) => Number(plan?.annualPrice ?? 0) > 0;

/**
 * Make a payment link for one plan and hand it over: for a business that
 * can't get through checkout itself (mostly WhatsApp users). They open it,
 * tap Pay and pay with Paystack without logging in; the plan switches on once
 * the payment is confirmed. The API refuses a link that could never be paid
 * (a downgrade mid-period, a promo code it won't take…) and says why.
 */
export function SendPayLinkModal({
  open,
  onOpenChange,
  orgId,
}: SendPayLinkModalProps) {
  const { data: plansData, isPending: plansLoading } = useGetPlans({
    enabled: open,
  });
  const plans = (plansData?.data ?? []).filter(isPayable);
  const createLink = useCreatePayLink();

  const [planTier, setPlanTier] = useState('');
  const [interval, setBillingInterval] = useState<BillingInterval>('MONTHLY');
  const [promoCode, setPromoCode] = useState('');
  const [days, setDays] = useState('7');
  // Most links go to people who work in the WhatsApp bot.
  const [returnTo, setReturnTo] = useState<PayLinkReturn>('WHATSAPP');
  const [error, setError] = useState('');
  const [made, setMade] = useState<ICreatedPayLink | null>(null);

  useEffect(() => {
    if (!open) {
      setPlanTier('');
      setBillingInterval('MONTHLY');
      setPromoCode('');
      setDays('7');
      setReturnTo('WHATSAPP');
      setError('');
      setMade(null);
      createLink.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedPlan = plans.find((plan) => plan.tier === planTier);
  const yearly = interval === 'ANNUAL' && sellsAnnually(selectedPlan);

  const priceLabel = (plan: IPlan) => {
    const monthly = `${formatAmount(Number(plan.monthlyPrice), plan.currency)}/month`;
    return sellsAnnually(plan)
      ? `${monthly} or ${formatAmount(Number(plan.annualPrice), plan.currency)}/year`
      : monthly;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTier) {
      setError('Choose the plan they are paying for');
      return;
    }
    const payload: CreatePayLinkPayload = {
      planTier,
      billingInterval: yearly ? 'ANNUAL' : 'MONTHLY',
      expiresInDays: Number(days),
      returnTo,
      ...(!yearly && promoCode.trim() ? { promoCode: promoCode.trim() } : {}),
    };
    createLink.mutate(
      { id: orgId, payload },
      { onSuccess: (response) => setMade(response.data) }
    );
  };

  return (
    <Dialog.Root
      placement="center"
      open={open}
      onOpenChange={onOpenChange}
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="34rem" p="2rem">
            <Dialog.Header p={0} mb="1.5rem" display="block">
              <Dialog.Title fontSize="1.25rem" fontWeight="600">
                {made ? 'Payment link ready' : 'Send payment link'}
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.300" mt="1">
                {made
                  ? 'Send them the message below. Nothing is charged until they open the link and pay.'
                  : 'For a business that can’t pay on its own. They pay by transfer, USSD or card without logging in, and the plan switches on once the payment comes through.'}
              </Text>
            </Dialog.Header>

            {made ? (
              <PayLinkResult
                link={made}
                onDone={() => onOpenChange({ open: false })}
              />
            ) : (
              <chakra.form onSubmit={handleSubmit} noValidate>
                <Dialog.Body p={0}>
                  <Flex direction="column" gap="1rem">
                    <CustomSelect
                      label="Plan"
                      placeholder="Select a plan"
                      loading={plansLoading}
                      options={plans.map((plan) => ({
                        label: `${plan.name} — ${priceLabel(plan)}`,
                        value: plan.tier,
                      }))}
                      value={planTier ? [planTier] : []}
                      onChange={(d: { value?: string[] }) => {
                        setPlanTier(d?.value?.[0] ?? '');
                        setError('');
                      }}
                      error={error}
                    />

                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="1rem">
                      <CustomSelect
                        label="Pays for"
                        options={[
                          { value: 'MONTHLY', label: '1 month' },
                          ...(sellsAnnually(selectedPlan)
                            ? [{ value: 'ANNUAL', label: '1 year' }]
                            : []),
                        ]}
                        value={[yearly ? 'ANNUAL' : 'MONTHLY']}
                        onChange={(d: { value?: string[] }) =>
                          setBillingInterval(
                            (d?.value?.[0] as BillingInterval) ?? 'MONTHLY'
                          )
                        }
                      />
                      <CustomSelect
                        label="Link works for"
                        options={WORKS_FOR}
                        value={[days]}
                        onChange={(d: { value?: string[] }) =>
                          setDays(d?.value?.[0] ?? '7')
                        }
                      />
                    </SimpleGrid>

                    <CustomSelect
                      label="After paying, send them to"
                      options={RETURN_OPTIONS}
                      value={[returnTo]}
                      onChange={(d: { value?: string[] }) =>
                        setReturnTo(
                          (d?.value?.[0] as PayLinkReturn) ?? 'WHATSAPP'
                        )
                      }
                    />

                    {!yearly && (
                      <CustomInput
                        label="Promo code"
                        inputProps={{
                          name: 'promoCode',
                          placeholder: 'Optional',
                          value: promoCode,
                          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                            setPromoCode(e.target.value.toUpperCase()),
                        }}
                      />
                    )}

                    {selectedPlan && (
                      <Box
                        bg="primary.50"
                        rounded=".5rem"
                        px=".75rem"
                        py=".625rem"
                      >
                        <Text textStyle="tiny-regular" color="primary.300">
                          {yearly
                            ? `A year of ${selectedPlan.name} for ${formatAmount(Number(selectedPlan.annualPrice), selectedPlan.currency)}. A year takes no promo code.`
                            : `A month of ${selectedPlan.name} for ${formatAmount(Number(selectedPlan.monthlyPrice), selectedPlan.currency)}, less any promo code.`}{' '}
                          The link works until{' '}
                          {moment()
                            .add(Number(days), 'days')
                            .format('DD MMM YYYY')}
                          , and stops once it is paid. The price is worked out
                          again when they pay. Once paid, the confirmation page
                          leads with{' '}
                          {returnTo === 'WHATSAPP'
                            ? '“Back to WhatsApp”, which opens the Rabbar bot with Menu typed in.'
                            : '“Log in” to the web app.'}
                        </Text>
                      </Box>
                    )}
                  </Flex>
                </Dialog.Body>

                <Dialog.Footer p={0} mt="2rem" gap=".75rem">
                  <Button
                    type="button"
                    variant="outlineSecondary"
                    onClick={() => onOpenChange({ open: false })}
                    disabled={createLink.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    bg="primary.500"
                    color="white"
                    _hover={{ bg: 'primary.600' }}
                    loading={createLink.isPending}
                    loadingText="Making link…"
                  >
                    Make link
                  </Button>
                </Dialog.Footer>
              </chakra.form>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

/** The link made: the message to send, and the ways to send it. */
function PayLinkResult({
  link,
  onDone,
}: {
  link: ICreatedPayLink;
  onDone: () => void;
}) {
  const { copy } = useClipboard();
  // copy() resolves to false when the browser refused.
  const copied = (what: string) => (result: unknown) =>
    toaster.create(
      result === false
        ? {
            description: `Couldn't copy the ${what.toLowerCase()}. Select it and copy it yourself.`,
            type: 'error',
          }
        : { description: `${what} copied`, type: 'success' }
    );
  const whatsapp = link.payer.whatsappNumber
    ? `https://wa.me/${link.payer.whatsappNumber}?text=${encodeURIComponent(link.shareText)}`
    : null;
  const period = link.billingInterval === 'ANNUAL' ? '1 year' : '1 month';

  return (
    <>
      <Flex direction="column" gap="1rem">
        <SimpleGrid columns={2} gap=".75rem 1.25rem">
          <Detail
            label="Plan"
            value={`${link.plan.name} · ${period}`}
            note={`After paying: ${
              link.returnTo === 'WEB' ? 'the web app' : 'back to WhatsApp'
            }`}
          />
          <Detail
            label="Amount now"
            value={formatAmount(link.amount, link.currency)}
            note={
              link.discountAmount > 0
                ? `${formatAmount(link.discountAmount, link.currency)} off${
                    link.promoDescription ? ` · ${link.promoDescription}` : ''
                  }`
                : undefined
            }
          />
          <Detail
            label="Works until"
            value={moment(link.expiresAt).format('DD MMM YYYY')}
          />
          <Detail
            label="Billed to"
            value={link.payer.email}
            note={
              link.payer.whatsappNumber
                ? `WhatsApp +${link.payer.whatsappNumber}`
                : undefined
            }
          />
        </SimpleGrid>

        <Box>
          <Text fontSize=".8125rem" color="gray.500" mb=".375rem">
            Message to send
          </Text>
          <Textarea
            readOnly
            rows={7}
            value={link.shareText}
            fontSize=".875rem"
            resize="none"
            onFocus={(e) => e.target.select()}
          />
        </Box>
      </Flex>

      <Flex mt="2rem" gap=".75rem" wrap="wrap" justify="flex-end">
        <Button
          variant="outline"
          onClick={() => copy(link.url).then(copied('Link'))}
        >
          Copy link only
        </Button>
        {whatsapp && (
          <Button asChild variant="outline">
            <a href={whatsapp} target="_blank" rel="noreferrer">
              Open in WhatsApp
            </a>
          </Button>
        )}
        <Button
          bg="primary.500"
          color="white"
          _hover={{ bg: 'primary.600' }}
          onClick={() => copy(link.shareText).then(copied('Message'))}
        >
          Copy message
        </Button>
        <Button variant="outlineSecondary" onClick={onDone}>
          Done
        </Button>
      </Flex>
    </>
  );
}

function Detail({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <Box minW={0}>
      <Text fontSize=".8125rem" color="gray.500">
        {label}
      </Text>
      <Text fontSize=".9375rem" fontWeight="500" truncate>
        {value}
      </Text>
      {note && (
        <Text textStyle="tiny-regular" color="gray.300">
          {note}
        </Text>
      )}
    </Box>
  );
}
