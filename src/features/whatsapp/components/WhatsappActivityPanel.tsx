import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useUrlState } from '@/hooks/useUrlState';
import { WHATSAPP_VIEWS } from '../data';
import { WhatsappActivityFeed } from './WhatsappActivityFeed';
import { WhatsappPeopleList } from './WhatsappPeopleList';
import { WhatsappConversationDialog } from './WhatsappConversationDialog';

const VIEW_SCHEMA = {
  view: { defaultValue: 'activity' },
  // The open conversation lives in the URL so a chat can be linked to.
  chat: { defaultValue: '' },
};

interface WhatsappActivityPanelProps {
  /** Scope everything to one organization. Omit for the whole platform. */
  organizationId?: string;
}

/**
 * The WhatsApp bot from an admin's side: the activity feed, who is using it,
 * and any one number's conversation.
 */
export function WhatsappActivityPanel({
  organizationId,
}: WhatsappActivityPanelProps) {
  const [{ view, chat }, setState] = useUrlState(VIEW_SCHEMA, {
    replace: true,
    prefix: 'wa_',
  });
  const openConversation = (phone: string) => setState({ chat: phone });

  return (
    <Box
      pt={{ base: '1.25rem', md: '1.5rem' }}
      pb={{ base: '1.25rem', md: '2rem' }}
      bg="white"
      px={{ base: '0.75rem', md: '1rem' }}
      rounded=".625rem"
      shadow="sm"
      borderWidth="1px"
      borderColor="gray.75"
    >
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="3"
        mb="1.25rem"
      >
        <Box>
          <Text
            textStyle={{ base: 'default-bold', md: 'large-bold' }}
            color="gray.500"
          >
            WhatsApp Activity
          </Text>
          <Text textStyle="small-regular" color="gray.300">
            {view === 'people'
              ? 'Who is using the bot and what they got done. Click a row to read their chat.'
              : 'Every message the bot received, newest first. Click a row to read the chat.'}
          </Text>
        </Box>

        <Flex
          bg="gray.50"
          borderWidth="1px"
          borderColor="gray.75"
          rounded=".5rem"
          p="3px"
          gap="3px"
          flexShrink={0}
        >
          {WHATSAPP_VIEWS.map((option) => {
            const active = view === option.value;
            return (
              <Button
                key={option.value}
                size="xs"
                px=".875rem"
                variant="ghost"
                bg={active ? 'white' : 'transparent'}
                color={active ? 'primary.300' : 'gray.400'}
                fontWeight={active ? '600' : '400'}
                shadow={active ? 'sm' : 'none'}
                _hover={{ bg: active ? 'white' : 'gray.75' }}
                aria-pressed={active}
                onClick={() => setState({ view: option.value })}
              >
                {option.label}
              </Button>
            );
          })}
        </Flex>
      </Flex>

      {view === 'people' ? (
        <WhatsappPeopleList
          organizationId={organizationId}
          onOpenConversation={openConversation}
        />
      ) : (
        <WhatsappActivityFeed
          organizationId={organizationId}
          onOpenConversation={openConversation}
        />
      )}

      <WhatsappConversationDialog
        phone={chat || null}
        onClose={() => setState({ chat: '' })}
      />
    </Box>
  );
}
