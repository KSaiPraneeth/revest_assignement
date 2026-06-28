import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditClient } from '../../../clients/audit-client/audit.client';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductEntity } from '../entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductsRepository>;

  const mockProduct: ProductEntity = {
    id: 'uuid-1',
    name: 'Test Product',
    sku: 'SKU-001',
    description: 'Desc',
    category: 'Hardware',
    quantity: 10,
    price: 99.99,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      findBySku: jest.fn(),
      create: jest.fn().mockReturnValue(mockProduct),
      save: jest.fn().mockResolvedValue(mockProduct),
      findById: jest.fn(),
      findAllPaginated: jest.fn(),
      remove: jest.fn(),
      decrementQuantity: jest.fn(),
      incrementQuantity: jest.fn(),
    } as unknown as jest.Mocked<ProductsRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: repository },
        { provide: AuditClient, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('creates a product when SKU is unique', async () => {
    repository.findBySku.mockResolvedValue(null);

    const result = await service.create({
      name: 'Test Product',
      sku: 'SKU-001',
      category: 'Hardware',
      quantity: 10,
      price: 99.99,
    });

    expect(result).toEqual(mockProduct);
    expect(repository.save).toHaveBeenCalled();
  });

  it('throws when SKU already exists', async () => {
    repository.findBySku.mockResolvedValue(mockProduct);

    await expect(
      service.create({
        name: 'Duplicate',
        sku: 'SKU-001',
        category: 'Hardware',
        quantity: 1,
        price: 10,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException when product missing', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      'Product with id "missing-id" not found',
    );
  });

  it('reserves stock when quantity is available', async () => {
    repository.findById.mockResolvedValue({ ...mockProduct, quantity: 10 });
    repository.decrementQuantity.mockResolvedValue({
      ...mockProduct,
      quantity: 8,
    });

    const result = await service.reserveStock('uuid-1', 2);

    expect(repository.decrementQuantity).toHaveBeenCalledWith('uuid-1', 2);
    expect(result.quantity).toBe(8);
  });

  it('rejects reserve when stock is insufficient', async () => {
    repository.findById.mockResolvedValue({ ...mockProduct, quantity: 1 });

    await expect(service.reserveStock('uuid-1', 5)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects reserve for inactive products', async () => {
    repository.findById.mockResolvedValue({ ...mockProduct, active: false });

    await expect(service.reserveStock('uuid-1', 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('releases stock back to inventory', async () => {
    repository.findById.mockResolvedValue(mockProduct);
    repository.incrementQuantity.mockResolvedValue({
      ...mockProduct,
      quantity: 12,
    });

    const result = await service.releaseStock('uuid-1', 2);

    expect(repository.incrementQuantity).toHaveBeenCalledWith('uuid-1', 2);
    expect(result.quantity).toBe(12);
  });
});
