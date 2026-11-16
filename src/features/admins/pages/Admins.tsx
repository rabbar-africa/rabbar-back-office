import { OwnersOnly } from '../components/OwnersOnly';
import { AdminsTemplate } from '../templates/AdminsTemplate';

/** Owners (super admins) only, like its sidebar item. */
export function Admins() {
  return (
    <OwnersOnly>
      <AdminsTemplate />
    </OwnersOnly>
  );
}
