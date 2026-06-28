import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles, RolesGuard } from '../../../common/guards/roles.guard';
import { RequestUser, UserRole } from '../../../common/interfaces/auth.interface';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { ProductsService } from '../services/products.service';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Browse products' })
  findAll(
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const filters =
      user.role === UserRole.ADMIN ? query : { ...query, active: true };
    return this.productsService.findAll(filters);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: RequestUser,
    @Ip() ip: string,
  ) {
    return this.productsService.create(dto, user.id, ip);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: RequestUser,
    @Ip() ip: string,
  ) {
    return this.productsService.update(id, dto, user.id, ip);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Ip() ip: string,
  ) {
    await this.productsService.remove(id, user.id, ip);
    return { message: 'Product deleted successfully' };
  }
}
