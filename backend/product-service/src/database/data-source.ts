import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ProductEntity } from '../modules/products/entities/product.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'revest',
  password: process.env.DB_PASSWORD ?? 'revest_secret',
  database: process.env.DB_NAME ?? 'product_db',
  entities: [ProductEntity],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
