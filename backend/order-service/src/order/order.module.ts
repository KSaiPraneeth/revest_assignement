import { Module } from '@nestjs/common';
import { ProductClientModule } from '../product-client/product-client.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [ProductClientModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
