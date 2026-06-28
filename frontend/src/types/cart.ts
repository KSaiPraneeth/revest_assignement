export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  category?: string;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
}
