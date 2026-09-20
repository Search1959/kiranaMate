import { Product } from '../types';

/**
 * Loose product-name matching so "Amoxicillin 500 mg", "amoxicillin-500mg" and
 * "500mg Amoxicillin" all land on the same stock item instead of creating
 * near-duplicates when a bill or spreadsheet is imported.
 */
export function normalizeProductName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/(\d)\s+(mg|mcg|g|kg|ml|l|ltr|gm|pcs|pc|tab|cap)\b/g, '$1$2') // "500 mg" -> "500mg"
    .replace(/[^a-z0-9ऀ-ॿঀ-৿]+/g, ' ') // punctuation/spacing (keeps Hindi/Bengali letters)
    .trim();
}

function tokenKey(name: string): string {
  return normalizeProductName(name).split(' ').filter(Boolean).sort().join(' ');
}

export type MatchKind = 'exact' | 'similar';

/** Finds the existing product an incoming row most likely refers to. */
export function findMatchingProduct(
  products: Product[],
  name: string,
  barcode?: string
): { product: Product; kind: MatchKind } | null {
  const cleanName = (name || '').trim().toLowerCase();
  if (!cleanName && !barcode) return null;

  if (barcode) {
    const byCode = products.find(p => p.barcode && p.barcode === barcode);
    if (byCode) return { product: byCode, kind: 'exact' };
  }
  const exact = products.find(p => p.name.trim().toLowerCase() === cleanName);
  if (exact) return { product: exact, kind: 'exact' };

  const norm = normalizeProductName(name);
  if (!norm) return null;
  const key = tokenKey(name);
  const similar = products.find(p => normalizeProductName(p.name) === norm || tokenKey(p.name) === key);
  return similar ? { product: similar, kind: 'similar' } : null;
}
