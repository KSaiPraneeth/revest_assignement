import { HttpService } from '@nestjs/axios';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { ProductClient } from './product.client';

function mockAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}

describe('ProductClient', () => {
  let client: ProductClient;
  let http: jest.Mocked<HttpService>;

  beforeEach(async () => {
    http = {
      get: jest.fn(),
      post: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductClient,
        { provide: HttpService, useValue: http },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3001'),
          },
        },
      ],
    }).compile();

    client = module.get(ProductClient);
  });

  it('uses internal product endpoint for getProduct (regression)', async () => {
    http.get.mockReturnValue(
      of(
        mockAxiosResponse({
          success: true,
          data: { id: 'prod-1', name: 'Widget', price: 10, quantity: 5 },
        }),
      ),
    );

    const product = await client.getProduct('prod-1');

    expect(http.get).toHaveBeenCalledWith(
      'http://localhost:3001/internal/products/prod-1',
    );
    expect(product.name).toBe('Widget');
  });

  it('maps 404 responses to NotFoundException', async () => {
    const error = new AxiosError(
      'Not Found',
      '404',
      undefined,
      undefined,
      {
        status: 404,
        data: { message: 'Product missing' },
        statusText: 'Not Found',
        headers: {},
        config: { headers: new AxiosHeaders() },
      },
    );
    http.get.mockReturnValue(throwError(() => error));

    await expect(client.getProduct('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('maps other 4xx responses to BadGatewayException', async () => {
    const error = new AxiosError(
      'Unauthorized',
      '401',
      undefined,
      undefined,
      {
        status: 401,
        data: { message: 'Unauthorized' },
        statusText: 'Unauthorized',
        headers: {},
        config: { headers: new AxiosHeaders() },
      },
    );
    http.get.mockReturnValue(throwError(() => error));

    await expect(client.getProduct('prod-1')).rejects.toThrow(
      BadGatewayException,
    );
  });

  it('reserves stock via internal endpoint', async () => {
    http.post.mockReturnValue(
      of(
        mockAxiosResponse({
          success: true,
          data: { id: 'prod-1', quantity: 3 },
        }),
      ),
    );

    await client.reserveStock('prod-1', 2);

    expect(http.post).toHaveBeenCalledWith(
      'http://localhost:3001/internal/products/prod-1/reserve',
      { quantity: 2 },
    );
  });
});
