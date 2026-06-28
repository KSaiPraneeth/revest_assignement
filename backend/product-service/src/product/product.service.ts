import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductStatus } from './entities/product.entity';

@Injectable()
export class ProductService {
  private readonly products = new Map<string, Product>();

  create(dto: CreateProductDto): Product {
    const skuExists = [...this.products.values()].some(
      (product) => product.sku.toLowerCase() === dto.sku.toLowerCase(),
    );
    if (skuExists) {
      throw new BadRequestException(`SKU "${dto.sku}" already exists`);
    }

    const now = new Date();
    const product: Product = {
      id: randomUUID(),
      name: dto.name,
      sku: dto.sku,
      description: dto.description ?? '',
      price: dto.price,
      stock: dto.stock,
      category: dto.category,
      status: dto.status ?? ProductStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    this.products.set(product.id, product);
    return product;
  }

  findAll(category?: string, status?: ProductStatus): Product[] {
    return [...this.products.values()].filter((product) => {
      const categoryMatch = category ? product.category === category : true;
      const statusMatch = status ? product.status === status : true;
      return categoryMatch && statusMatch;
    });
  }

  findOne(id: string): Product {
    const product = this.products.get(id);
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  findByIds(ids: string[]): Product[] {
    return ids.map((id) => this.findOne(id));
  }

  update(id: string, dto: UpdateProductDto): Product {
    const existing = this.findOne(id);

    if (dto.sku && dto.sku !== existing.sku) {
      const skuExists = [...this.products.values()].some(
        (product) =>
          product.id !== id &&
          product.sku.toLowerCase() === dto.sku!.toLowerCase(),
      );
      if (skuExists) {
        throw new BadRequestException(`SKU "${dto.sku}" already exists`);
      }
    }

    const updated: Product = {
      ...existing,
      ...dto,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.findOne(id);
    this.products.delete(id);
  }

  reserveStock(productId: string, quantity: number): Product {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const product = this.findOne(productId);
    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException(
        `Product "${product.name}" is not available for ordering`,
      );
    }
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for product "${product.name}". Available: ${product.stock}`,
      );
    }

    product.stock -= quantity;
    product.updatedAt = new Date();
    this.products.set(productId, product);
    return product;
  }

  releaseStock(productId: string, quantity: number): Product {
    const product = this.findOne(productId);
    product.stock += quantity;
    product.updatedAt = new Date();
    this.products.set(productId, product);
    return product;
  }
}
