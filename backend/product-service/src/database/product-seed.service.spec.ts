import { Test, TestingModule } from '@nestjs/testing';
import {
  DEPRECATED_SEED_SKUS,
  PRODUCT_SEED_CATALOG,
} from './product-seed.data';
import { ProductSeedService } from './product-seed.service';
import { ProductsRepository } from '../modules/products/repositories/products.repository';

describe('ProductSeedService', () => {
  let service: ProductSeedService;
  let repository: jest.Mocked<ProductsRepository>;

  beforeEach(async () => {
    repository = {
      findBySku: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (product) => ({ ...product, id: 'new-id' })),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ProductsRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSeedService,
        { provide: ProductsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(ProductSeedService);
  });

  it('inserts only products whose SKU is not already in the database', async () => {
    repository.findBySku.mockImplementation(async (sku: string) =>
      sku === PRODUCT_SEED_CATALOG[0].sku ? ({ id: '1', sku } as never) : null,
    );

    const inserted = await service.seedIfMissing();

    expect(inserted).toBe(PRODUCT_SEED_CATALOG.length - 1);
    expect(repository.save).toHaveBeenCalledTimes(PRODUCT_SEED_CATALOG.length - 1);
  });

  it('skips seeding when all default SKUs already exist', async () => {
    repository.findBySku.mockResolvedValue({ id: '1' } as never);

    const inserted = await service.seedIfMissing();

    expect(inserted).toBe(0);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('removes deprecated legacy seed products', async () => {
    repository.findBySku.mockImplementation(async (sku: string) =>
      DEPRECATED_SEED_SKUS.includes(sku)
        ? ({ id: sku, sku } as never)
        : null,
    );

    const removed = await service.removeDeprecatedProducts();

    expect(removed).toBe(DEPRECATED_SEED_SKUS.length);
    expect(repository.remove).toHaveBeenCalledTimes(DEPRECATED_SEED_SKUS.length);
  });
});
