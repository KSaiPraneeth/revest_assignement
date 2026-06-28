import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';

@Controller()
export class ProductMicroserviceController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'get_product' })
  getProduct(@Payload() data: { id: string }) {
    return this.productService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'get_products_by_ids' })
  getProductsByIds(@Payload() data: { ids: string[] }) {
    return this.productService.findByIds(data.ids);
  }

  @MessagePattern({ cmd: 'reserve_stock' })
  reserveStock(@Payload() data: { productId: string; quantity: number }) {
    return this.productService.reserveStock(data.productId, data.quantity);
  }

  @MessagePattern({ cmd: 'release_stock' })
  releaseStock(@Payload() data: { productId: string; quantity: number }) {
    return this.productService.releaseStock(data.productId, data.quantity);
  }
}
