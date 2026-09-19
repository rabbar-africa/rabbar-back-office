import type { ElementType } from 'react';
import {
  Box,
  Center,
  Flex,
  Icon,
  Menu,
  Portal,
  Tabs,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { TaskIcon } from '@/assets/custom/TasksIcon';
import { ClipboardTextIcon } from '@/assets/custom/ClipboardTextIcon';
import { FileTextIcon } from '@/assets/custom/FileTextIcon';
import { Money } from '@/assets/custom/Money';
import { CalendarDotsIcon } from '@/assets/custom/CalendarDotsIcon';
import { UsersIcon } from '@/assets/custom/UsersIcon';
import { ChatCircle } from '@/assets/custom/ChatCircle';
import { BriefCase } from '@/assets/custom/BriefCase';
import { ShieldIcon } from '@/assets/custom/ShieldIcon';
import { GearIcon } from '@/assets/custom/GearIcon';
import { ThreeDotsIcon } from '@/assets/custom/ThreeDotsIcon';
import { CaretRight } from '@/assets/custom/CaretRight';

interface OrgTab {
  value: string;
  label: string;
  icon: ElementType;
}

/**
 * In priority order: as many as fit sit on the bar, the rest go under "More".
 * Add a tab here and give it a Tabs.Content in OrganizationDetailsTemplate.
 */
export const ORG_DETAIL_TABS: OrgTab[] = [
  { value: 'invoices', label: 'Invoices', icon: FileTextIcon },
  { value: 'payments', label: 'Payments', icon: Money },
  { value: 'customers', label: 'Customers', icon: UsersIcon },
  { value: 'whatsapp', label: 'WhatsApp', icon: ChatCircle },
  { value: 'settings', label: 'Settings', icon: GearIcon },
  { value: 'inspections', label: 'Inspections', icon: TaskIcon },
  { value: 'job-cards', label: 'Job Cards', icon: ClipboardTextIcon },
  { value: 'subscription', label: 'Subscription', icon: CalendarDotsIcon },
  { value: 'items', label: 'Items', icon: BriefCase },
  { value: 'roles', label: 'Roles & Permissions', icon: ShieldIcon },
];

/** Page background, so the stuck bar hides content scrolling under it. */
const PAGE_BG = '#F7F7F7';

interface OrgDetailsTabBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * The organization page's section switcher. Must render inside a Tabs.Root.
 * Wide screens: evenly spaced tabs plus a "More" menu for the ones that
 * don't fit. Narrow screens: a single dropdown.
 */
export function OrgDetailsTabBar({ value, onChange }: OrgDetailsTabBarProps) {
  // How many tabs fit on the bar without squeezing, beside the sidebar.
  const primaryCount = useBreakpointValue({ base: 5, xl: 6, '2xl': 8 }) ?? 5;
  const primaryTabs = ORG_DETAIL_TABS.slice(0, primaryCount);
  const overflowTabs = ORG_DETAIL_TABS.slice(primaryCount);

  const active = ORG_DETAIL_TABS.find((t) => t.value === value);
  const activeOverflow = overflowTabs.find((t) => t.value === value);

  return (
    <>
      {/* Narrow screens: one dropdown instead of a row of tabs. */}
      <Box
        display={{ base: 'block', lg: 'none' }}
        position="sticky"
        top="0"
        zIndex="docked"
        bg={PAGE_BG}
        py=".25rem"
      >
        <Flex
          as="label"
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
          borderRadius=".625rem"
          px="1rem"
          py=".75rem"
          alignItems="center"
          gap=".625rem"
          position="relative"
        >
          {active && (
            <Icon as={active.icon} boxSize="1rem" color="primary.300" />
          )}
          <Text textStyle="small-semibold" color="gray.500" flex="1">
            {active?.label ?? 'Select a section'}
          </Text>
          <Icon
            as={CaretRight}
            boxSize=".75rem"
            color="gray.300"
            transform="rotate(90deg)"
          />
          <Box
            asChild
            position="absolute"
            inset="0"
            opacity={0}
            cursor="pointer"
          >
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              aria-label="Select section"
            >
              {ORG_DETAIL_TABS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Box>
        </Flex>
      </Box>

      {/* Wide screens: primary tabs + More. */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        position="sticky"
        top="0"
        zIndex="docked"
        bg={PAGE_BG}
        py=".25rem"
      >
        <Tabs.List
          display="flex"
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
          borderRadius=".75rem"
          height="4rem"
          alignItems="center"
          gap=".5rem"
          px=".5rem"
          justifyContent="space-between"
          // Last resort on an unusually narrow window: scroll, never wrap.
          overflowX="auto"
          css={{
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {primaryTabs.map((t) => (
            <Tabs.Trigger
              key={t.value}
              value={t.value}
              _selected={{
                bg: 'primary.50',
                color: 'primary.300',
                fontWeight: 600,
              }}
              _hover={{ bg: 'gray.50' }}
              _before={{ display: 'none' }}
              color="gray.300"
              rounded=".5rem"
              height="2.75rem"
              px=".75rem"
              flex="1"
              flexShrink={0}
              asChild
            >
              <Center gap=".5rem" whiteSpace="nowrap">
                <Icon
                  as={t.icon}
                  boxSize="1rem"
                  color="inherit"
                  display={{ base: 'none', xl: 'block' }}
                />
                <Text textStyle="small-semibold" color="inherit">
                  {t.label}
                </Text>
              </Center>
            </Tabs.Trigger>
          ))}

          {overflowTabs.length > 0 && (
            <Menu.Root positioning={{ placement: 'bottom-end' }}>
              <Menu.Trigger asChild>
                <Box
                  as="button"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap=".5rem"
                  height="2.75rem"
                  px="1rem"
                  rounded=".5rem"
                  cursor="pointer"
                  whiteSpace="nowrap"
                  flexShrink={0}
                  bg={activeOverflow ? 'primary.50' : 'transparent'}
                  color={activeOverflow ? 'primary.300' : 'gray.300'}
                  _hover={{ bg: activeOverflow ? 'primary.50' : 'gray.50' }}
                >
                  <Icon
                    as={activeOverflow?.icon ?? ThreeDotsIcon}
                    boxSize="1rem"
                    color="inherit"
                  />
                  <Text
                    textStyle="small-semibold"
                    color="inherit"
                    fontWeight={activeOverflow ? 600 : undefined}
                  >
                    {activeOverflow?.label ?? 'More'}
                  </Text>
                  <Icon
                    as={CaretRight}
                    boxSize=".625rem"
                    color="inherit"
                    transform="rotate(90deg)"
                  />
                </Box>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content minW="13rem">
                    {overflowTabs.map((t) => {
                      const isActive = t.value === value;
                      return (
                        <Menu.Item
                          key={t.value}
                          value={t.value}
                          gap=".625rem"
                          py=".5rem"
                          cursor="pointer"
                          bg={isActive ? 'primary.50' : undefined}
                          color={isActive ? 'primary.300' : 'gray.400'}
                          onSelect={() => onChange(t.value)}
                        >
                          <Icon as={t.icon} boxSize=".875rem" color="inherit" />
                          <Text textStyle="small-semibold" color="inherit">
                            {t.label}
                          </Text>
                        </Menu.Item>
                      );
                    })}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}
        </Tabs.List>
      </Box>
    </>
  );
}
