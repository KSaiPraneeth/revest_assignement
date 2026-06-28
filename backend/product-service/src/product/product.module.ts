import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductMicroserviceController } from './product.microservice.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController, ProductMicroserviceController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
