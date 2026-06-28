import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  buildPaginatedMeta,
  PaginatedResponseDto,
} from '../../../common/dto/pagination-query.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { AuditClient } from '../../../clients/audit-client/audit.client';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { ProductEntity } from '../entities/product.entity';
import { ProductsRepository } from '../repositories/products.repository';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly auditClient: AuditClient,
  ) {}

  async create(
    dto: CreateProductDto,
    actorId?: string,
    ip?: string,
  ): Promise<ProductEntity> {
    const existing = await this.productsRepository.findBySku(dto.sku);
    if (existing) {
      throw new BadRequestException(`SKU "${dto.sku}" already exists`);
    }

    const product = this.productsRepository.create({
      ...dto,
      description: dto.description ?? '',
      active: dto.active ?? true,
    });

    const saved = await this.productsRepository.save(product);
    this.logger.log(`Product created: ${saved.id} (${saved.sku})`);
    await this.auditClient.log({
      userId: actorId,
      action: 'PRODUCT_CREATE',
      entity: 'product',
      entityId: saved.id,
      metadata: { sku: saved.sku, name: saved.name },
    });
    return saved;
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ProductEntity>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] = await this.productsRepository.findAllPaginated(query);

    return {
      data,
      meta: buildPaginatedMeta(total, page, limit),
    };
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    actorId?: string,
    ip?: string,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);

    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.productsRepository.findBySku(dto.sku);
      if (existing) {
        throw new BadRequestException(`SKU "${dto.sku}" already exists`);
      }
    }

    Object.assign(product, dto);
    const updated = await this.productsRepository.save(product);
    this.logger.log(`Product updated: ${updated.id}`);
    await this.auditClient.log({
      userId: actorId,
      action: 'PRODUCT_UPDATE',
      entity: 'product',
      entityId: id,
      metadata: dto as Record<string, unknown>,
    });
    return updated;
  }

  async remove(id: string, actorId?: string, ip?: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    this.logger.log(`Product deleted: ${id}`);
    await this.auditClient.log({
      userId: actorId,
      action: 'PRODUCT_DELETE',
      entity: 'product',
      entityId: id,
    });
  }

  /** Used by Order Service via REST to validate and reserve stock */
  async reserveStock(
    productId: string,
    quantity: number,
  ): Promise<ProductEntity> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const product = await this.findOne(productId);

    if (!product.active) {
      throw new BadRequestException(
        `Product "${product.name}" is not available for ordering`,
      );
    }

    if (product.quantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
      );
    }

    const updated = await this.productsRepository.decrementQuantity(
      productId,
      quantity,
    );

    if (!updated) {
      throw new BadRequestException(
        `Unable to reserve stock for product "${product.name}"`,
      );
    }

    return updated;
  }

  async releaseStock(
    productId: string,
    quantity: number,
  ): Promise<ProductEntity> {
    await this.findOne(productId);
    const updated = await this.productsRepository.incrementQuantity(
      productId,
      quantity,
    );
    return updated!;
  }
}
