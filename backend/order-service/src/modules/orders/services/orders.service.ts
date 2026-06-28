import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RequestUser, UserRole } from '../../../common/interfaces/auth.interface';
import {
  buildPaginatedMeta,
  PaginatedResponseDto,
} from '../../../common/dto/pagination-query.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { AuditClient } from '../../../clients/audit-client/audit.client';
import { ProductClient } from '../../../clients/product-client/product.client';
import { CreateOrderDto, OrderListItemDto, UpdateOrderDto } from '../dto/order.dto';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderEntity, OrderStatus } from '../entities/order.entity';
import { OrdersRepository } from '../repositories/orders.repository';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productClient: ProductClient,
    private readonly auditClient: AuditClient,
  ) {}

  async create(user: RequestUser, dto: CreateOrderDto): Promise<OrderListItemDto> {
    const reserved: Array<{ productId: string; quantity: number }> = [];
    const orderItems: OrderItemEntity[] = [];

    try {
      for (const item of dto.items) {
        const product = await this.productClient.getProduct(item.productId);
        await this.productClient.reserveStock(item.productId, item.quantity);
        reserved.push({ productId: item.productId, quantity: item.quantity });

        orderItems.push({
          id: undefined as unknown as string,
          orderId: undefined as unknown as string,
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: Number(product.price),
        } as OrderItemEntity);
      }
    } catch (error) {
      await this.rollbackStock(reserved);
      throw error;
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    const order = this.ordersRepository.create({
      userId: user.id,
      customerName: user.fullName,
      customerEmail: user.email,
      totalAmount,
      status: OrderStatus.CONFIRMED,
      items: orderItems,
    });

    const saved = await this.ordersRepository.save(order);
    await this.auditClient.log({
      userId: user.id,
      action: 'ORDER_CREATE',
      entity: 'order',
      entityId: saved.id,
      metadata: { totalAmount },
    });

    return this.toListItem(saved);
  }

  async findAll(
    user: RequestUser,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<OrderListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const userId = user.role === UserRole.ADMIN ? undefined : user.id;
    const [orders, total] = await this.ordersRepository.findAllPaginated(
      query,
      userId,
    );

    return {
      data: orders.map((order) => this.toListItem(order)),
      meta: buildPaginatedMeta(total, page, limit),
    };
  }

  async findOne(user: RequestUser, id: string): Promise<OrderListItemDto> {
    const order = await this.getOrderOrFail(id);
    this.assertAccess(user, order);
    return this.toListItem(order);
  }

  async update(
    user: RequestUser,
    id: string,
    dto: UpdateOrderDto,
  ): Promise<OrderListItemDto> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update order status');
    }

    const order = await this.getOrderOrFail(id);

    if (
      dto.status === OrderStatus.CANCELLED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      for (const item of order.items) {
        await this.productClient.releaseStock(item.productId, item.quantity);
      }
    }

    order.status = dto.status;
    const updated = await this.ordersRepository.save(order);

    await this.auditClient.log({
      userId: user.id,
      action: 'ORDER_STATUS_UPDATE',
      entity: 'order',
      entityId: id,
      metadata: { status: dto.status },
    });

    return this.toListItem(updated);
  }

  async remove(user: RequestUser, id: string): Promise<{ message: string }> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete orders');
    }

    const order = await this.getOrderOrFail(id);

    if (order.status !== OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await this.productClient.releaseStock(item.productId, item.quantity);
      }
    }

    await this.ordersRepository.remove(order);
    await this.auditClient.log({
      userId: user.id,
      action: 'ORDER_DELETE',
      entity: 'order',
      entityId: id,
    });

    return { message: 'Order deleted successfully' };
  }

  private async getOrderOrFail(id: string): Promise<OrderEntity> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }
    return order;
  }

  private assertAccess(user: RequestUser, order: OrderEntity): void {
    if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
  }

  private toListItem(order: OrderEntity): OrderListItemDto {
    return {
      id: order.id,
      userId: order.userId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      products: (order.items ?? []).map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    };
  }

  private async rollbackStock(
    reserved: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    for (const item of reserved) {
      await this.productClient.releaseStock(item.productId, item.quantity);
    }
  }
}
