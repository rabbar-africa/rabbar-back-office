import type { ProductTypeDto, ItemStatusDto } from '@/shared/interface/item';

/**
 * Item shape returned by the back-office list endpoint. Differs from the
 * client-facing `Item`: `productType`/`status` are the uppercase DTO enums and
 * monetary values arrive as strings.
 */
export interface ApiItem {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  productType: ProductTypeDto;
  unit: string | null;
  rate: string;
  purchaseRate: string | null;
  status: ItemStatusDto;
  sellable: boolean;
  purchasable: boolean;
  trackInventory: boolean;
  createdAt: string;
  updatedAt: string;
}
