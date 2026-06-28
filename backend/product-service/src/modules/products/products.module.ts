import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditClientModule } from '../../clients/audit-client/audit-client.module';
import { ProductSeedService } from '../../database/product-seed.service';
import { ProductsController } from './controllers/products.controller';
import { ProductsInternalController } from './controllers/products-internal.controller';
import { ProductEntity } from './entities/product.entity';
import { ProductsRepository } from './repositories/products.repository';
import { ProductsService } from './services/products.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), AuditClientModule],
  controllers: [ProductsController, ProductsInternalController],
  providers: [ProductsService, ProductsRepository, ProductSeedService],
  exports: [ProductsService],
})
export class ProductsModule {}
