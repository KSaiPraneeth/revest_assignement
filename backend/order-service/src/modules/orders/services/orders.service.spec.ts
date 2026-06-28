import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../../../common/interfaces/auth.interface';
import { AuditClient } from '../../../clients/audit-client/audit.client';
import { ProductClient } from '../../../clients/product-client/product.client';
import { OrderStatus } from '../entities/order.entity';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: jest.Mocked<OrdersRepository>;
  let productClient: jest.Mocked<ProductClient>;

  const user = {
    id: 'user-1',
    email: 'buyer@example.com',
    role: UserRole.USER,
    fullName: 'Buyer User',
  };

  const admin = { ...user, id: 'admin-1', role: UserRole.ADMIN };

  const savedOrder = {
    id: 'order-1',
    userId: user.id,
    customerName: user.fullName,
    customerEmail: user.email,
    totalAmount: 200,
    status: OrderStatus.CONFIRMED,
    createdAt: new Date(),
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Widget',
        quantity: 2,
        unitPrice: 100,
      },
    ],
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn((data) => data),
      save: jest.fn().mockResolvedValue(savedOrder),
      findById: jest.fn().mockResolvedValue(savedOrder),
      findAllPaginated: jest.fn().mockResolvedValue([[savedOrder], 1]),
      remove: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepository>;

    productClient = {
      getProduct: jest.fn().mockResolvedValue({
        id: 'prod-1',
        name: 'Widget',
        price: 100,
        quantity: 10,
      }),
      reserveStock: jest.fn().mockResolvedValue({ id: 'prod-1', quantity: 8 }),
      releaseStock: jest.fn(),
    } as unknown as jest.Mocked<ProductClient>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: repository },
        { provide: ProductClient, useValue: productClient },
        { provide: AuditClient, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  it('creates order with reserved products', async () => {
    const result = await service.create(user, {
      items: [{ productId: 'prod-1', quantity: 2 }],
    });

    expect(productClient.getProduct).toHaveBeenCalledWith('prod-1');
    expect(productClient.reserveStock).toHaveBeenCalledWith('prod-1', 2);
    expect(result.totalAmount).toBe(200);
    expect(result.products).toHaveLength(1);
  });

  it('rolls back stock when reservation fails mid-order', async () => {
    productClient.reserveStock
      .mockResolvedValueOnce({ id: 'prod-1' } as never)
      .mockRejectedValueOnce(new Error('stock failed'));

    await expect(
      service.create(user, {
        items: [
          { productId: 'prod-1', quantity: 1 },
          { productId: 'prod-2', quantity: 1 },
        ],
      }),
    ).rejects.toThrow('stock failed');

    expect(productClient.releaseStock).toHaveBeenCalledWith('prod-1', 1);
  });

  it('scopes order list to current user', async () => {
    await service.findAll(user, { page: 1, limit: 10 });

    expect(repository.findAllPaginated).toHaveBeenCalledWith(
      expect.any(Object),
      user.id,
    );
  });

  it('allows admin to list all orders', async () => {
    await service.findAll(admin, { page: 1, limit: 10 });

    expect(repository.findAllPaginated).toHaveBeenCalledWith(
      expect.any(Object),
      undefined,
    );
  });

  it('denies non-owner access to order details', async () => {
    repository.findById.mockResolvedValue({
      ...savedOrder,
      userId: 'other-user',
    } as never);

    await expect(service.findOne(user, 'order-1')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws when order not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne(user, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('prevents regular users from updating order status', async () => {
    await expect(
      service.update(user, 'order-1', { status: OrderStatus.SHIPPED }),
    ).rejects.toThrow(ForbiddenException);
  });
});
