import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { ProductResponseDto } from '../dto/product.dto';
import { ProductsService } from '../services/products.service';

class ReserveStockDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

@ApiTags('Internal')
@Controller('internal/products')
export class ProductsInternalController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id (internal — Order Service)' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Post(':id/reserve')
  @ApiOperation({ summary: 'Reserve product stock (internal — Order Service)' })
  reserve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReserveStockDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.reserveStock(id, dto.quantity);
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Release product stock (internal — Order Service)' })
  release(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReserveStockDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.releaseStock(id, dto.quantity);
  }
}
