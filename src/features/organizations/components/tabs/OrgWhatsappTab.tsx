import { useParams } from 'react-router-dom';
import { WhatsappActivityPanel } from '@/features/whatsapp/components/WhatsappActivityPanel';

/** What this organization's people are doing on the WhatsApp bot. */
export function OrgWhatsappTab() {
  const { id } = useParams<{ id: string }>();
  return <WhatsappActivityPanel organizationId={id} />;
}
