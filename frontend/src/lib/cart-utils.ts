import { CartItem, CartTotals } from '@/types/cart';

export function computeCartTotals(items: CartItem[]): CartTotals {
  return items.reduce(
    (acc, item) => ({
      itemCount: acc.itemCount + item.quantity,
      subtotal: acc.subtotal + item.price * item.quantity,
    }),
    { itemCount: 0, subtotal: 0 },
  );
}
