'use client';

import { computeCartTotals } from '@/lib/cart-utils';
import { CartItem, CartTotals } from '@/types/cart';
import { Product } from '@/types/api';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '@/providers/AuthProvider';

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getQuantityInCart: (productId: string) => number;
  syncStock: (products: Product[]) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function cartStorageKey(userId: string) {
  return `revest_cart_${userId}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setItems([]);
      return;
    }

    try {
      const raw = localStorage.getItem(cartStorageKey(user.id));
      setItems(raw ? (JSON.parse(raw) as CartItem[]) : []);
    } catch {
      setItems([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(cartStorageKey(user.id), JSON.stringify(items));
  }, [items, user?.id]);

  const addItem = useCallback((product: Product, quantity: number) => {
    if (quantity < 1 || product.quantity < 1) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      const maxQty = product.quantity;

      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxQty);
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: nextQty, maxQuantity: maxQty, price: Number(product.price) }
            : i,
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: Number(product.price),
          quantity: Math.min(quantity, maxQty),
          maxQuantity: maxQty,
          category: product.category,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity < 1) {
        return prev.filter((i) => i.productId !== productId);
      }
      return prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
          : i,
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getQuantityInCart = useCallback(
    (productId: string) =>
      items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items],
  );

  const syncStock = useCallback((products: Product[]) => {
    const stockMap = new Map(products.map((p) => [p.id, p]));
    setItems((prev) =>
      prev
        .map((item) => {
          const product = stockMap.get(item.productId);
          if (!product || product.quantity < 1) return null;
          return {
            ...item,
            name: product.name,
            price: Number(product.price),
            maxQuantity: product.quantity,
            quantity: Math.min(item.quantity, product.quantity),
          };
        })
        .filter(Boolean) as CartItem[],
    );
  }, []);

  const totals = useMemo(() => computeCartTotals(items), [items]);

  const value = useMemo(
    () => ({
      items,
      totals,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getQuantityInCart,
      syncStock,
    }),
    [
      items,
      totals,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getQuantityInCart,
      syncStock,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
