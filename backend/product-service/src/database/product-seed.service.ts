import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DEPRECATED_SEED_SKUS,
  PRODUCT_SEED_CATALOG,
} from './product-seed.data';
import { ProductsRepository } from '../modules/products/repositories/products.repository';

@Injectable()
export class ProductSeedService implements OnModuleInit {
  private readonly logger = new Logger(ProductSeedService.name);

  constructor(private readonly productsRepository: ProductsRepository) {}

  async onModuleInit(): Promise<void> {
    await this.syncCatalog();
  }

  async syncCatalog(): Promise<{ inserted: number; removed: number }> {
    const removed = await this.removeDeprecatedProducts();
    const inserted = await this.seedIfMissing();
    return { inserted, removed };
  }

  async removeDeprecatedProducts(): Promise<number> {
    let removed = 0;

    for (const sku of DEPRECATED_SEED_SKUS) {
      const existing = await this.productsRepository.findBySku(sku);
      if (!existing) {
        continue;
      }

      await this.productsRepository.remove(existing);
      removed += 1;
      this.logger.log(`Removed deprecated seed product: ${sku}`);
    }

    return removed;
  }

  async seedIfMissing(): Promise<number> {
    let inserted = 0;

    for (const seed of PRODUCT_SEED_CATALOG) {
      const existing = await this.productsRepository.findBySku(seed.sku);
      if (existing) {
        continue;
      }

      await this.productsRepository.save(
        this.productsRepository.create({
          name: seed.name,
          sku: seed.sku,
          description: seed.description,
          category: seed.category,
          quantity: seed.quantity,
          price: seed.price,
          active: seed.active,
        }),
      );

      inserted += 1;
      this.logger.log(`Seeded product: ${seed.sku} — ${seed.name}`);
    }

    if (inserted > 0) {
      this.logger.log(`Catalog seed complete: ${inserted} product(s) added`);
    } else {
      this.logger.log('Catalog seed skipped: all default products already exist');
    }

    return inserted;
  }
}
