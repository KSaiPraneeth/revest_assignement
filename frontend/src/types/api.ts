export const API = {
  auth: process.env.NEXT_PUBLIC_AUTH_API ?? 'http://localhost:3004',
  products: process.env.NEXT_PUBLIC_PRODUCT_API ?? 'http://localhost:3001',
  orders: process.env.NEXT_PUBLIC_ORDER_API ?? 'http://localhost:3003',
};

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  gender?: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  active: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  products: OrderItem[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
