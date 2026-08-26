/**
 * The slim organization stamp the back office's cross-tenant list endpoints
 * attach to every row (`ORG_SELECT` on the backend), so a list spanning all
 * organizations can show which one each record belongs to.
 */
export interface IOrgRef {
  id: string;
  name: string;
  slug: string;
}
