import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { OrderEntity, OrderStatus } from '../entities/order.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {}

  create(data: Partial<OrderEntity>): OrderEntity {
    return this.repository.create(data);
  }

  save(order: OrderEntity): Promise<OrderEntity> {
    return this.repository.save(order);
  }

  findById(id: string): Promise<OrderEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAllPaginated(
    query: PaginationQueryDto,
    userId?: string,
  ): Promise<[OrderEntity[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    if (userId) {
      qb.andWhere('order.userId = :userId', { userId });
    }

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    qb.orderBy('order.createdAt', 'DESC').skip(skip).take(limit);

    return qb.getManyAndCount();
  }

  async remove(order: OrderEntity): Promise<void> {
    await this.repository.remove(order);
  }
}

export { OrderStatus };
