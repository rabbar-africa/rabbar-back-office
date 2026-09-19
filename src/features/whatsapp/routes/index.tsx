import { lazyImport } from '@/utils/lazyImports';
import { type RouteObject } from 'react-router-dom';
import { RouteConstants } from '@/shared/constants/routes';

const { Whatsapp } = lazyImport(() => import('../pages/Whatsapp'), 'Whatsapp');

export const WhatsappRoutes: RouteObject[] = [
  {
    path: RouteConstants.whatsapp.base.path,
    element: <Whatsapp />,
  },
];
