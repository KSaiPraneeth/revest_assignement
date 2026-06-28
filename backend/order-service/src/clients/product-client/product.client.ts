import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ProductSnapshot } from './product-client.interface';

interface ApiWrappedResponse<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class ProductClient {
  private readonly logger = new Logger(ProductClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl =
      configService.get<string>('productService.baseUrl') ??
      'http://localhost:3001';
  }

  async getProduct(id: string): Promise<ProductSnapshot> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiWrappedResponse<ProductSnapshot>>(
          `${this.baseUrl}/internal/products/${id}`,
        ),
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error, `Product ${id} not found`);
    }
  }

  async reserveStock(
    productId: string,
    quantity: number,
  ): Promise<ProductSnapshot> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiWrappedResponse<ProductSnapshot>>(
          `${this.baseUrl}/internal/products/${productId}/reserve`,
          { quantity },
        ),
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error, `Failed to reserve stock for product ${productId}`);
    }
  }

  async releaseStock(
    productId: string,
    quantity: number,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/internal/products/${productId}/release`,
          { quantity },
        ),
      );
    } catch (error) {
      this.logger.warn(
        `Failed to release stock for product ${productId}: ${this.extractMessage(error)}`,
      );
    }
  }

  private handleError(error: unknown, fallbackMessage: string): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = this.extractMessage(error);

      if (status === 404) {
        throw new NotFoundException(message || fallbackMessage);
      }

      if (status === 400) {
        throw new BadRequestException(message || fallbackMessage);
      }

      if (status && status >= 400 && status < 500) {
        throw new BadGatewayException(message || fallbackMessage);
      }
    }

    throw new BadGatewayException(fallbackMessage);
  }

  private extractMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      const data = error.response?.data as
        | { message?: string | string[] }
        | undefined;
      if (Array.isArray(data?.message)) {
        return data.message.join(', ');
      }
      return data?.message ?? error.message;
    }
    return 'Unknown error';
  }
}
