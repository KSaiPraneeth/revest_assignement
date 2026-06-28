import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { firstValueFrom, timeout } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  Order,
  OrderItem,
  OrderStatus,
  OrderWithProducts,
} from './entities/order.entity';
import { PRODUCT_SERVICE } from '../product-client/product-client.module';

interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: string;
}

@Injectable()
export class OrderService {
  private readonly orders = new Map<string, Order>();

  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productClient: ClientProxy,
  ) {}

  private async sendProductCommand<T>(
    pattern: { cmd: string },
    payload: unknown,
  ): Promise<T> {
    return firstValueFrom(
      this.productClient.send<T>(pattern, payload).pipe(timeout(5000)),
    );
  }

  async create(dto: CreateOrderDto): Promise<OrderWithProducts> {
    const reservedProducts: Array<{ productId: string; quantity: number }> =
      [];
    const orderItems: OrderItem[] = [];

    try {
      for (const item of dto.items) {
        const product = await this.sendProductCommand<ProductResponse>(
          { cmd: 'get_product' },
          { id: item.productId },
        );

        if (!product) {
          throw new NotFoundException(
            `Product with id "${item.productId}" not found`,
          );
        }

        await this.sendProductCommand<ProductResponse>(
          { cmd: 'reserve_stock' },
          { productId: item.productId, quantity: item.quantity },
        );

        reservedProducts.push({
          productId: item.productId,
          quantity: item.quantity,
        });

        const subtotal = product.price * item.quantity;
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        });
      }
    } catch (error) {
      await this.rollbackStock(reservedProducts);
      throw error;
    }

    const now = new Date();
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const order: Order = {
      id: randomUUID(),
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      shippingAddress: dto.shippingAddress,
      status: OrderStatus.CONFIRMED,
      items: orderItems,
      totalAmount,
      notes: dto.notes,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(order.id, order);
    return this.enrichOrderWithProducts(order);
  }

  async findAll(status?: OrderStatus): Promise<OrderWithProducts[]> {
    const orders = [...this.orders.values()].filter((order) =>
      status ? order.status === status : true,
    );
    return Promise.all(
      orders.map((order) => this.enrichOrderWithProducts(order)),
    );
  }

  async findOne(id: string): Promise<OrderWithProducts> {
    const order = this.orders.get(id);
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }
    return this.enrichOrderWithProducts(order);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderWithProducts> {
    const order = this.orders.get(id);
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    if (dto.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await this.sendProductCommand(
          { cmd: 'release_stock' },
          { productId: item.productId, quantity: item.quantity },
        );
      }
    }

    if (
      order.status === OrderStatus.CANCELLED &&
      dto.status &&
      dto.status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('Cancelled orders cannot be reactivated');
    }

    const updated: Order = {
      ...order,
      ...dto,
      updatedAt: new Date(),
    };
    this.orders.set(id, updated);
    return this.enrichOrderWithProducts(updated);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    if (order.status !== OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await this.sendProductCommand(
          { cmd: 'release_stock' },
          { productId: item.productId, quantity: item.quantity },
        );
      }
    }
    this.orders.delete(id);
  }

  private async enrichOrderWithProducts(
    order: Order,
  ): Promise<OrderWithProducts> {
    const productIds = order.items.map((item) => item.productId);
    const products = await this.sendProductCommand<ProductResponse[]>(
      { cmd: 'get_products_by_ids' },
      { ids: productIds },
    );

    return {
      ...order,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        category: product.category,
      })),
    };
  }

  private async rollbackStock(
    reserved: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    for (const item of reserved) {
      try {
        await this.sendProductCommand(
          { cmd: 'release_stock' },
          { productId: item.productId, quantity: item.quantity },
        );
      } catch {
        // Best-effort rollback
      }
    }
  }
}
