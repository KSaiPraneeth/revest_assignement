import { describe, expect, it } from 'vitest';
import { computeCartTotals } from '@/lib/cart-utils';
import { CartItem } from '@/types/cart';

describe('cart-utils', () => {
  it('computes item count and subtotal', () => {
    const items: CartItem[] = [
      {
        productId: 'p1',
        name: 'A',
        sku: 'SKU-A',
        price: 10,
        quantity: 2,
        maxQuantity: 5,
      },
      {
        productId: 'p2',
        name: 'B',
        sku: 'SKU-B',
        price: 25,
        quantity: 1,
        maxQuantity: 3,
      },
    ];

    expect(computeCartTotals(items)).toEqual({
      itemCount: 3,
      subtotal: 45,
    });
  });

  it('returns zero totals for empty cart', () => {
    expect(computeCartTotals([])).toEqual({ itemCount: 0, subtotal: 0 });
  });
});
