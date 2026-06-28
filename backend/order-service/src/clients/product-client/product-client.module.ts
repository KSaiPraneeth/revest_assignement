import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProductClient } from './product.client';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
  ],
  providers: [ProductClient],
  exports: [ProductClient],
})
export class ProductClientModule {}
