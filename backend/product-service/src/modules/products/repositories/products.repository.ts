import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ProductEntity } from '../entities/product.entity';

export interface ProductFindAllOptions extends PaginationQueryDto {}

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  create(data: Partial<ProductEntity>): ProductEntity {
    return this.repository.create(data);
  }

  save(product: ProductEntity): Promise<ProductEntity> {
    return this.repository.save(product);
  }

  findById(id: string): Promise<ProductEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  findBySku(sku: string): Promise<ProductEntity | null> {
    return this.repository.findOne({ where: { sku } });
  }

  async findAllPaginated(
    options: ProductFindAllOptions,
  ): Promise<[ProductEntity[], number]> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.repository.createQueryBuilder('product');

    if (options.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.category ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options.category) {
      qb.andWhere('product.category = :category', {
        category: options.category,
      });
    }

    if (options.active !== undefined) {
      qb.andWhere('product.active = :active', { active: options.active });
    }

    qb.orderBy('product.createdAt', 'DESC').skip(skip).take(limit);

    return qb.getManyAndCount();
  }

  async remove(product: ProductEntity): Promise<void> {
    await this.repository.remove(product);
  }

  async decrementQuantity(
    id: string,
    quantity: number,
  ): Promise<ProductEntity | null> {
    const result = await this.repository
      .createQueryBuilder()
      .update(ProductEntity)
      .set({ quantity: () => `quantity - ${quantity}` })
      .where('id = :id AND quantity >= :quantity AND active = true', {
        id,
        quantity,
      })
      .returning('*')
      .execute();

    if (!result.affected) {
      return null;
    }

    return this.findById(id);
  }

  async incrementQuantity(
    id: string,
    quantity: number,
  ): Promise<ProductEntity | null> {
    await this.repository
      .createQueryBuilder()
      .update(ProductEntity)
      .set({ quantity: () => `quantity + ${quantity}` })
      .where('id = :id', { id })
      .execute();

    return this.findById(id);
  }
}
