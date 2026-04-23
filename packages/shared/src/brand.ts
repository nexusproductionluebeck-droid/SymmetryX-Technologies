/**
 * SymmetryX / MAGNA-X brand formatting helpers.
 *
 * Rules:
 * - Normal body copy: "MagnaX"
 * - ALL CAPS contexts (eyebrows, overlines, badges): "MAGNA-X"
 *   (hyphenated to preserve the "X" as its own typographic element).
 */

export const BRAND = {
  productName: 'MagnaX',
  productNameCaps: 'MAGNA-X',
  companyName: 'SymmetryX Technologies',
  companyNameShort: 'SymmetryX',
} as const;

/**
 * Uppercase a string while keeping the brand rendering as "MAGNA-X"
 * (hyphenated) instead of the naive "MAGNAX" result.
 */
export function toCapsWithBrand(value: string): string {
  return value
    .toUpperCase()
    .replace(/MAGNAX/g, 'MAGNA-X');
}
