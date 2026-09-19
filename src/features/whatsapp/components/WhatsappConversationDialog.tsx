import { Fragment, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Spinner,
  Text,
} from '@chakra-ui/react';
import moment from 'moment';
import Status from '@/components/common/Status';
import type { IWhatsappEvent } from '@/shared/interface/whatsapp';
import { useGetWhatsappConversation } from '../api';
import {
  formatDay,
  whatTheySent,
  whatsappOutcomeLabel,
  whoName,
  whoSubtitle,
} from '../data';

interface WhatsappConversationDialogProps {
  /** The number whose chat to show; null closes the dialog. */
  phone: string | null;
  onClose: () => void;
}

/** One number's conversation with the bot, read like a chat. */
export function WhatsappConversationDialog({
  phone,
  onClose,
}: WhatsappConversationDialogProps) {
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetWhatsappConversation(phone ?? '', Boolean(phone));

  // Page 0 is the newest slice; later pages are older. Each page is already
  // oldest-first, so reversing the pages gives one continuous timeline.
  const messages = useMemo(
    () => [...(data?.pages ?? [])].reverse().flatMap((p) => p.data.messages),
    [data]
  );
  const latest = data?.pages[0]?.data;

  // Open at the newest message; keep the reader's place when older ones load.
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousHeight = useRef(0);
  const pageCount = data?.pages.length ?? 0;
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || pageCount === 0) return;
    el.scrollTop =
      pageCount === 1
        ? el.scrollHeight
        : el.scrollTop + (el.scrollHeight - previousHeight.current);
    previousHeight.current = el.scrollHeight;
  }, [pageCount, phone]);

  const loadEarlier = () => {
    previousHeight.current = scrollRef.current?.scrollHeight ?? 0;
    fetchNextPage();
  };

  return (
    <Dialog.Root
      placement="center"
      open={Boolean(phone)}
      onOpenChange={({ open }) => !open && onClose()}
      motionPreset="slide-in-bottom"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="40rem" p="0" overflow="hidden">
            <Dialog.Header
              px="1.5rem"
              py="1.125rem"
              borderBottomWidth="1px"
              borderColor="gray.75"
              display="block"
            >
              <Dialog.Title fontSize="1.125rem" fontWeight="600">
                {whoName(latest?.who, phone ?? '')}
              </Dialog.Title>
              <Text textStyle="small-regular" color="gray.300" mt="2px">
                {[
                  whoSubtitle(latest?.who, phone ?? '') || phone,
                  latest?.organization?.name,
                  latest && !latest.who?.userId ? 'Not linked' : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size="sm"
                  position="absolute"
                  top=".875rem"
                  right=".875rem"
                />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            {/* Dialog.Body is the direct flex child, so inside-scroll works. */}
            <Dialog.Body
              ref={scrollRef}
              px="1.5rem"
              py="1.25rem"
              bg="gray.50"
              minH="16rem"
            >
              {isPending ? (
                <Flex justify="center" py="4rem">
                  <Spinner color="primary.300" />
                </Flex>
              ) : isError ? (
                <Text color="error.300" textAlign="center" py="3rem">
                  Couldn't load this conversation.
                </Text>
              ) : messages.length === 0 ? (
                <Text color="gray.300" textAlign="center" py="3rem">
                  No messages from this number.
                </Text>
              ) : (
                <Flex direction="column" gap="1rem">
                  {hasNextPage && (
                    <Button
                      size="xs"
                      variant="outline"
                      alignSelf="center"
                      loading={isFetchingNextPage}
                      onClick={loadEarlier}
                    >
                      Load earlier messages
                    </Button>
                  )}
                  {messages.map((message, index) => {
                    const previous = messages[index - 1];
                    const newDay =
                      !previous ||
                      !moment(previous.at).isSame(message.at, 'day');
                    return (
                      <Fragment key={message.id}>
                        {newDay && <DaySeparator iso={message.at} />}
                        <Exchange event={message} />
                      </Fragment>
                    );
                  })}
                </Flex>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function DaySeparator({ iso }: { iso: string }) {
  return (
    <Text
      alignSelf="center"
      textStyle="tiny-regular"
      color="gray.300"
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="full"
      px=".75rem"
      py="2px"
    >
      {formatDay(iso)}
    </Text>
  );
}

/** What the person sent, what it amounted to, and what the bot said back. */
function Exchange({ event }: { event: IWhatsappEvent }) {
  const sent = whatTheySent(event);
  const didSomething = event.actions.length > 0;
  const failed = event.outcome === 'failed';
  const time = moment(event.at).format('HH:mm');

  return (
    <Flex direction="column" gap=".375rem">
      <Bubble side="left" time={time}>
        {sent || (
          <Text as="span" fontStyle="italic" color="gray.300">
            Sent something without text
          </Text>
        )}
      </Bubble>

      <Flex align="center" gap=".5rem" pl=".25rem" wrap="wrap">
        <Text
          fontSize="11px"
          color={
            failed ? 'error.300' : didSomething ? 'success.300' : 'gray.300'
          }
          fontWeight={didSomething || failed ? '600' : '400'}
        >
          {event.summary}
        </Text>
        {event.outcome !== 'handled' && (
          <Status
            name={whatsappOutcomeLabel(event.outcome)}
            px=".5rem"
            py="1px"
          />
        )}
      </Flex>

      {event.botReplied.map((reply, index) => (
        <Bubble key={index} side="right">
          {reply.text || `(${reply.type})`}
        </Bubble>
      ))}
    </Flex>
  );
}

function Bubble({
  side,
  time,
  children,
}: {
  side: 'left' | 'right';
  time?: string;
  children: React.ReactNode;
}) {
  const isBot = side === 'right';
  return (
    <Box
      alignSelf={isBot ? 'flex-end' : 'flex-start'}
      maxW="85%"
      bg={isBot ? 'primary.50' : 'white'}
      borderWidth="1px"
      borderColor={isBot ? 'primary.50' : 'gray.75'}
      rounded=".75rem"
      borderBottomLeftRadius={isBot ? '.75rem' : '.25rem'}
      borderBottomRightRadius={isBot ? '.25rem' : '.75rem'}
      px=".875rem"
      py=".5rem"
    >
      {isBot && (
        <Text fontSize="10px" color="primary.300" fontWeight="600" mb="2px">
          Bot
        </Text>
      )}
      <Text
        fontSize="13px"
        color="gray.500"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
      >
        {children}
      </Text>
      {time && (
        <Text fontSize="10px" color="gray.300" textAlign="right" mt="2px">
          {time}
        </Text>
      )}
    </Box>
  );
}
