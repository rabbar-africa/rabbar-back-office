import { Box, Stack, Tabs } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { PageHeader } from '@/components/common/PageHeader';
import { TabsTrigger } from '@/components/common/Tabs';
import { useUrlState } from '@/hooks/useUrlState';
import { WHATSAPP_PAGE_TABS } from '../data';
import { ACTIVITY_FILTER_SCHEMA } from '../components/WhatsappActivityFeed';
import { WhatsappActivityFeed } from '../components/WhatsappActivityFeed';
import { WhatsappPeopleList } from '../components/WhatsappPeopleList';
import { WhatsappConversationDialog } from '../components/WhatsappConversationDialog';
import {
  WhatsappOverview,
  type WhatsappDrillDown,
} from '../components/WhatsappOverview';

const PAGE_SCHEMA = {
  tab: { defaultValue: 'overview' },
  // The open conversation lives in the URL so a chat can be linked to.
  chat: { defaultValue: '' },
};

const FEED_PREFIX = 'wa_';
const toDateInput = (iso?: string) =>
  iso ? moment(iso).format('YYYY-MM-DD') : '';

/** Platform-wide view of the WhatsApp bot: numbers, the feed, and the people. */
export function WhatsappTemplate() {
  const [{ tab, chat }, setPage] = useUrlState(PAGE_SCHEMA, {
    replace: true,
    prefix: FEED_PREFIX,
  });
  const [, setSearchParams] = useSearchParams();

  /** Open the feed showing exactly the slice that was clicked on the overview. */
  const drillDown = (target: WhatsappDrillDown) =>
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        // Start from a clean feed so old filters don't hide the slice.
        Object.keys(ACTIVITY_FILTER_SCHEMA).forEach((key) =>
          next.delete(`${FEED_PREFIX}${key}`)
        );
        const set = (key: string, value?: string) =>
          value && next.set(`${FEED_PREFIX}${key}`, value);
        set('tab', 'activity');
        set('outcome', target.outcome);
        set('flow', target.flow);
        set('org', target.organization?.id);
        set('orgName', target.organization?.name);
        set('from', toDateInput(target.from));
        set('to', toDateInput(target.to));
        return next;
      },
      { replace: false }
    );

  const openConversation = (phone: string) => setPage({ chat: phone });

  return (
    <Stack gap="6" pb="3rem">
      <PageHeader
        title="WhatsApp Bot"
        subtitle="Who is using the bot, what they get done, where they get stuck, and what it costs"
      />

      <Tabs.Root
        value={tab}
        onValueChange={(e) => setPage({ tab: e.value })}
        variant="plain"
      >
        <Tabs.List
          bg="white"
          rounded="md"
          p="1"
          gap="1"
          border="1px solid #EBEBEB"
          overflowX="auto"
          w="fit-content"
          maxW="100%"
        >
          {WHATSAPP_PAGE_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs.List>

        <Box mt="1.5rem">
          <Tabs.Content value="overview">
            {tab === 'overview' && <WhatsappOverview onDrillDown={drillDown} />}
          </Tabs.Content>
          <Tabs.Content value="activity">
            {tab === 'activity' && (
              <Panel>
                <WhatsappActivityFeed onOpenConversation={openConversation} />
              </Panel>
            )}
          </Tabs.Content>
          <Tabs.Content value="people">
            {tab === 'people' && (
              <Panel>
                <WhatsappPeopleList onOpenConversation={openConversation} />
              </Panel>
            )}
          </Tabs.Content>
        </Box>
      </Tabs.Root>

      <WhatsappConversationDialog
        phone={chat || null}
        onClose={() => setPage({ chat: '' })}
      />
    </Stack>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <Box
      py={{ base: '1.25rem', md: '1.5rem' }}
      px={{ base: '0.75rem', md: '1rem' }}
      bg="white"
      rounded=".625rem"
      shadow="sm"
      borderWidth="1px"
      borderColor="gray.75"
    >
      {children}
    </Box>
  );
}
