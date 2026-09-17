import { useState } from 'react';
import ConsentDialog from '@/components/common/ConsentDialog';
import type { IPromoCode } from '@/shared/interface/promo-code';
import { useSetPromoCodeActive } from '../api';

/**
 * Quick activate/deactivate. Deactivating the code that is auto-applied to
 * new signups asks first, since signups silently stop getting a promo.
 * Render `dialog` once wherever the hook is used.
 */
export function usePromoActiveToggle() {
  const setActive = useSetPromoCodeActive();
  const [pending, setPending] = useState<IPromoCode | null>(null);

  const toggle = (promo: IPromoCode) => {
    if (promo.isActive && promo.autoApplyOnSignup) {
      setPending(promo);
      return;
    }
    setActive.mutate({ id: promo.id, isActive: !promo.isActive });
  };

  const dialog = (
    <ConsentDialog
      open={Boolean(pending)}
      onOpenChange={({ open }) => !open && setPending(null)}
      variant="warning"
      heading={`Deactivate ${pending?.code ?? 'this code'}?`}
      note="This code is applied automatically to every new signup. Once it's deactivated, new organizations sign up without a promo until another code has auto-apply turned on."
      confirmText="Yes, Deactivate"
      cancelText="Keep Active"
      isLoading={setActive.isPending}
      handleSubmit={() =>
        pending &&
        setActive.mutate(
          { id: pending.id, isActive: false },
          { onSuccess: () => setPending(null) }
        )
      }
    />
  );

  return {
    toggle,
    dialog,
    /** Id of the code currently being switched, for button spinners. */
    togglingId: setActive.isPending ? setActive.variables?.id : undefined,
  };
}
