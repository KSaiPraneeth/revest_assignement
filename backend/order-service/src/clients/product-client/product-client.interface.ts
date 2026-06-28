export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface ProductSnapshot {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  active: boolean;
}
